use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount};
use crate::state::*;



#[derive(Accounts)]
#[instruction(config: ProtocolConfig)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + StakingState::LEN,
        seeds = [b"staking_state"],
        bump
    )]
    pub staking_state: Account<'info, StakingState>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + TreasuryState::LEN,
        seeds = [b"treasury_state"],
        bump
    )]
    pub treasury_state: Account<'info, TreasuryState>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + GovernanceState::LEN,
        seeds = [b"governance_state"],
        bump
    )]
    pub governance_state: Account<'info, GovernanceState>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct Stake<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"staking_state"],
        bump
    )]
    pub staking_state: Account<'info, StakingState>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserStakeInfo::LEN,
        seeds = [b"user_stake", user.key().as_ref()],
        bump
    )]
    pub user_stake_info: Account<'info, UserStakeInfo>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub protocol_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct Unstake<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"staking_state"],
        bump
    )]
    pub staking_state: Account<'info, StakingState>,
    
    #[account(
        mut,
        constraint = user_stake_info.owner == user.key()
    )]
    pub user_stake_info: Account<'info, UserStakeInfo>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub protocol_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"staking_state"],
        bump
    )]
    pub staking_state: Account<'info, StakingState>,
    
    #[account(
        mut,
        constraint = user_stake_info.owner == user.key()
    )]
    pub user_stake_info: Account<'info, UserStakeInfo>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub protocol_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        constraint = staking_state.authority == authority.key()
    )]
    pub staking_state: Account<'info, StakingState>,
}

#[derive(Accounts)]
pub struct EmergencyWithdraw<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        constraint = staking_state.authority == authority.key()
    )]
    pub staking_state: Account<'info, StakingState>,
    
    #[account(mut)]
    pub protocol_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub destination_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct JoinWithdrawalQueue<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub withdrawal_state: Account<'info, WithdrawalState>,
    
    #[account(
        mut,
        constraint = user_stake_info.owner == user.key()
    )]
    pub user_stake_info: Account<'info, UserStakeInfo>,
}

#[derive(Accounts)]
pub struct ProcessWithdrawalQueue<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"withdrawal_state"],
        bump
    )]
    pub withdrawal_state: Account<'info, WithdrawalState>,
    
    #[account(mut)]
    pub protocol_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(mut)]
    pub author: Signer<'info>,
    
    #[account(mut)]
    pub governance_state: Account<'info, GovernanceState>,
    
    #[account(
        init,
        payer = author,
        space = 8 + std::mem::size_of::<Proposal>()
    )]
    pub proposal: Account<'info, Proposal>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(mut)]
    pub voter: Signer<'info>,
    
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    
    #[account(mut)]
    pub governance_state: Account<'info, GovernanceState>,
    
    #[account(
        constraint = user_stake_info.owner == voter.key()
    )]
    pub user_stake_info: Account<'info, UserStakeInfo>,
}

#[derive(Accounts)]
pub struct ExecuteProposal<'info> {
    #[account(mut)]
    pub executor: Signer<'info>,
    
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    
    #[account(mut)]
    pub governance_state: Account<'info, GovernanceState>,
    
    #[account(mut)]
    pub staking_state: Account<'info, StakingState>,
    
    #[account(mut)]
    pub treasury_state: Account<'info, TreasuryState>,
}

#[account]
#[derive(Debug)]
pub struct Proposal {
    pub proposal_id: u64,
    pub author: Pubkey,
    pub creation_time: i64,
    pub end_time: i64,
    pub executed: bool,
    pub for_votes: u64,
    pub against_votes: u64,
    pub voters: Vec<Pubkey>,
    pub data: ProposalData,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub enum ProposalData {
    UpdateApy { new_apy: u64 },
    UpdateWithdrawalLimit { new_limit: u64 },
    UpdateVotingPeriod { new_period: i64 },
    UpdateQuorum { new_quorum: u64 },
}

impl Proposal {
    pub fn has_voted(&self, voter: &Pubkey) -> bool {
        self.voters.contains(voter)
    }

    pub fn has_passed(&self, required_quorum: u64) -> bool {
        let total_votes = self.for_votes.checked_add(self.against_votes)
            .unwrap_or(0);
            
        total_votes >= required_quorum && self.for_votes > self.against_votes
    }
}