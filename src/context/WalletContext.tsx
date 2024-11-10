import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PublicKey } from '@solana/web3.js';

interface PhantomWindow extends Window {
  solana?: {
    isPhantom: boolean;
    connect: () => Promise<{ publicKey: PublicKey }>;
    disconnect: () => Promise<void>;
    on: (event: string, callback: () => void) => void;
    removeListener: (event: string, callback: () => void) => void;
    publicKey: PublicKey | null;
    isConnected: boolean;
  };
}

interface WalletContextType {
  connected: boolean;
  publicKey: PublicKey | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  connected: false,
  publicKey: null,
  connect: async () => {},
  disconnect: async () => {},
});

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);

  useEffect(() => {
    const handleWalletConnection = () => {
      const phantom = (window as PhantomWindow).solana;
      if (phantom?.isConnected && phantom.publicKey) {
        setConnected(true);
        setPublicKey(phantom.publicKey);
      }
    };

    const handleWalletDisconnection = () => {
      setConnected(false);
      setPublicKey(null);
    };

    const phantom = (window as PhantomWindow).solana;
    if (phantom?.isPhantom) {
      phantom.on('connect', handleWalletConnection);
      phantom.on('disconnect', handleWalletDisconnection);

      // Check if already connected
      if (phantom.isConnected && phantom.publicKey) {
        setConnected(true);
        setPublicKey(phantom.publicKey);
      }

      return () => {
        phantom.removeListener('connect', handleWalletConnection);
        phantom.removeListener('disconnect', handleWalletDisconnection);
      };
    }
  }, []);

  const connect = async () => {
    try {
      const phantom = (window as PhantomWindow).solana;
      if (!phantom?.isPhantom) {
        window.open('https://phantom.app/', '_blank');
        return;
      }

      const response = await phantom.connect();
      setPublicKey(response.publicKey);
      setConnected(true);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setConnected(false);
      setPublicKey(null);
    }
  };

  const disconnect = async () => {
    try {
      const phantom = (window as PhantomWindow).solana;
      if (phantom) {
        await phantom.disconnect();
        setConnected(false);
        setPublicKey(null);
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  return (
    <WalletContext.Provider value={{ connected, publicKey, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}