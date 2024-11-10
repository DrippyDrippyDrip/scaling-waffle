import { Program, AnchorProvider, Idl, BN } from '@project-serum/anchor';
import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import { DEATH_MINT, DEATH_STAKING_PROGRAM_ID } from '../utils/constants';
import IDL from '../idl/death_protocol.json';

export class DeathProtocolClient {
  private program: Program;
  private connection: Connection;

  constructor(connection: Connection, wallet: any) {
    const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
    this.program = new Program(IDL as Idl, DEATH_STAKING_PROGRAM_ID, provider);
    this.connection = connection;
  }

  async getStakingState(authority: PublicKey) {
    try {
      const [stakingStateAddress] = PublicKey.findProgramAddressSync(
        [Buffer.from('staking'), authority.toBuffer()],
        this.program.programId
      );
      
      return await this.program.account.stakingState.fetch(stakingStateAddress);
    } catch (error) {
      // Initialize if account doesn't exist
      await this.initializeStakingState(authority);
      const [stakingStateAddress] = PublicKey.findProgramAddressSync(
        [Buffer.from('staking'), authority.toBuffer()],
        this.program.programId
      );
      return await this.program.account.stakingState.fetch(stakingStateAddress);
    }
  }

  async initializeStakingState(authority: PublicKey) {
    const [stakingStateAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from('staking'), authority.toBuffer()],
      this.program.programId
    );

    return await this.program.methods
      .initialize()
      .accounts({
        authority,
        stakingState: stakingStateAddress,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  async stake(amount: number, user: PublicKey): Promise<Transaction> {
    const [stakingStateAddress] = await PublicKey.findProgramAddress(
      [Buffer.from('staking'), user.toBuffer()],
      this.program.programId
    );

    const [userStakeInfoAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from('user_stake'), user.toBuffer()],
      this.program.programId
    );

    // Get or create token accounts
    const userTokenAccount = await getAssociatedTokenAddress(DEATH_MINT, user, false);
    const protocolTokenAccount = await getAssociatedTokenAddress(
      DEATH_MINT,
      stakingStateAddress,
      true // Allow PDA account
    );

    // Check if protocol token account exists
    const protocolAccount = await this.connection.getAccountInfo(protocolTokenAccount);
    
    let transaction = await this.program.methods
      .stake(new BN(amount))
      .accounts({
        user,
        stakingState: stakingStateAddress,
        userStakeInfo: userStakeInfoAddress,
        userTokenAccount,
        protocolTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .transaction();

    // Add create protocol token account instruction if needed
    if (!protocolAccount) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          user,
          protocolTokenAccount,
          stakingStateAddress,
          DEATH_MINT
        )
      );
    }

    return transaction;
  }

  async getUserStakeInfo(userPubkey: PublicKey) {
    const [userStakeInfoAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from('user_stake'), userPubkey.toBuffer()],
      this.program.programId
    );
    
    return await this.program.account.userStakeInfo.fetch(userStakeInfoAddress);
  }

  async unstake(amount: number, user: PublicKey): Promise<Transaction> {
    const [stakingStateAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from('staking'), user.toBuffer()],
      this.program.programId
    );

    const [userStakeInfoAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from('user_stake'), user.toBuffer()],
      this.program.programId
    );

    const amountInLamports = new BN(amount * 1e9);

    const transaction = await this.program.methods
      .unstake(amountInLamports)
      .accounts({
        user,
        stakingState: stakingStateAddress,
        userStakeInfo: userStakeInfoAddress,
        userTokenAccount: await getAssociatedTokenAddress(DEATH_MINT, user),
        protocolTokenAccount: await getAssociatedTokenAddress(DEATH_MINT, stakingStateAddress, true),
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .transaction();

    // Set recent blockhash and fee payer
    transaction.feePayer = user;
    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    return transaction;
  }

  async claimRewards(user: PublicKey): Promise<Transaction> {
    const [stakingStateAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from('staking'), user.toBuffer()],
      this.program.programId
    );

    const [userStakeInfoAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from('user_stake'), user.toBuffer()],
      this.program.programId
    );

    const transaction = await this.program.methods
      .claimRewards()
      .accounts({
        user,
        stakingState: stakingStateAddress,
        userStakeInfo: userStakeInfoAddress,
        userTokenAccount: await getAssociatedTokenAddress(DEATH_MINT, user),
        protocolTokenAccount: await getAssociatedTokenAddress(DEATH_MINT, stakingStateAddress, true),
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .transaction();

    // Set recent blockhash and fee payer
    transaction.feePayer = user;
    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    return transaction;
  }
}