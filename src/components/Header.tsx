import React from 'react';
import { Skull } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

export default function Header() {
  const { connected, connect } = useWallet();

  return (
    <header className="bg-black border-b border-cyan-400">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skull className="w-8 h-8 text-cyan-400" />
            <h1 className="text-2xl font-bold text-cyan-400">DEATH Protocol</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <button className="text-cyan-400 hover:text-cyan-300 transition-colors">Stake</button>
            <button className="text-cyan-400 hover:text-cyan-300 transition-colors">Bond</button>
            <button className="text-cyan-400 hover:text-cyan-300 transition-colors">Withdraw</button>
          </nav>
        </div>
      </div>
    </header>
  );
}