import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';

export default function TokenMinting() {
  const { connected } = useWallet();
  const [mintAmount, setMintAmount] = useState('');
  const [isGovernor] = useState(true);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-cyan-400">{'>'}_DEATH Token Minting Module</span>
        {isGovernor && (
          <span className="text-yellow-400">[GOVERNOR ACCESS GRANTED]</span>
        )}
      </div>

      {connected ? (
        isGovernor ? (
          <>
            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <span className="text-cyan-400">{'>'}_</span>
                <input
                  type="number"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  className="flex-1 bg-black border-2 border-cyan-400 p-2 text-cyan-400 placeholder-cyan-400/50"
                  placeholder="Enter mint amount..."
                />
                <button className="border-2 border-cyan-400 px-4 py-2 hover:bg-cyan-400/10">
                  EXECUTE
                </button>
              </div>
            </div>

            <div className="border-2 border-cyan-400 p-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>{'>'}_Max Supply:</div>
                <div>1,000,000,000 DEATH</div>
                <div>{'>'}_Circulating:</div>
                <div>666,666 DEATH</div>
                <div>{'>'}_Cooldown:</div>
                <div>23:59:59</div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-red-400 p-4">
            {'>'}_ERROR: Insufficient permissions. Governor access required.
          </div>
        )
      ) : (
        <div className="text-yellow-400">
          {'>'}_WARNING: Wallet connection required to access minting module.
        </div>
      )}
    </div>
  );
}