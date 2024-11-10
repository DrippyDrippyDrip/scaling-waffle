use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, MintTo, Mint};
use solana_program::program_error::ProgramError;
use solana_program::clock::Clock;
use crate::error::ProtocolError;
use crate::state::*;
use crate::instruction::*;

// Constants
pub const MIN_APY: u64 = 0;
pub const MAX_APY: u64 = 1000; // 10% max APY
pub const APY_ADJUSTMENT_INTERVAL: i64 = 24 * 60 * 60; // 24 hours
pub const EMERGENCY_WITHDRAWAL_PENALTY: u64 = 20; // 20%
pub const EMERGENCY_COOLDOWN: i64 = 7 * 24 * 60 * 60; // 7 days
pub const MAX_BATCH_SIZE: u64 = 10; // Process 10 withdrawals at a time

// Core Protocol Functions
pub fn initialize(ctx: Context<Initialize>, config: ProtocolConfig) -> Result<()> {
    let staking_state = &mut ctx.accounts.staking_state;
    staking_state.authority = ctx.accounts.authority.key();
    staking_state.current_apy = config.base_apy;
    staking_state.min_stake = config.min_stake;
    staking_state.max_stake = config.max_stake;
    staking_state.emergency_cooldown = config.emergency_cooldown;
    staking_state.paused = false;
    staking_state.total_staked = 0;
    staking_state.total_rewards_distributed = 0;
    staking_state.last_apy_update = Clock::get()?.unix_timestamp;
    staking_state.next_apy_update = Clock::get()?.unix_timestamp + APY_ADJUSTMENT_INTERVAL;

    let treasury_state = &mut ctx.accounts.treasury_state;
    treasury_state.authority = ctx.accounts.authority.key();
    treasury_state.withdrawal_limit = config.withdrawal_limit;
    treasury_state.required_signatures = 3; // Default multisig requirement
    treasury_state.total_balance = 0;
    treasury_state.last_withdrawal = 0;
    treasury_state.cooldown_period = config.emergency_cooldown;
    treasury_state.signers = vec![ctx.accounts.authority.key(); 5]; // Initialize with authority as signer
    treasury_state.active_proposals = 0;
    treasury_state.total_distributed = 0;
    treasury_state.emergency_reserve = 0;
    treasury_state.last_drain_time = 0;

    let governance_state = &mut ctx.accounts.governance_state;
    governance_state.current_apy = config.base_apy;
    governance_state.voting_period = config.voting_period;
    governance_state.proposal_count = 0;

    Ok(())
}

// Token Management
pub fn mint_tokens(ctx: Context<MintTokens>, amount: u64) -> Result<()> {
    // Verify authority
    require!(
        ctx.accounts.authority.key() == ctx.accounts.mint_authority.key(),
        ProtocolError::InvalidAuthority
    );

    // Create mint instruction
    let cpi_accounts = MintTo {
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.destination.to_account_info(),
        authority: ctx.accounts.mint_authority.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

    // Execute mint
    token::mint_to(cpi_ctx, amount)?;

    emit!(TokenMintEvent {
        amount,
        destination: ctx.accounts.destination.key(),
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}

// Staking Operations
pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
    let staking_state = &mut ctx.accounts.staking_state;
    let user_info = &mut ctx.accounts.user_stake_info;
    let current_time = Clock::get()?.unix_timestamp;

    // Validate protocol is active
    require!(!staking_state.paused, ProtocolError::ProtocolPaused);

    // Validate stake amount
    require!(
        amount >= staking_state.min_stake && amount <= staking_state.max_stake,
        ProtocolError::InvalidStakeAmount
    );

    // Transfer tokens to protocol
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.protocol_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        },
    );
    token::transfer(transfer_ctx, amount)?;

    // Calculate pending rewards before updating stake
    if user_info.staked_amount > 0 {
        let pending_rewards = user_info.calculate_rewards(
            current_time,
            staking_state.current_apy,
        )?;
        user_info.rewards_tally = user_info.rewards_tally.checked_add(pending_rewards)
            .ok_or(ProgramError::Overflow)?;
    }

    // Update user stake info
    user_info.staked_amount = user_info.staked_amount.checked_add(amount)
        .ok_or(ProgramError::Overflow)?;
    user_info.last_reward_time = current_time;
    user_info.update_tier(user_info.staked_amount, current_time)?;
    user_info.auto_compound = false; // Default setting

    // Update protocol state
    staking_state.total_staked = staking_state.total_staked.checked_add(amount)
        .ok_or(ProgramError::Overflow)?;

    emit!(StakeEvent {
        user: ctx.accounts.user.key(),
        amount,
        new_total: user_info.staked_amount,
        tier: user_info.tier,
        timestamp: current_time,
    });

    Ok(())
}

