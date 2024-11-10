import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { 
    createMint, 
    getOrCreateAssociatedTokenAccount,
    mintTo,
    setAuthority,
    AuthorityType,
} from '@solana/spl-token';
import * as fs from 'fs';

const INITIAL_SUPPLY = 1_000_000_000; // 1 billion
const DECIMALS = 9;

const main = async () => {
    try {
        const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
        
        const walletKeyPair = Keypair.fromSecretKey(
            Buffer.from(JSON.parse(fs.readFileSync('/Users/drippy/.config/solana/id.json', 'utf-8')))
        );
        
        console.log('Creating DEATH token with 1 billion initial supply...');
        
        // Create the token mint
        const mint = await createMint(
            connection,
            walletKeyPair,
            walletKeyPair.publicKey,
            walletKeyPair.publicKey, // Freeze authority
            DECIMALS
        );
        
        console.log('DEATH token created successfully!');
        console.log('Token Mint:', mint.toBase58());

        // Create associated token account
        const tokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            walletKeyPair,
            mint,
            walletKeyPair.publicKey
        );

        console.log('Token Account:', tokenAccount.address.toBase58());
        
        // Mint 1 billion tokens
        console.log('Minting 1 billion DEATH tokens...');
        await mintTo(
            connection,
            walletKeyPair,
            mint,
            tokenAccount.address,
            walletKeyPair,
            INITIAL_SUPPLY * (10 ** DECIMALS) // Multiplying by decimals to get the right amount
        );
        
        const tokenInfo = {
            name: "Death Token",
            symbol: "DEATH",
            description: "Death Protocol Governance Token",
            death_mint: mint.toBase58(),
            decimals: DECIMALS,
            initial_supply: INITIAL_SUPPLY,
            token_program_id: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
            metadata: {
                max_supply: "Uncapped",
                initial_apy: "100,000%",
                governance_controlled: true,
                staking_enabled: true,
                treasury_allocation: "10%",
            }
        };
        
        fs.writeFileSync('token-info.json', JSON.stringify(tokenInfo, null, 2));
        
        console.log('\nDEATH Token Setup Complete! 💀');
        console.log('--------------------------------');
        console.log('Token Name: Death Token (DEATH)');
        console.log('Decimals:', DECIMALS);
        console.log('Initial Supply:', INITIAL_SUPPLY.toLocaleString(), 'DEATH');
        console.log('Mint Address:', mint.toBase58());
        console.log('Token Account:', tokenAccount.address.toBase58());
        console.log('--------------------------------');
        
    } catch (error) {
        console.error('Error:', error);
    }
};

main();