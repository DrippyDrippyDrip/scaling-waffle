import { useState, useEffect, useCallback } from 'react';
import { Connection } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { useWallet } from '../context/WalletContext';
import { NETWORK_ENDPOINT, DEATH_MINT } from '../utils/constants';
import { DeathProtocolClient } from '../program/DeathProtocolClient';
import { calculateRewardTier } from '../utils/web3';
import { signAndSendTransaction } from '../utils/web3';

export function useStaking() {
  const { connected, publicKey } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stakedBalance, setStakedBalance] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [pendingRewards, setPendingRewards] = useState(0);
  const [currentAPY, setCurrentAPY] = useState(66.6);
  const [rewardTier, setRewardTier] = useState('REAPER I');

  const calculatePendingRewards = useCallback((userStakeInfo: any) => {
    const now = Date.now() / 1000;
    const timeSinceLastStake = now - userStakeInfo.lastStakeTimestamp.toNumber();
    const stakedAmount = userStakeInfo.stakedAmount.toNumber();
    
    const rewardsPerSecond = (stakedAmount * currentAPY) / (365 * 24 * 60 * 60 * 100);
    return Math.floor(rewardsPerSecond * timeSinceLastStake);
  }, [currentAPY]);

  const loadStakingInfo = useCallback(async () => {
    if (!publicKey) return;

    try {
      setIsLoading(true);
      const connection = new Connection(NETWORK_ENDPOINT, 'confirmed');
      const wallet = (window as any).solana;
      const client = new DeathProtocolClient(connection, wallet);
      
      const tokenAccount = await getAssociatedTokenAddress(DEATH_MINT, publicKey);
      try {
        const tokenBalance = await connection.getTokenAccountBalance(tokenAccount);
        setTokenBalance(tokenBalance.value.uiAmount || 0);
      } catch (e) {
        console.error('Error fetching token balance:', e);
        setTokenBalance(0);
      }

      try {
        const stakingState = await client.getStakingState(publicKey);
        const userStakeInfo = await client.getUserStakeInfo(publicKey);
        
        setStakedBalance(userStakeInfo?.stakedAmount?.toNumber() || 0);
        setPendingRewards(userStakeInfo ? calculatePendingRewards(userStakeInfo) : 0);
        setCurrentAPY(stakingState?.currentApy?.toNumber() || 66.6);
        
        const tier = calculateRewardTier(userStakeInfo?.stakedAmount?.toNumber() || 0);
        setRewardTier(tier);
      } catch (e) {
        console.error('Error fetching staking info:', e);
        // Don't reset values here as they might be valid from previous loads
      }
      
    } catch (error) {
      console.error('Error loading staking info:', error);
      setError('Failed to load staking information');
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, calculatePendingRewards]);

  useEffect(() => {
    if (connected && publicKey) {
      loadStakingInfo();
    }
  }, [connected, publicKey, loadStakingInfo]);

  const handleStake = async (amount: number) => {
    if (!publicKey || !amount) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const connection = new Connection(NETWORK_ENDPOINT, 'confirmed');
      const wallet = (window as any).solana;
      const client = new DeathProtocolClient(connection, wallet);
      
      const transaction = await client.stake(amount, publicKey);
      
      const signature = await signAndSendTransaction(transaction, connection);
      
      console.log('Stake transaction successful:', signature);
      await loadStakingInfo();
    } catch (error) {
      console.error('Error staking:', error);
      setError('Failed to stake tokens. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnstake = async (amount: number) => {
    if (!publicKey || !amount) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const connection = new Connection(NETWORK_ENDPOINT, 'confirmed');
      const wallet = (window as any).solana;
      const client = new DeathProtocolClient(connection, wallet);
      
      const transaction = await client.unstake(amount, publicKey);
      
      const signature = await signAndSendTransaction(transaction, connection);
      
      console.log('Unstake transaction successful:', signature);
      await loadStakingInfo();
    } catch (error) {
      console.error('Error unstaking:', error);
      setError('Failed to unstake tokens. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!publicKey) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const connection = new Connection(NETWORK_ENDPOINT, 'confirmed');
      const wallet = (window as any).solana;
      const client = new DeathProtocolClient(connection, wallet);
      
      const transaction = await client.claimRewards(publicKey);
      
      const signature = await signAndSendTransaction(transaction, connection);
      
      console.log('Claim rewards transaction successful:', signature);
      await loadStakingInfo();
    } catch (error) {
      console.error('Error claiming rewards:', error);
      setError('Failed to claim rewards. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    stakedBalance,
    tokenBalance,
    pendingRewards,
    currentAPY,
    rewardTier,
    handleStake,
    handleUnstake,
    handleClaimRewards,
  };
}