pub fn unstake(ctx: Context<Unstake>, amount: u64) -> Result<()> {
    let staking_state = &mut ctx.accounts.staking_state;
    let user_info = &mut ctx.accounts.user_stake_info;
    let current_time = Clock::get()?.unix_timestamp;

    // Validate protocol is active
    require!(!staking_state.paused, ProtocolError::ProtocolPaused);

    // Validate unstake amount
    require!(
        amount <= user_info.staked_amount,
        ProtocolError::InvalidUnstakeAmount
    );

    // Calculate and distribute pending rewards
    let pending_rewards = user_info.calculate_rewards(
        current_time,
        staking_state.current_apy,
    )?;

    if user_info.auto_compound {
        user_info.staked_amount = user_info.staked_amount.checked_add(pending_rewards)
            .ok_or(ProgramError::Overflow)?;
        staking_state.total_staked = staking_state.total_staked.checked_add(pending_rewards)
            .ok_or(ProgramError::Overflow)?;
        user_info.rewards_tally = 0;
        emit!(RewardsCompoundedEvent {
            user: ctx.accounts.user.key(),
            compounded_amount: pending_rewards,
            new_total_stake: user_info.staked_amount,
            timestamp: current_time,
        });
    } else {
        let total_transfer = amount.checked_add(pending_rewards)
            .ok_or(ProgramError::Overflow)?;

        // Transfer unstaked tokens + rewards
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.protocol_token_account.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.protocol_authority.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, total_transfer)?;
    }

    // Update user stake info
    user_info.staked_amount = user_info.staked_amount.checked_sub(amount)
        .ok_or(ProgramError::Overflow)?;
    user_info.last_reward_time = current_time;
    user_info.cumulative_rewards = user_info.cumulative_rewards.checked_add(pending_rewards)
        .ok_or(ProgramError::Overflow)?;
    user_info.update_tier(user_info.staked_amount, current_time)?;

    // Update protocol state
    staking_state.total_staked = staking_state.total_staked.checked_sub(amount)
        .ok_or(ProgramError::Overflow)?;
    staking_state.total_rewards_distributed = staking_state.total_rewards_distributed
        .checked_add(pending_rewards)
        .ok_or(ProgramError::Overflow)?;

    emit!(UnstakeEvent {
        user: ctx.accounts.user.key(),
        amount,
        rewards: pending_rewards,
        new_total: user_info.staked_amount,
        timestamp: current_time,
    });

    Ok(())
}

// Additional Staking Features
pub fn compound_rewards(ctx: Context<CompoundRewards>) -> Result<()> {
    let staking_state = &mut ctx.accounts.staking_state;
    let user_info = &mut ctx.accounts.user_stake_info;
    let current_time = Clock::get()?.unix_timestamp;

    // Calculate pending rewards
    let pending_rewards = user_info.calculate_rewards(
        current_time,
        staking_state.current_apy,
    )?;

    // Update user stake with rewards
    user_info.staked_amount = user_info.staked_amount.checked_add(pending_rewards)
        .ok_or(ProgramError::Overflow)?;
    user_info.last_reward_time = current_time;

    // Reset rewards tally
    user_info.rewards_tally = 0;
    user_info.cumulative_rewards = user_info.cumulative_rewards.checked_add(pending_rewards)
        .ok_or(ProgramError::Overflow)?;

    // Update protocol state
    staking_state.total_staked = staking_state.total_staked.checked_add(pending_rewards)
        .ok_or(ProgramError::Overflow)?;
    staking_state.total_rewards_distributed = staking_state.total_rewards_distributed
        .checked_add(pending_rewards)
        .ok_or(ProgramError::Overflow)?;

    emit!(RewardsCompoundedEvent {
        user: ctx.accounts.user.key(),
        compounded_amount: pending_rewards,
        new_total_stake: user_info.staked_amount,
        timestamp: current_time,
    });

    Ok(())
}

