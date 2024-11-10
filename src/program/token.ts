import { 
  Connection, 
  PublicKey, 
  Transaction, 
  sendAndConfirmTransaction 
} from '@solana/web3.js';
import { 
  Token, 
  TOKEN_PROGRAM_ID,
  MintLayout,
  ASSOCIATED_TOKEN_PROGRAM_ID 
} from '@solana/spl-token';
import { DEATH_MINT } from '../utils/constants';

export class DeathToken {
  connection: Connection;
  mint: PublicKey;
  
  constructor(connection: Connection) {
    this.connection = connection;
    this.mint = DEATH_MINT;
  }

  async createMint(authority: PublicKey): Promise<PublicKey> {
    const token = await Token.createMint(
      this.connection,
      authority,
      authority,
      authority,
      9,
      TOKEN_PROGRAM_ID
    );
    return token.publicKey;
  }

  async mintTo(
    authority: PublicKey,
    destination: PublicKey,
    amount: number
  ): Promise<string> {
    const token = new Token(
      this.connection,
      this.mint,
      TOKEN_PROGRAM_ID,
      authority
    );

    const tx = await token.mintTo(
      destination,
      authority,
      [],
      amount * Math.pow(10, 9)
    );

    return tx;
  }

  async getAssociatedTokenAddress(owner: PublicKey): Promise<PublicKey> {
    return Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      this.mint,
      owner
    );
  }

  async getTokenBalance(tokenAccount: PublicKey): Promise<number> {
    const balance = await this.connection.getTokenAccountBalance(tokenAccount);
    return balance.value.uiAmount || 0;
  }
}