import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Twitter, Send, BarChart3, Globe } from 'lucide-react';
import ScrollingHeader from '../components/ScrollingHeader';
import DocsPopup from '../components/DocsPopup';
import { useWallet } from '../context/WalletContext';

export default function Home() {
  const navigate = useNavigate();
  const { connected, connect, disconnect } = useWallet();
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  const socialLinks = [
    { icon: <Twitter className="w-6 h-6" />, url: 'https://x.com/deathprotocol', label: 'Twitter' },
    { icon: <Send className="w-6 h-6" />, url: 'https://t.me/deathprotocol', label: 'Telegram' },
    { icon: <BarChart3 className="w-6 h-6" />, url: 'https://dexscreener.com/solana/death', label: 'DexScreener' },
    { icon: <Globe className="w-6 h-6" />, url: 'https://deathprotocol.xyz', label: 'Website' }
  ];

  return (
    <div className="min-h-screen bg-black text-cyan-400 font-mono relative overflow-hidden">
      <div className="grid-overlay" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 pointer-events-none z-[2]" />
      
      <ScrollingHeader />

      <div className="content-wrapper flex flex-col items-center justify-center min-h-screen pt-16 relative z-10">
        <div className="w-40 h-40 border-4 border-cyan-400 flex items-center justify-center mb-12 relative">
          <div className="absolute inset-0 bg-cyan-400/5" />
          <div className="absolute inset-0 animate-pulse bg-cyan-400/10" />
          <img 
            src="https://raw.githubusercontent.com/DrippyDrippyDrip/windowsxp/refs/heads/main/blue-mark.png" 
            alt="Blue Mark" 
            className="w-full h-full p-2 relative z-10 object-contain"
            style={{
              filter: 'brightness(1.2) drop-shadow(0 0 10px rgba(34, 211, 238, 0.5))'
            }}
          />
        </div>

        <div className="flex gap-8 mb-16">
          <button
            onClick={() => navigate('/staking')}
            className="tron-button"
          >
            STAKING
          </button>
          <button 
            onClick={connected ? disconnect : connect}
            className="tron-button"
          >
            {connected ? 'DISCONNECT' : 'CONNECT'}
          </button>
          <button 
            onClick={() => setIsDocsOpen(true)}
            className="tron-button"
          >
            DOCS
          </button>
        </div>

        <div className="fixed bottom-8 flex gap-6">
          {socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 border-2 border-cyan-400 flex items-center justify-center hover:bg-cyan-400/10 relative z-10 transition-all duration-300 hover:scale-110 group"
              style={{
                animation: `pulse-glow ${2 + index * 0.5}s infinite`,
                animationDelay: `${index * 0.2}s`
              }}
            >
              <span className="absolute bottom-full mb-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {link.label}
              </span>
              {link.icon}
            </a>
          ))}
        </div>
      </div>

      <DocsPopup isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
    </div>
  );
}