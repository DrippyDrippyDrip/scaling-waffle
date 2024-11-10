use anchor_lang::prelude::*;

#[error_code]
pub enum ProtocolError {
    #[msg("Invalid stake amount")]
    InvalidStakeAmount,
    #[msg("Protocol is paused")]
    ProtocolPaused,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Invalid unstake amount")]
    InvalidUnstakeAmount,
    #[msg("Bond not mature")]
    BondNotMature,
    #[msg("Bond already claimed")]
    BondAlreadyClaimed,
    #[msg("Voting period has ended")]
    VotingPeriodEnded,
    #[msg("User has already voted")]
    AlreadyVoted,
    #[msg("Insufficient stake for voting")]
    InsufficientStake,
    #[msg("Invalid withdrawal amount")]
    InvalidWithdrawalAmount,
    #[msg("Proposal has not passed")]
    ProposalNotPassed,
    #[msg("Voting period still active")]
    VotingPeriodActive,
    #[msg("Invalid proposal type")]
    InvalidProposalType,
    #[msg("No rewards available to claim")]
    NoRewardsAvailable,
}