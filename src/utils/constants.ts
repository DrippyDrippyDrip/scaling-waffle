import { PublicKey } from '@solana/web3.js';

// Program and Token IDs
export const DEATH_STAKING_PROGRAM_ID = new PublicKey('EMmqYXyEiJuBqSQFkpsXJLPPZVj6LbiaThEyMNgrYzXD');
export const DEATH_TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
export const DEATH_MINT = new PublicKey('FXe6Wq53sNFHQkibdQQmFQQAe6jET4kfrJskdvjJvF8N');

// Network Constants
export const NETWORK_ENDPOINT = 'https://api.devnet.solana.com';
export const COMMITMENT_LEVEL = 'confirmed';

// Staking Constants
export const MIN_STAKE_AMOUNT = 100;
export const MAX_STAKE_AMOUNT = 1000000;
export const BASE_APY = 66.6;
export const MAX_APY = 24308.999999999996;
export const MIN_APY = 5;

// Tier Constants
export const TIER_LEVELS = {
  REAPER_I: 1000,
  REAPER_II: 5000,
  REAPER_III: 10000,
  REAPER_IV: 50000,
  REAPER_V: 100000
};

// Time Constants
export const STAKE_LOCK_PERIOD = 24 * 60 * 60 * 1000; // 24 hours
export const APY_ADJUSTMENT_PERIOD = 7 * 24 * 60 * 60 * 1000; // 7 days
export const EMERGENCY_WITHDRAWAL_COOLDOWN = 3 * 24 * 60 * 60 * 1000; // 3 days

// Fee Constants
export const EMERGENCY_WITHDRAWAL_FEE = 0.1; // 10%
export const STANDARD_WITHDRAWAL_FEE = 0.01; // 1%

// Program addresses
export const STAKING_SEED = 'staking';
export const USER_STAKE_SEED = 'user_stake';