pub fn delegate_stake(ctx: Context<DelegateStake>, amount: u64) -> Result<()> {
    let user_info = &mut ctx.accounts.user_stake_info;
    let delegatee_info = &mut ctx.accounts.delegatee_stake_info;

    // Validate amount
    require!(amount <= user_info.staked_amount, ProtocolError::InsufficientBalance);

    // Update delegation info
    user_info.delegated_stake = user_info.delegated_stake.checked_add(amount)
        .ok_or(ProgramError::Overflow)?;
    user_info.staked_amount = user_info.staked_amount.checked_sub(amount)
        .ok_or(ProgramError::Overflow)?;

    // Update delegatee's stake
    delegatee_info.staked_amount = delegatee_info.staked_amount.checked_add(amount)
        .ok_or(ProgramError::Overflow)?;

    emit!(StakeDelegatedEvent {
        delegator: ctx.accounts.user.key(),
        delegatee: delegatee_info.owner,
        amount,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}

// APY Management
pub fn update_apy(ctx: Context<UpdateApy>, new_apy: u64) -> Result<()> {
    let staking_state = &mut ctx.accounts.staking_state;
    let current_time = Clock::get()?.unix_timestamp;

    // Validate authority
    require!(
        ctx.accounts.authority.key() == staking_state.authority,
        ProtocolError::InvalidAuthority
    );

    // Validate APY bounds
    require!(
        new_apy >= MIN_APY && new_apy <= MAX_APY,
        ProtocolError::InvalidAPY
    );

    // Validate update timing
    require!(
        current_time >= staking_state.next_apy_update,
        ProtocolError::UpdateTooEarly
    );

    // Update APY and timing
    let old_apy = staking_state.current_apy;
    staking_state.current_apy = new_apy;
    staking_state.last_apy_update = current_time;
    staking_state.next_apy_update = current_time + APY_ADJUSTMENT_INTERVAL;

    emit!(ApyUpdateEvent {
        old_apy,
        new_apy,
        next_update: staking_state.next_apy_update,
        authority: ctx.accounts.authority.key(),
    });

    Ok(())
}

// Emergency Operations
pub fn emergency_withdraw(ctx: Context<EmergencyWithdraw>, amount: u64) -> Result<()> {
    let staking_state = &ctx.accounts.staking_state;
    let user_info = &mut ctx.accounts.user_stake_info;
    let current_time = Clock::get()?.unix_timestamp;

    // Validate withdrawal conditions
    require!(
        user_info.can_emergency_withdraw(current_time, staking_state.emergency_cooldown),
        ProtocolError::EmergencyWithdrawCooldown
    );

    require!(
        amount <= user_info.staked_amount,
        ProtocolError::InsufficientBalance
    );

    // Calculate withdrawal penalty
    let penalty = amount.checked_mul(EMERGENCY_WITHDRAWAL_PENALTY)
        .ok_or(ProgramError::Overflow)?
        .checked_div(100)
        .ok_or(ProgramError::Overflow)?;

    let withdrawal_amount = amount.checked_sub(penalty)
        .ok_or(ProgramError::Overflow)?;

    // Transfer tokens with penalty
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.protocol_token_account.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.protocol_authority.to_account_info(),
        },
    );
    token::transfer(transfer_ctx, withdrawal_amount)?;

    // Update user state
    user_info.staked_amount = user_info.staked_amount.checked_sub(amount)
        .ok_or(ProgramError::Overflow)?;
    user_info.last_emergency_withdraw = current_time;

    emit!(EmergencyWithdrawEvent {
        user: ctx.accounts.user.key(),
        amount,
        penalty,
        timestamp: current_time,
    });

    Ok(())
}

