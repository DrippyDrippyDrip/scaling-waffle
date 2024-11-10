import React from 'react';
import { Link } from 'react-router-dom';
import StakingInterface from '../components/StakingInterface';
import ScrollingHeader from '../components/ScrollingHeader';
import { useWallet } from '../context/WalletContext';

const Staking: React.FC = () => {
  const { connected, connect, disconnect } = useWallet();

  return (
    <div className="min-h-screen bg-black text-cyan-400 font-mono relative">
      <div className="grid-overlay" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 pointer-events-none z-[2]" />
      
      <ScrollingHeader />
      
      <div className="p-4 relative z-10 mt-12">
        <div className="flex justify-between items-center mb-8">
          <Link to="/">
            <button className="px-4 py-1 border-2 border-cyan-400 hover:bg-cyan-400/10 transition-colors tron-button">
              _HOME
            </button>
          </Link>
          
          <button 
            onClick={connected ? disconnect : connect}
            className="px-4 py-1 border-2 border-cyan-400 hover:bg-cyan-400/10 transition-colors tron-button"
          >
            {connected ? '_DISCONNECT' : '_CONNECT'}
          </button>
        </div>

        <div className="flex justify-center items-center min-h-[80vh]">
          <div className="w-[600px] border-2 border-cyan-400 bg-black/80 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
            <div className="bg-cyan-400 px-2 py-1 flex justify-between items-center">
              <span className="text-black font-bold">STAKING.exe</span>
              <button className="w-6 h-6 bg-black/10 hover:bg-black/20 text-black flex items-center justify-center">
                ×
              </button>
            </div>
            <StakingInterface />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Staking;