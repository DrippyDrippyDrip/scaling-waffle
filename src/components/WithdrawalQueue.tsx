import React from 'react';
import { Clock } from 'lucide-react';

export default function WithdrawalQueue() {
  return (
    <div className="bg-blue-700 p-6 rounded-lg border border-blue-400">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Withdrawal Queue</h2>
        <Clock className="text-yellow-300" />
      </div>

      <div className="space-y-4">
        <div className="bg-blue-800 p-4 rounded">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Queue Status</h3>
            <span className="px-3 py-1 bg-green-500 rounded-full text-sm">ACTIVE</span>
          </div>
          
          <div className="space-y-2">
            <p>Position in Queue: <span className="text-yellow-300">N/A</span></p>
            <p>Estimated Wait Time: <span className="text-yellow-300">~0 minutes</span></p>
            <p>Total in Queue: <span className="text-blue-300">0 DEATH</span></p>
          </div>
        </div>

        <button className="w-full bg-red-500 px-6 py-3 rounded hover:bg-red-400 transition-colors">
          Join Withdrawal Queue
        </button>
      </div>
    </div>
  );
}