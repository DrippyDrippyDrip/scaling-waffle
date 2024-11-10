import { 
  Connection, 
  PublicKey, 
  Transaction, 
  TransactionInstruction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import { DEATH_STAKING_PROGRAM_ID, DEATH_MINT } from '../utils/constants';

export class DeathStaking {
  private connection: Connection;
  private programId: PublicKey;

  constructor(connection: Connection) {
    this.connection = connection;
    this.programId = DEATH_STAKING_PROGRAM_ID;
  }

  async getStakingStateAddress(): Promise<PublicKey> {
    const [address] = await PublicKey.findProgramAddress(
      [Buffer.from('staking_state')],
      this.programId
    );
    return address;
  }

  async getUserStakeInfoAddress(userPubkey: PublicKey): Promise<PublicKey> {
    const [address] = await PublicKey.findProgramAddress(
      [Buffer.from('user_stake_info'), userPubkey.toBuffer()],
      this.programId
    );
    return address;
  }

  async getProtocolTokenAccount(): Promise<PublicKey> {
    const stakingState = await this.getStakingStateAddress();
    return await getAssociatedTokenAddress(
      DEATH_MINT,
      stakingState,
      true,
      TOKEN_PROGRAM_ID
    );
  }

  async stake(amount: number, userPublicKey: PublicKey): Promise<Transaction> {
    const stakingState = await this.getStakingStateAddress();
    const userStakeInfo = await this.getUserStakeInfoAddress(userPublicKey);
    const userTokenAccount = await getAssociatedTokenAddress(
      DEATH_MINT,
      userPublicKey,
      false,
      TOKEN_PROGRAM_ID
    );
    const protocolTokenAccount = await this.getProtocolTokenAccount();

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: userPublicKey, isSigner: true, isWritable: true },
        { pubkey: stakingState, isSigner: false, isWritable: true },
        { pubkey: userStakeInfo, isSigner: false, isWritable: true },
        { pubkey: userTokenAccount, isSigner: false, isWritable: true },
        { pubkey: protocolTokenAccount, isSigner: false, isWritable: true },
        { pubkey: DEATH_MINT, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data: Buffer.from([
        0, // Stake instruction
        ...new Uint8Array(new Float64Array([amount]).buffer)
      ])
    });

    const transaction = new Transaction().add(instruction);
    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = userPublicKey;

    return transaction;
  }

  async unstake(amount: number, userPublicKey: PublicKey): Promise<Transaction> {
    const stakingState = await this.getStakingStateAddress();
    const userStakeInfo = await this.getUserStakeInfoAddress(userPublicKey);
    const userTokenAccount = await getAssociatedTokenAddress(
      DEATH_MINT,
      userPublicKey,
      false,
      TOKEN_PROGRAM_ID
    );
    const protocolTokenAccount = await this.getProtocolTokenAccount();

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: userPublicKey, isSigner: true, isWritable: true },
        { pubkey: stakingState, isSigner: false, isWritable: true },
        { pubkey: userStakeInfo, isSigner: false, isWritable: true },
        { pubkey: userTokenAccount, isSigner: false, isWritable: true },
        { pubkey: protocolTokenAccount, isSigner: false, isWritable: true },
        { pubkey: DEATH_MINT, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data: Buffer.from([
        1, // Unstake instruction
        ...new Uint8Array(new Float64Array([amount]).buffer)
      ])
    });

    const transaction = new Transaction().add(instruction);
    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = userPublicKey;

    return transaction;
  }

  async getStakeInfo(userPublicKey: PublicKey) {
    try {
      const userStakeInfo = await this.getUserStakeInfoAddress(userPublicKey);
      const accountInfo = await this.connection.getAccountInfo(userStakeInfo);
      
      if (!accountInfo) {
        return {
          stakedAmount: 0,
          rewards: 0,
          tier: 'REAPER I',
          nextRewardTime: Date.now() + 86400000
        };
      }

      // Here we would properly deserialize the account data
      // This is a placeholder until we have the actual account structure
      return {
        stakedAmount: 0,
        rewards: 0,
        tier: 'REAPER I',
        nextRewardTime: Date.now() + 86400000
      };
    } catch (error) {
      console.error('Error fetching stake info:', error);
      throw error;
    }
  }
}