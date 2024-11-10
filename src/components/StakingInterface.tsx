import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useStaking } from '../hooks/useStaking';

export const StakingInterface: React.FC = () => {
  const { connected, connect } = useWallet();
  const { 
    currentAPY, 
    stakedBalance,
    tokenBalance,
    pendingRewards,
    rewardTier,
    handleStake,
    handleUnstake,
    handleClaimRewards,
    isLoading,
    error
  } = useStaking();

  const [stakeAmount, setStakeAmount] = useState<string>('');

  const onStake = () => {
    if (!stakeAmount) return;
    handleStake(parseFloat(stakeAmount));
    setStakeAmount('');
  };

  const onUnstake = () => {
    if (stakedBalance <= 0) return;
    handleUnstake(stakedBalance);
  };

  const onMax = () => {
    setStakeAmount(tokenBalance.toString());
  };

  const onClaimRewards = () => {
    if (pendingRewards <= 0) return;
    handleClaimRewards();
  };

  return (
    <div className="min-h-[500px] p-6 flex flex-col text-cyan-400">
      <div className="mb-8">
        _DEATH Protocol Terminal
      </div>

      {!connected ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-8">
          <div className="text-red-400 text-center border border-red-400 px-8 py-4 bg-black/50 w-full max-w-md">
            _ERROR: WALLET CONNECTION REQUIRED
          </div>
          <button
            onClick={connect}
            className="border border-cyan-400 px-12 py-2 hover:bg-cyan-400/10 transition-colors"
          >
            _CONNECT WALLET
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col space-y-6">
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>Current DPY:</div>
            <div>{currentAPY}% - APR: {(currentAPY * 365).toFixed(2)}%</div>
            
            <div>Available Balance:</div>
            <div>{tokenBalance} $DEATH</div>
            
            <div>Staked Balance:</div>
            <div>{stakedBalance} $DEATH</div>
            
            <div>Pending Rewards:</div>
            <div>{pendingRewards} $DEATH</div>
            
            <div>Your Tier:</div>
            <div>{rewardTier}</div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-black border border-cyan-400 p-2"
                disabled={isLoading}
              />
              <button
                onClick={onStake}
                disabled={isLoading || !stakeAmount || parseFloat(stakeAmount) <= 0}
                className="w-full border border-cyan-400 p-2 hover:bg-cyan-400/10 transition-colors disabled:opacity-50"
              >
                STAKE
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={onMax}
                disabled={isLoading || tokenBalance <= 0}
                className="w-full border border-cyan-400 p-2 hover:bg-cyan-400/10 transition-colors disabled:opacity-50"
              >
                MAX
              </button>
              <button
                onClick={onUnstake}
                disabled={isLoading || stakedBalance <= 0}
                className="w-full border border-cyan-400 p-2 hover:bg-cyan-400/10 transition-colors disabled:opacity-50"
              >
                UNSTAKE ALL
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={onClaimRewards}
                disabled={isLoading || pendingRewards <= 0}
                className="w-full border border-cyan-400 p-2 hover:bg-cyan-400/10 transition-colors disabled:opacity-50"
              >
                CLAIM REWARDS
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm mt-4 border border-red-400 p-2">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="text-cyan-400 animate-pulse">
              _Processing transaction...
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-cyan-400/70 mt-6 pt-4 border-t border-cyan-400/30">
        <div>_Type 'help' for command list</div>
        <div>_Press CTRL+C to terminate process</div>
      </div>
    </div>
  );
};

export default StakingInterface;