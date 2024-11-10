import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

export default function StakingPanel() {
  const [amount, setAmount] = useState('');

  return (
    <div className="bg-blue-700 p-6 rounded-lg border border-blue-400">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Stake DEATH</h2>
        <AlertCircle className="text-yellow-300" />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm">Amount to Stake</label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-blue-800 border border-blue-500 rounded px-4 py-2 text-white placeholder-blue-300"
              placeholder="Enter amount..."
            />
            <button className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-400 transition-colors">
              MAX
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="bg-green-500 px-6 py-3 rounded hover:bg-green-400 transition-colors">
            Stake
          </button>
          <button className="bg-red-500 px-6 py-3 rounded hover:bg-red-400 transition-colors">
            Unstake
          </button>
        </div>

        <div className="bg-blue-800 p-4 rounded mt-4">
          <h3 className="text-lg font-bold mb-2">Your Staking Stats</h3>
          <div className="space-y-2">
            <p>Staked Balance: <span className="text-green-400">0 DEATH</span></p>
            <p>Pending Rewards: <span className="text-green-400">0 DEATH</span></p>
            <p>Next Reward: <span className="text-yellow-300">23:59:59</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}