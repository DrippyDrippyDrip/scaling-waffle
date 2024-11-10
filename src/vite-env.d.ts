/// <reference types="vite/client" />

interface Window {
  solana?: {
    isPhantom?: boolean;
    connect(): Promise<{ publicKey: import('@solana/web3.js').PublicKey }>;
    disconnect(): Promise<void>;
    on(event: string, callback: () => void): void;
    removeListener(event: string, callback: () => void): void;
    publicKey: import('@solana/web3.js').PublicKey | null;
    isConnected: boolean;
  };
}