// Withdrawal Queue Management
pub fn join_withdrawal_queue(ctx: Context<JoinQueue>, amount: u64) -> Result<()> {
    let withdrawal_state = &mut ctx.accounts.withdrawal_state;
    let user_info = &mut ctx.accounts.user_stake_info;
    let current_time = Clock::get()?.unix_timestamp;

    // Validate queue is active
    require!(!withdrawal_state.paused, ProtocolError::WithdrawalsDisabled);

    // Validate amount
    require!(
        amount <= user_info.staked_amount,
        ProtocolError::InsufficientBalance
    );

    // Create withdrawal request
    withdrawal_state.total_queued = withdrawal_state.total_queued.checked_add(amount)
        .ok_or(ProgramError::Overflow)?;
    withdrawal_state.queue_tail = withdrawal_state.queue_tail.checked_add(1)
        .ok_or(ProgramError::Overflow)?;

    // Update user state
    user_info.withdrawal_pending = true;
    user_info.withdrawal_amount = amount;

    emit!(WithdrawalQueueEvent {
        user: ctx.accounts.user.key(),
        amount,
        position: withdrawal_state.queue_tail,
        timestamp: current_time,
    });

    Ok(())
}

pub fn process_withdrawal_queue(ctx: Context<ProcessQueue>) -> Result<()> {
    let withdrawal_state = &mut ctx.accounts.withdrawal_state;
    let current_time = Clock::get()?.unix_timestamp;

    // Validate authority
    require!(
        ctx.accounts.authority.key() == withdrawal_state.authority,
        ProtocolError::InvalidAuthority
    );

    // Process up to MAX_BATCH_SIZE requests
    let mut processed = 0;
    while processed < MAX_BATCH_SIZE && withdrawal_state.queue_head < withdrawal_state.queue_tail {
        let request = &ctx.accounts.withdrawal_requests[processed as usize];

        if !request.processed {
            // Process withdrawal
            let transfer_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.protocol_token_account.to_account_info(),
                    to: ctx.accounts.user_token_accounts[processed as usize].to_account_info(),
                    authority: ctx.accounts.protocol_authority.to_account_info(),
                },
            );
            token::transfer(transfer_ctx, request.amount)?;

            // Update request status
            let request_mut = &mut ctx.accounts.withdrawal_requests[processed as usize];
            request_mut.processed = true;
        }

        withdrawal_state.queue_head = withdrawal_state.queue_head.checked_add(1)
            .ok_or(ProgramError::Overflow)?;
        processed += 1;
    }

    withdrawal_state.last_process_time = current_time;

    emit!(QueueProcessedEvent {
        processed_count: processed,
        remaining: withdrawal_state.queue_tail - withdrawal_state.queue_head,
        timestamp: current_time,
    });

    Ok(())
}

// Bonding Operations
pub fn create_bond(ctx: Context<CreateBond>, bond_type: BondType, amount: u64) -> Result<()> {
    let bonding_state = &mut ctx.accounts.bonding_state;
    let user_bond_info = &mut ctx.accounts.user_bond_info;
    let current_time = Clock::get()?.unix_timestamp;

    // Validate bond type
    require!(
        bonding_state.validate_bond_type(bond_type),
        ProtocolError::InvalidBondType
    );

    // Validate amount
    require!(amount > 0, ProtocolError::InvalidBondAmount);

    // Transfer tokens to treasury
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.treasury_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        },
    );
    token::transfer(transfer_ctx, amount)?;

    // Create bond
    user_bond_info.bond_type = bond_type;
    user_bond_info.amount = amount;
    user_bond_info.creation_time = current_time;
    user_bond_info.maturation_time = current_time + bonding_state.get_bond_duration(bond_type)?;
    user_bond_info.claimed = false;

    // Update bonding state
    bonding_state.total_bonded = bonding_state.total_bonded.checked_add(amount)
        .ok_or(ProgramError::Overflow)?;

    emit!(CreateBondEvent {
        user: ctx.accounts.user.key(),
        bond_type,
        amount,
        maturation_time: user_bond_info.maturation_time,
        timestamp: current_time,
    });

    Ok(())
}

