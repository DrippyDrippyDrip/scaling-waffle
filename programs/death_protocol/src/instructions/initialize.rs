use anchor_lang::prelude::*;
use crate::state::*;

/// The `initialize` function sets up the initial state of the protocol.
pub fn initialize(ctx: Context<Initialize>, config: ProtocolConfig) -> Result<()> {
    let staking_state = &mut ctx.accounts.staking_state;
    let treasury_state = &mut ctx.accounts.treasury_state;
    let governance_state = &mut ctx.accounts.governance_state;

    // Initialize Staking State
    staking_state.authority = ctx.accounts.authority.key();
    staking_state.current_apy = config.base_apy;
    staking_state.min_stake = config.min_stake;
    staking_state.max_stake = config.max_stake;
    staking_state.emergency_cooldown = config.emergency_cooldown;
    staking_state.paused = false;
    staking_state.total_staked = 0;

    // Initialize Treasury State
    treasury_state.authority = ctx.accounts.authority.key();
    treasury_state.withdrawal_limit = config.withdrawal_limit;
    treasury_state.required_signatures = 3;
    treasury_state.total_balance = 0;

    // Initialize Governance State
    governance_state.current_apy = config.base_apy;
    governance_state.voting_period = config.voting_period;
    governance_state.required_quorum = 100;
    governance_state.proposal_count = 0;

    Ok(())
}

#[derive(Accounts)]
#[instruction(config: ProtocolConfig)]
pub struct Initialize<'info> {
    /// The authority account initializing the protocol.
    #[account(mut)]
    pub authority: Signer<'info>,

    /// The staking state account to be created.
    #[account(
        init,
        payer = authority,
        space = 8 + StakingState::LEN,
        seeds = [b"staking_state"],
        bump,
    )]
    pub staking_state: Account<'info, StakingState>,

    /// The treasury state account to be created.
    #[account(
        init,
        payer = authority,
        space = 8 + TreasuryState::LEN,
        seeds = [b"treasury_state"],
        bump,
    )]
    pub treasury_state: Account<'info, TreasuryState>,

    /// The governance state account to be created.
    #[account(
        init,
        payer = authority,
        space = 8 + GovernanceState::LEN,
        seeds = [b"governance_state"],
        bump,
    )]
    pub governance_state: Account<'info, GovernanceState>,

    /// System program account.
    pub system_program: Program<'info, System>,
}