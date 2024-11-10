import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { expect } from 'chai';
import { setupTest } from './setup';
import { DeathProtocol } from '../target/types/death_protocol';

describe('Death Protocol Staking Tests', () => {
  let program: Program<DeathProtocol>;
  let connection, authority, user, mint, authorityATA, userATA;

  before(async () => {
    // Setup test environment
    const setup = await setupTest();
    ({ connection, authority, user, mint, authorityATA, userATA } = setup);

    // Initialize program
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    program = anchor.workspace.DeathProtocol as Program<DeathProtocol>;
  });

  it('Initializes the protocol', async () => {
    const config = {
      baseApy: 1000, // 10%
      minStake: 100,
      maxStake: 1000000,
      emergencyCooldown: 7 * 24 * 60 * 60,
      withdrawalLimit: 10000,
      votingPeriod: 3 * 24 * 60 * 60,
    };

    await program.methods
      .initialize(config)
      .accounts({
        authority: authority.publicKey,
        stakingState: await getStakingStateAddress(),
        treasuryState: await getTreasuryStateAddress(),
        governanceState: await getGovernanceStateAddress(),
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    const stakingState = await program.account.stakingState.fetch(
      await getStakingStateAddress()
    );

    expect(stakingState.currentApy.toNumber()).to.equal(config.baseApy);
    expect(stakingState.minStake.toNumber()).to.equal(config.minStake);
  });

  it('Stakes tokens', async () => {
    const amount = new anchor.BN(1000);

    await program.methods
      .stake(amount)
      .accounts({
        user: user.publicKey,
        stakingState: await getStakingStateAddress(),
        userStakeInfo: await getUserStakeInfoAddress(user.publicKey),
        userTokenAccount: userATA.address,
        protocolTokenAccount: await getProtocolTokenAccount(),
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    const userStakeInfo = await program.account.userStakeInfo.fetch(
      await getUserStakeInfoAddress(user.publicKey)
    );

    expect(userStakeInfo.stakedAmount.toNumber()).to.equal(amount.toNumber());
  });

  // Add more test cases for other functionalities
});

// Helper functions to get PDA addresses
async function getStakingStateAddress(): Promise<PublicKey> {
  const [address] = await PublicKey.findProgramAddress(
    [Buffer.from('staking_state')],
    program.programId
  );
  return address;
}

async function getTreasuryStateAddress(): Promise<PublicKey> {
  const [address] = await PublicKey.findProgramAddress(
    [Buffer.from('treasury_state')],
    program.programId
  );
  return address;
}

async function getGovernanceStateAddress(): Promise<PublicKey> {
  const [address] = await PublicKey.findProgramAddress(
    [Buffer.from('governance_state')],
    program.programId
  );
  return address;
}

async function getUserStakeInfoAddress(user: PublicKey): Promise<PublicKey> {
  const [address] = await PublicKey.findProgramAddress(
    [Buffer.from('user_stake_info'), user.toBuffer()],
    program.programId
  );
  return address;
}

async function getProtocolTokenAccount(): Promise<PublicKey> {
  const [address] = await PublicKey.findProgramAddress(
    [Buffer.from('protocol_token_account')],
    program.programId
  );
  return address;
}