pub fn claim_bond(ctx: Context<ClaimBond>) -> Result<()> {
    let bonding_state = &ctx.accounts.bonding_state;
    let user_bond_info = &mut ctx.accounts.user_bond_info;
    let current_time = Clock::get()?.unix_timestamp;

    // Check if bond has matured
    require!(
        current_time >= user_bond_info.maturation_time,
        ProtocolError::BondNotMatured
    );

    // Check if already claimed
    require!(!user_bond_info.claimed, ProtocolError::BondAlreadyClaimed);

    // Calculate rewards
    let reward = bonding_state.calculate_bond_reward(
        user_bond_info.bond_type,
        user_bond_info.amount,
    )?;

    // Transfer principal + rewards from treasury to user
    let total_payout = user_bond_info.amount.checked_add(reward)
        .ok_or(ProgramError::Overflow)?;

    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.treasury_account.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.treasury_authority.to_account_info(),
        },
    );
    token::transfer(transfer_ctx, total_payout)?;

    // Update user bond info
    user_bond_info.claimed = true;

    // Update bonding state
    bonding_state.total_bonded = bonding_state.total_bonded.checked_sub(user_bond_info.amount)
        .ok_or(ProgramError::Overflow)?;

    emit!(ClaimBondEvent {
        user: ctx.accounts.user.key(),
        amount: user_bond_info.amount,
        reward,
        timestamp: current_time,
    });

    Ok(())
}

// Treasury Operations
pub fn treasury_withdraw(ctx: Context<TreasuryWithdraw>, amount: u64) -> Result<()> {
    let treasury_state = &mut ctx.accounts.treasury_state;

    // Validate multisig signatures
    require!(
        ctx.accounts.signers.len() >= treasury_state.required_signatures as usize,
        ProtocolError::InsufficientSignatures
    );

    // Check withdrawal limits
    require!(
        amount <= treasury_state.withdrawal_limit,
        ProtocolError::WithdrawalLimitExceeded
    );

    // Check cooldown period
    let current_time = Clock::get()?.unix_timestamp;
    require!(
        current_time - treasury_state.last_withdrawal >= treasury_state.cooldown_period,
        ProtocolError::CooldownPeriodActive
    );

    // Transfer tokens from treasury to destination
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.treasury_account.to_account_info(),
            to: ctx.accounts.destination_account.to_account_info(),
            authority: ctx.accounts.treasury_authority.to_account_info(),
        },
    );
    token::transfer(transfer_ctx, amount)?;

    // Update treasury state
    treasury_state.total_balance = treasury_state.total_balance.checked_sub(amount)
        .ok_or(ProgramError::Overflow)?;
    treasury_state.last_withdrawal = current_time;

    emit!(TreasuryWithdrawEvent {
        amount,
        destination: ctx.accounts.destination_account.key(),
        timestamp: current_time,
    });

    Ok(())
}

// Governance Controls
pub fn create_proposal(ctx: Context<CreateProposal>, proposal_data: ProposalData) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;
    let governance_state = &mut ctx.accounts.governance_state;
    let current_time = Clock::get()?.unix_timestamp;

    // Initialize proposal
    proposal.proposal_id = governance_state.proposal_count;
    proposal.author = ctx.accounts.author.key();
    proposal.data = proposal_data;
    proposal.creation_time = current_time;
    proposal.end_time = current_time + governance_state.voting_period;
    proposal.executed = false;
    proposal.for_votes = 0;
    proposal.against_votes = 0;
    proposal.voters = vec![];

    // Increment proposal count
    governance_state.proposal_count = governance_state.proposal_count.checked_add(1)
        .ok_or(ProgramError::Overflow)?;

    emit!(ProposalCreatedEvent {
        proposal_id: proposal.proposal_id,
        author: proposal.author,
        timestamp: proposal.creation_time,
    });

    Ok(())
}

