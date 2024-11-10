import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { DeathProtocol } from '../target/types/death_protocol';
import { getOrCreateAssociatedTokenAccount, getAccount } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

// Load token information from the file generated during setup
const tokenInfo = require('../token-info.json');

async function testProtocol() {
    // Configure the client to use Devnet
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.DeathProtocol as Program<idl>;
    
    // Convert string addresses to PublicKeys
    const mint = new PublicKey(tokenInfo.mint);
    const stakingState = new PublicKey(tokenInfo.stakingState);
    const treasuryState = new PublicKey(tokenInfo.treasuryState);
    const governanceState = new PublicKey(tokenInfo.governanceState);

    try {
        console.log('Starting protocol tests...');

        // Get or create token accounts
        const userTokenAccount = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            provider.wallet as any,
            mint,
            provider.wallet.publicKey
        );

        // 1. Test Staking
        console.log('\n1. Testing stake function...');
        const stakeAmount = new anchor.BN(1000 * (10 ** 9)); // 1000 tokens
        
        // Get PDA for user's stake account
        const [userStakeAccount] = await PublicKey.findProgramAddress(
            [
                Buffer.from('user_stake'),
                provider.wallet.publicKey.toBuffer()
            ],
            program.programId
        );

        try {
            await program.methods
                .stake(stakeAmount)
                .accounts({
                    user: provider.wallet.publicKey,
                    userTokenAccount: userTokenAccount.address,
                    userStakeAccount: userStakeAccount,
                    stakingState: stakingState,
                    treasuryState: treasuryState,
                    tokenMint: mint,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                })
                .rpc();
            
            console.log('Staking successful');
            
            // Verify stake account
            const stakeAccountInfo = await program.account.userStakeAccount.fetch(userStakeAccount);
            console.log('Stake account info:', {
                amount: stakeAccountInfo.amount.toString(),
                lastStakeTimestamp: stakeAccountInfo.lastStakeTimestamp.toString()
            });
        } catch (error) {
            console.error('Staking failed:', error);
        }

        // 2. Test Reward Calculation
        console.log('\n2. Testing reward calculation...');
        try {
            const rewards = await program.methods
                .calculateRewards()
                .accounts({
                    user: provider.wallet.publicKey,
                    userStakeAccount: userStakeAccount,
                    stakingState: stakingState,
                })
                .view();
            
            console.log('Current rewards:', rewards.toString());
        } catch (error) {
            console.error('Reward calculation failed:', error);
        }

        // 3. Test Claim Rewards
        console.log('\n3. Testing claim rewards...');
        try {
            await program.methods
                .claimRewards()
                .accounts({
                    user: provider.wallet.publicKey,
                    userTokenAccount: userTokenAccount.address,
                    userStakeAccount: userStakeAccount,
                    stakingState: stakingState,
                    treasuryState: treasuryState,
                    tokenMint: mint,
                    tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                })
                .rpc();
            
            console.log('Rewards claimed successfully');
            
            // Check updated token balance
            const tokenAccount = await getAccount(provider.connection, userTokenAccount.address);
            console.log('Updated token balance:', tokenAccount.amount.toString());
        } catch (error) {
            console.error('Claiming rewards failed:', error);
        }

        // 4. Test Emergency Withdrawal
        console.log('\n4. Testing emergency withdrawal...');
        try {
            await program.methods
                .emergencyWithdraw()
                .accounts({
                    user: provider.wallet.publicKey,
                    userTokenAccount: userTokenAccount.address,
                    userStakeAccount: userStakeAccount,
                    stakingState: stakingState,
                    treasuryState: treasuryState,
                    tokenMint: mint,
                    tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                })
                .rpc();
            
            console.log('Emergency withdrawal successful');
        } catch (error) {
            console.error('Emergency withdrawal failed:', error);
        }

        // 5. Test Governance Proposal
        console.log('\n5. Testing governance proposal...');
        try {
            const newParams = {
                baseApy: new anchor.BN(6), // Increase APY to 6%
                minStake: new anchor.BN(150 * (10 ** 9)), // 150 tokens minimum
                maxStake: new anchor.BN(200000 * (10 ** 9)), // 200,000 tokens maximum
                emergencyCooldown: new anchor.BN(7200), // 2 hours
                withdrawalLimit: new anchor.BN(10000 * (10 ** 9)), // 10,000 tokens
                votingPeriod: new anchor.BN(172800), // 48 hours
            };

            // Create proposal
            await program.methods
                .createProposal(newParams)
                .accounts({
                    proposer: provider.wallet.publicKey,
                    userStakeAccount: userStakeAccount,
                    governanceState: governanceState,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .rpc();
            
            console.log('Governance proposal created');

            // Vote on proposal
            await program.methods
                .vote(true) // true for yes vote
                .accounts({
                    voter: provider.wallet.publicKey,
                    userStakeAccount: userStakeAccount,
                    governanceState: governanceState,
                })
                .rpc();
            
            console.log('Vote cast successfully');
        } catch (error) {
            console.error('Governance testing failed:', error);
        }

        // 6. Test Regular Unstake
        console.log('\n6. Testing regular unstake...');
        const unstakeAmount = new anchor.BN(500 * (10 ** 9)); // 500 tokens
        try {
            await program.methods
                .unstake(unstakeAmount)
                .accounts({
                    user: provider.wallet.publicKey,
                    userTokenAccount: userTokenAccount.address,
                    userStakeAccount: userStakeAccount,
                    stakingState: stakingState,
                    treasuryState: treasuryState,
                    tokenMint: mint,
                    tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                })
                .rpc();
            
            console.log('Unstaking successful');
            
            // Verify updated stake account
            const updatedStakeAccount = await program.account.userStakeAccount.fetch(userStakeAccount);
            console.log('Updated stake account info:', {
                amount: updatedStakeAccount.amount.toString(),
                lastStakeTimestamp: updatedStakeAccount.lastStakeTimestamp.toString()
            });
        } catch (error) {
            console.error('Unstaking failed:', error);
        }

        console.log('\nAll tests completed!');

    } catch (error) {
        console.error('Test execution failed:', error);
    }
}

// Execute all tests
console.log('Starting Death Protocol tests...');
testProtocol().catch(console.error);