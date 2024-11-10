import { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { useWallet } from '../context/WalletContext';
import { NETWORK_ENDPOINT, DEATH_MINT } from '../utils/constants';
import { getAssociatedTokenAddress } from '@solana/spl-token';

interface StakingStats {
  stakedAmount: number;
  pendingRewards: number;
  tier: string;
  nextRewardTime: number;
  tokenBalance: number;
}

export function useDeathProtocol() {
  const { connected, publicKey } = useWallet();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StakingStats>({
    stakedAmount: 0,
    pendingRewards: 0,
    tier: 'REAPER_I',
    nextRewardTime: 0,
    tokenBalance: 0
  });

  useEffect(() => {
    if (connected && publicKey) {
      loadAccountData();
    }
  }, [connected, publicKey]);

  const loadAccountData = async () => {
    if (!publicKey) return;

    try {
      setLoading(true);
      const connection = new Connection(NETWORK_ENDPOINT);

      // Get user's token account
      const tokenAccount = await getAssociatedTokenAddress(
        DEATH_MINT,
        publicKey
      );

      // Get token balance
      const tokenBalance = await connection.getTokenAccountBalance(tokenAccount);

      // Get staking account data
      // This would be implemented based on your program's account structure
      const stakingData = await connection.getAccountInfo(publicKey);

      setStats({
        stakedAmount: 0, // Parse from staking data
        pendingRewards: 0, // Parse from staking data
        tier: 'REAPER_I', // Calculate based on staked amount
        nextRewardTime: Date.now() + 86400000, // 24h from now
        tokenBalance: tokenBalance.value.uiAmount || 0
      });
    } catch (error) {
      console.error('Error loading account data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    stats,
    refreshData: loadAccountData
  };
}