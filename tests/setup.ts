import { 
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
import * as anchor from '@project-serum/anchor';

export async function setupTest() {
  // Connect to local validator
  const connection = new Connection('http://localhost:8899', 'confirmed');
  
  // Create test wallets
  const authority = Keypair.generate();
  const user = Keypair.generate();
  
  // Airdrop SOL to wallets
  await connection.requestAirdrop(authority.publicKey, 10 * LAMPORTS_PER_SOL);
  await connection.requestAirdrop(user.publicKey, 10 * LAMPORTS_PER_SOL);
  
  // Create DEATH token mint
  const mint = await createMint(
    connection,
    authority,
    authority.publicKey,
    null,
    9
  );
  
  // Create token accounts
  const authorityATA = await getOrCreateAssociatedTokenAccount(
    connection,
    authority,
    mint,
    authority.publicKey
  );
  
  const userATA = await getOrCreateAssociatedTokenAccount(
    connection,
    user,
    mint,
    user.publicKey
  );
  
  return {
    connection,
    authority,
    user,
    mint,
    authorityATA,
    userATA,
  };
}