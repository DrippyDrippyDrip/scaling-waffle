import React, { useState } from 'react';
import { Lock } from 'lucide-react';

export default function BondingPanel() {
  const [bondAmount, setBondAmount] = useState('');

  return (
    <div className="bg-blue-700 p-6 rounded-lg border border-blue-400">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Bond Assets</h2>
        <Lock className="text-yellow-300" />
      </div>

      <div className="space-y-4">
        <div className="bg-blue-800 p-4 rounded">
          <h3 className="text-lg font-bold mb-2">Available Bonds</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-blue-600 rounded">
              <div>
                <p className="font-bold">DEATH-SOL LP</p>
                <p className="text-sm text-blue-300">ROI: 420.69%</p>
              </div>
              <button className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-400 transition-colors">
                Bond
              </button>
            </div>
            <div className="flex items-center justify-between p-3 border border-blue-600 rounded">
              <div>
                <p className="font-bold">DEATH-USDC LP</p>
                <p className="text-sm text-blue-300">ROI: 321.69%</p>
              </div>
              <button className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-400 transition-colors">
                Bond
              </button>
            </div>
          </div>
        </div>

        <div className="bg-blue-800 p-4 rounded">
          <h3 className="text-lg font-bold mb-2">Your Bonds</h3>
          <div className="text-center py-4">
            <p className="text-blue-300">No active bonds found</p>
          </div>
        </div>
      </div>
    </div>
  );
}