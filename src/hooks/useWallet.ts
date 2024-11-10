import { useState, useEffect } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

interface PhantomWindow extends Window {
  solana?: {
    isPhantom: boolean;
    connect: () => Promise<{ publicKey: PublicKey }>;
    disconnect: () => Promise<void>;
    on: (event: string, callback: () => void) => void;
    publicKey: PublicKey | null;
  };
}

export function useWallet() {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    const phantom = (window as PhantomWindow).solana;

    if (phantom?.isPhantom) {
      phantom.on('connect', () => {
        setConnected(true);
        if (phantom.publicKey) {
          setPublicKey(phantom.publicKey);
          updateBalance(phantom.publicKey);
        }
      });

      phantom.on('disconnect', () => {
        setConnected(false);
        setPublicKey(null);
        setBalance(0);
      });

      // Check if already connected
      if (phantom.publicKey) {
        setConnected(true);
        setPublicKey(phantom.publicKey);
        updateBalance(phantom.publicKey);
      }
    }
  }, []);

  const updateBalance = async (pubKey: PublicKey) => {
    try {
      const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
      const balance = await connection.getBalance(pubKey);
      setBalance(balance / 1e9); // Convert lamports to SOL
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const connect = async () => {
    const phantom = (window as PhantomWindow).solana;

    if (!phantom?.isPhantom) {
      window.open('https://phantom.app/', '_blank');
      return;
    }

    try {
      await phantom.connect();
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnect = async () => {
    const phantom = (window as PhantomWindow).solana;
    
    if (phantom) {
      try {
        await phantom.disconnect();
      } catch (error) {
        console.error('Error disconnecting wallet:', error);
      }
    }
  };

  return {
    connected,
    publicKey,
    balance,
    connect,
    disconnect,
  };
}