pub fn vote(ctx: Context<Vote>, support: bool) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;
    let current_time = Clock::get()?.unix_timestamp;

    // Ensure voting is active
    require!(
        current_time < proposal.end_time,
        ProtocolError::VotingPeriodEnded
    );

    // Ensure voter has not already voted
    require!(
        !proposal.voters.contains(&ctx.accounts.voter.key()),
        ProtocolError::AlreadyVoted
    );

    // Record vote
    if support {
        proposal.for_votes = proposal.for_votes.checked_add(1).ok_or(ProgramError::Overflow)?;
    } else {
        proposal.against_votes = proposal.against_votes.checked_add(1).ok_or(ProgramError::Overflow)?;
    }
    proposal.voters.push(ctx.accounts.voter.key());

    emit!(VoteCastEvent {
        proposal_id: proposal.proposal_id,
        voter: ctx.accounts.voter.key(),
        support,
        timestamp: current_time,
    });

    Ok(())
}

pub fn execute_proposal(ctx: Context<ExecuteProposal>) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;
    let governance_state = &mut ctx.accounts.governance_state;
    let current_time = Clock::get()?.unix_timestamp;

    // Ensure voting has ended
    require!(
        current_time >= proposal.end_time,
        ProtocolError::VotingPeriodActive
    );

    // Ensure proposal has not been executed
    require!(!proposal.executed, ProtocolError::ProposalAlreadyExecuted);

    // Check if proposal passed
    require!(
        proposal.for_votes > proposal.against_votes,
        ProtocolError::ProposalNotPassed
    );

    // Execute proposal action
    governance_state.execute_proposal_action(&proposal.data)?;

    // Mark proposal as executed
    proposal.executed = true;

    emit!(ProposalExecutedEvent {
        proposal_id: proposal.proposal_id,
        executor: ctx.accounts.executor.key(),
        timestamp: current_time,
    });

    Ok(())
}

// Events
#[event]
pub struct TokenMintEvent {
    pub amount: u64,
    pub destination: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct StakeEvent {
    pub user: Pubkey,
    pub amount: u64,
    pub new_total: u64,
    pub tier: u8,
    pub timestamp: i64,
}

#[event]
pub struct UnstakeEvent {
    pub user: Pubkey,
    pub amount: u64,
    pub rewards: u64,
    pub new_total: u64,
    pub timestamp: i64,
}

#[event]
pub struct RewardsCompoundedEvent {
    pub user: Pubkey,
    pub compounded_amount: u64,
    pub new_total_stake: u64,
    pub timestamp: i64,
}

#[event]
pub struct ApyUpdateEvent {
    pub old_apy: u64,
    pub new_apy: u64,
    pub next_update: i64,
    pub authority: Pubkey,
}

#[event]
pub struct EmergencyWithdrawEvent {
    pub user: Pubkey,
    pub amount: u64,
    pub penalty: u64,
    pub timestamp: i64,
}

#[event]
pub struct WithdrawalQueueEvent {
    pub user: Pubkey,
    pub amount: u64,
    pub position: u64,
    pub timestamp: i64,
}

#[event]
pub struct QueueProcessedEvent {
    pub processed_count: u64,
    pub remaining: u64,
    pub timestamp: i64,
}

#[event]
pub struct CreateBondEvent {
    pub user: Pubkey,
    pub bond_type: BondType,
    pub amount: u64,
    pub maturation_time: i64,
    pub timestamp: i64,
}

#[event]
pub struct ClaimBondEvent {
    pub user: Pubkey,
    pub amount: u64,
    pub reward: u64,
    pub timestamp: i64,
}

#[event]
pub struct TreasuryWithdrawEvent {
    pub amount: u64,
    pub destination: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct TreasuryConfigUpdateEvent {
    pub authority: Pubkey,
    pub new_withdrawal_limit: u64,
    pub required_signatures: u8,
    pub cooldown_period: i64,
    pub timestamp: i64,
}

#[event]
pub struct TreasuryDrainEvent {
    pub amount: u64,
    pub destination: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct StakeDelegatedEvent {
    pub delegator: Pubkey,
    pub delegatee: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct ProposalCreatedEvent {
    pub proposal_id: u64,
    pub author: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct VoteCastEvent {
    pub proposal_id: u64,
    pub voter: Pubkey,
    pub support: bool,
    pub timestamp: i64,
}

#[event]
pub struct ProposalExecutedEvent {
    pub proposal_id: u64,
    pub executor: Pubkey,
    pub timestamp: i64,
}