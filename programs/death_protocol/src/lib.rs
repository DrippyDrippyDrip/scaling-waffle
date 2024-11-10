use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer};

pub mod error;
pub mod state;
pub mod instructions;

use crate::instructions::*;
use crate::error::ProtocolError;
use crate::state::*;

declare_id!("EMmqYXyEiJuBqSQFkpsXJLPPZVj6LbiaThEyMNgrYzXD");

#[program]
pub mod death_protocol {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, config: ProtocolConfig) -> Result<()> {
        let staking_state = &mut ctx.accounts.staking_state;
        let treasury_state = &mut ctx.accounts.treasury_state;
        let governance_state = &mut ctx.accounts.governance_state;

        staking_state.authority = ctx.accounts.authority.key();
        staking_state.current_apy = config.base_apy;
        staking_state.min_stake = config.min_stake;
        staking_state.max_stake = config.max_stake;
        staking_state.emergency_cooldown = config.emergency_cooldown;
        staking_state.paused = false;
        staking_state.total_staked = 0;

        treasury_state.authority = ctx.accounts.authority.key();
        treasury_state.withdrawal_limit = config.withdrawal_limit;
        treasury_state.required_signatures = 3;
        treasury_state.total_balance = 0;

        governance_state.current_apy = config.base_apy;
        governance_state.voting_period = config.voting_period;
        governance_state.required_quorum = 100;
        governance_state.proposal_count = 0;

        Ok(())
    }

    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        require!(!ctx.accounts.staking_state.paused, ProtocolError::ProtocolPaused);
        require!(
            amount >= ctx.accounts.staking_state.min_stake && 
            amount <= ctx.accounts.staking_state.max_stake,
            ProtocolError::InvalidStakeAmount
        );

        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.protocol_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                cpi_accounts
            ),
            amount
        )?;

        let user_info = &mut ctx.accounts.user_stake_info;
        user_info.owner = ctx.accounts.user.key();
        user_info.staked_amount = user_info.staked_amount
            .checked_add(amount)
            .ok_or(ProtocolError::Overflow)?;
        user_info.last_stake_timestamp = Clock::get()?.unix_timestamp;

        ctx.accounts.staking_state.total_staked = ctx.accounts.staking_state.total_staked
            .checked_add(amount)
            .ok_or(ProtocolError::Overflow)?;

        Ok(())
    }

    pub fn unstake(ctx: Context<Unstake>, amount: u64) -> Result<()> {
        let user_info = &mut ctx.accounts.user_stake_info;
        
        require!(
            amount <= user_info.staked_amount,
            ProtocolError::InvalidUnstakeAmount
        );

        let current_time = Clock::get()?.unix_timestamp;
        let rewards = user_info.calculate_rewards(
            current_time,
            ctx.accounts.staking_state.current_apy,
        )?;

        let total_transfer = amount.checked_add(rewards)
            .ok_or(ProtocolError::Overflow)?;

            let staking_state_seeds = &[
                b"staking_state".as_ref(),
                &[ctx.bumps.staking_state]
            ];
        let signer = &[&staking_state_seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.protocol_token_account.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.staking_state.to_account_info(),
        };

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                cpi_accounts,
                signer
            ),
            total_transfer
        )?;

        user_info.staked_amount = user_info.staked_amount
            .checked_sub(amount)
            .ok_or(ProtocolError::Overflow)?;
        user_info.rewards_claimed = user_info.rewards_claimed
            .checked_add(rewards)
            .ok_or(ProtocolError::Overflow)?;

        ctx.accounts.staking_state.total_staked = ctx.accounts.staking_state.total_staked
            .checked_sub(amount)
            .ok_or(ProtocolError::Overflow)?;

        Ok(())
    }

    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        let user_info = &mut ctx.accounts.user_stake_info;
        let current_time = Clock::get()?.unix_timestamp;
        
        let rewards = user_info.calculate_rewards(
            current_time,
            ctx.accounts.staking_state.current_apy,
        )?;

        require!(rewards > 0, ProtocolError::NoRewardsAvailable);

        let staking_state_seeds = &[
            b"staking_state".as_ref(),
            &[ctx.bumps.staking_state]
        ];
        let signer = &[&staking_state_seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.protocol_token_account.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.staking_state.to_account_info(),
        };

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                cpi_accounts,
                signer
            ),
            rewards
        )?;

        user_info.rewards_claimed = user_info.rewards_claimed
            .checked_add(rewards)
            .ok_or(ProtocolError::Overflow)?;
        user_info.last_stake_timestamp = current_time;

        Ok(())
    }

    pub fn create_proposal(ctx: Context<CreateProposal>, proposal_data: ProposalData) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let governance_state = &mut ctx.accounts.governance_state;
        let current_time = Clock::get()?.unix_timestamp;

        proposal.proposal_id = governance_state.proposal_count;
        proposal.author = ctx.accounts.author.key();
        proposal.data = proposal_data;
        proposal.creation_time = current_time;
        proposal.end_time = current_time + governance_state.voting_period;
        proposal.executed = false;
        proposal.for_votes = 0;
        proposal.against_votes = 0;
        proposal.voters = vec![];

        governance_state.proposal_count = governance_state.proposal_count
            .checked_add(1)
            .ok_or(ProtocolError::Overflow)?;

        Ok(())
    }

    pub fn vote(ctx: Context<Vote>, support: bool) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let user_info = &ctx.accounts.user_stake_info;
        let current_time = Clock::get()?.unix_timestamp;

        require!(
            current_time < proposal.end_time,
            ProtocolError::VotingPeriodEnded
        );

        require!(
            !proposal.has_voted(&ctx.accounts.voter.key()),
            ProtocolError::AlreadyVoted
        );

        if support {
            proposal.for_votes = proposal.for_votes
                .checked_add(user_info.staked_amount)
                .ok_or(ProtocolError::Overflow)?;
        } else {
            proposal.against_votes = proposal.against_votes
                .checked_add(user_info.staked_amount)
                .ok_or(ProtocolError::Overflow)?;
        }

        proposal.voters.push(ctx.accounts.voter.key());

        Ok(())
    }

    pub fn execute_proposal(ctx: Context<ExecuteProposal>) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let current_time = Clock::get()?.unix_timestamp;

        require!(
            current_time >= proposal.end_time,
            ProtocolError::VotingPeriodActive
        );

        require!(
            !proposal.executed,
            ProtocolError::ProposalNotPassed
        );

        require!(
            proposal.has_passed(ctx.accounts.governance_state.required_quorum),
            ProtocolError::ProposalNotPassed
        );

        match &proposal.data {
            ProposalData::UpdateApy { new_apy } => {
                ctx.accounts.staking_state.current_apy = *new_apy;
                ctx.accounts.governance_state.current_apy = *new_apy;
            },
            ProposalData::UpdateWithdrawalLimit { new_limit } => {
                ctx.accounts.treasury_state.withdrawal_limit = *new_limit;
            },
            ProposalData::UpdateVotingPeriod { new_period } => {
                ctx.accounts.governance_state.voting_period = *new_period;
            },
            ProposalData::UpdateQuorum { new_quorum } => {
                ctx.accounts.governance_state.required_quorum = *new_quorum;
            },
        }

        proposal.executed = true;

        Ok(())
    }
}