use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer};
use crate::state::*;
use crate::error::ProtocolError;

pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
    // Validate that the protocol is active
    require!(!ctx.accounts.staking_state.paused, ProtocolError::ProtocolPaused);

    // Validate stake amount
    require!(
        amount >= ctx.accounts.staking_state.min_stake && amount <= ctx.accounts.staking_state.max_stake,
        ProtocolError::InvalidStakeAmount
    );

    // Transfer tokens from the user to the protocol
    let cpi_accounts = Transfer {
        from: ctx.accounts.user_token_account.to_account_info(),
        to: ctx.accounts.protocol_token_account.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    token::transfer(
        CpiContext::new(cpi_program, cpi_accounts),
        amount,
    )?;

    // Update user stake information
    let user_info = &mut ctx.accounts.user_stake_info;
    user_info.owner = ctx.accounts.user.key();
    user_info.staked_amount = user_info.staked_amount.checked_add(amount)
        .ok_or(ProtocolError::Overflow)?;
    user_info.last_stake_timestamp = Clock::get()?.unix_timestamp;

    // Update protocol staking state
    let staking_state = &mut ctx.accounts.staking_state;
    staking_state.total_staked = staking_state.total_staked.checked_add(amount)
        .ok_or(ProtocolError::Overflow)?;

    // Emit an event (if applicable)
    emit!(StakeEvent {
        user: ctx.accounts.user.key(),
        amount,
        new_total: user_info.staked_amount,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct Stake<'info> {
    /// The user who is staking tokens
    #[account(mut)]
    pub user: Signer<'info>,

    /// The user's token account from which tokens will be transferred
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,

    /// The protocol's token account where tokens will be transferred to
    #[account(mut)]
    pub protocol_token_account: Account<'info, TokenAccount>,

    /// The staking state account that keeps track of the protocol's staking information
    #[account(mut)]
    pub staking_state: Account<'info, StakingState>,

    /// The user's stake information account
    #[account(mut)]
    pub user_stake_info: Account<'info, UserStakeInfo>,

    /// The token program
    pub token_program: Program<'info, Token>,
}