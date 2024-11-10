use anchor_lang::prelude::*;
use crate::error::ProtocolError;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct ProtocolConfig {
    pub base_apy: u64, 
    pub min_stake: u64, 
    pub max_stake: u64, 
    pub emergency_cooldown: i64,
    pub withdrawal_limit: u64,
    pub voting_period: i64,
}

#[account]
#[derive(Debug)]
pub struct StakingState {
    pub authority: Pubkey,
    pub current_apy: u64,
    pub min_stake: u64,
    pub max_stake: u64,
    pub emergency_cooldown: i64,
    pub paused: bool,
    pub total_staked: u64,
}

impl StakingState {
    pub const LEN: usize = 32 + 8 + 8 + 8 + 8 + 1 + 8;

    pub fn calculate_rewards(&self, amount: u64, time_diff: i64) -> Result<u64> {
        let base_reward = (amount as u128)
            .checked_mul(self.current_apy as u128)
            .ok_or(ProtocolError::Overflow)?
            .checked_mul(time_diff as u128)
            .ok_or(ProtocolError::Overflow)?
            .checked_div(365 * 24 * 60 * 60 * 100)
            .ok_or(ProtocolError::Overflow)?;

        Ok(base_reward as u64)
    }
}

#[account]
#[derive(Debug)]
pub struct UserStakeInfo {
    pub owner: Pubkey,
    pub staked_amount: u64,
    pub last_stake_timestamp: i64,
    pub rewards_claimed: u64,
}

impl UserStakeInfo {
    pub const LEN: usize = 32 + 8 + 8 + 8;

    pub fn calculate_rewards(&self, current_time: i64, apy: u64) -> Result<u64> {
        let time_diff = current_time - self.last_stake_timestamp;
        if time_diff <= 0 {
            return Ok(0);
        }

        let base_reward = (self.staked_amount as u128)
            .checked_mul(apy as u128)
            .ok_or(ProtocolError::Overflow)?
            .checked_mul(time_diff as u128)
            .ok_or(ProtocolError::Overflow)?
            .checked_div(365 * 24 * 60 * 60 * 100)
            .ok_or(ProtocolError::Overflow)?;

        let bonus = if time_diff > 30 * 24 * 60 * 60 {
            base_reward
                .checked_mul(10)
                .ok_or(ProtocolError::Overflow)?
                .checked_div(100)
                .ok_or(ProtocolError::Overflow)?
        } else {
            0
        };

        Ok(base_reward.checked_add(bonus).ok_or(ProtocolError::Overflow)? as u64)
    }
}

#[account]
#[derive(Debug)]
pub struct TreasuryState {
    pub authority: Pubkey,
    pub withdrawal_limit: u64,
    pub required_signatures: u8,
    pub total_balance: u64,
}

impl TreasuryState {
    pub const LEN: usize = 32 + 8 + 1 + 8;
}

#[account]
#[derive(Debug)]
pub struct WithdrawalState {
    pub requests: Vec<WithdrawalRequest>,
    pub last_processed_time: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct WithdrawalRequest {
    pub user: Pubkey,
    pub amount: u64,
    pub request_time: i64,
    pub processed: bool,
}

impl WithdrawalState {
    pub fn add_request(&mut self, request: WithdrawalRequest) -> Result<()> {
        self.requests.push(request);
        Ok(())
    }

    pub fn process_batch(&mut self, current_time: i64) -> Vec<WithdrawalRequest> {
        let mut to_process = Vec::new();
        for request in self.requests.iter_mut() {
            if !request.processed && request.request_time <= current_time {
                request.processed = true;
                to_process.push(request.clone());
            }
        }
        self.last_processed_time = current_time;
        to_process
    }

    pub fn clean_processed(&mut self) {
        self.requests.retain(|r| !r.processed);
    }
}

#[account]
#[derive(Debug)]
pub struct GovernanceState {
    pub current_apy: u64,
    pub voting_period: i64,
    pub required_quorum: u64,
    pub proposal_count: u64,
}

impl GovernanceState {
    pub const LEN: usize = 8 + 8 + 8 + 8;
}