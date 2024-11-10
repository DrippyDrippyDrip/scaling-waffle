import { Connection, Transaction } from '@solana/web3.js';
import { NETWORK_ENDPOINT } from './constants';


export async function getConnection(): Promise<Connection> {
  return new Connection(NETWORK_ENDPOINT);
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export async function signAndSendTransaction(
  transaction: Transaction,
  connection: Connection
): Promise<string> {
  const { solana } = window as any;
  
  if (!solana?.isPhantom) {
    throw new Error('Phantom wallet not found');
  }

  try {
    const signed = await solana.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(signature);
    return signature;
  } catch (error) {
    console.error('Error sending transaction:', error);
    throw error;
  }
}