import { Connection, Commitment, Transaction } from '@solana/web3.js';
import { NETWORK_ENDPOINT, COMMITMENT_LEVEL, TIER_LEVELS, MIN_APY, MAX_APY } from './constants';

export const getConnection = () => {
  return new Connection(
    NETWORK_ENDPOINT,
    COMMITMENT_LEVEL as Commitment
  );
};

export const formatPublicKey = (publicKey: string) => {
  if (!publicKey) return '';
  return `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;
};

export const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const calculateRewardTier = (stakedAmount: number) => {
  const tiers = Object.entries(TIER_LEVELS).sort((a, b) => b[1] - a[1]);
  for (const [tier, requirement] of tiers) {
    if (stakedAmount >= requirement) {
      return tier;
    }
  }
  return 'REAPER_I';
};

export const calculateAPY = (baseAPY: number, tier: string) => {
  const tierMultipliers = {
    REAPER_I: 1,
    REAPER_II: 1.2,
    REAPER_III: 1.5,
    REAPER_IV: 2,
    REAPER_V: 3
  };
  
  const multiplier = tierMultipliers[tier as keyof typeof tierMultipliers] || 1;
  const calculatedAPY = baseAPY * multiplier;
  
  return Math.min(Math.max(calculatedAPY, MIN_APY), MAX_APY);
};

export const calculatePendingRewards = (
  stakedAmount: number,
  lastStakeTimestamp: number,
  apy: number
): number => {
  const now = Date.now() / 1000;
  const timeSinceLastStake = now - lastStakeTimestamp;
  const rewardsPerSecond = (stakedAmount * apy) / (365 * 24 * 60 * 60 * 100);
  return Math.floor(rewardsPerSecond * timeSinceLastStake);
};

export async function signAndSendTransaction(
  transaction: Transaction,
  connection: Connection
): Promise<string> {
  const { solana } = window as any;
  
  if (!solana?.isPhantom) {
    throw new Error('Phantom wallet not found');
  }

  try {
    transaction.feePayer = solana.publicKey;
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    
    const signed = await solana.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());
    
    // Wait for confirmation
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    });
    
    return signature;
  } catch (error) {
    console.error('Error sending transaction:', error);
    throw error;
  }
}