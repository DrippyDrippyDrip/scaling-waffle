   // scripts/create-mint.ts
   import { Connection, Keypair, PublicKey } from '@solana/web3.js';
   import { createMint } from '@solana/spl-token';
   import * as fs from 'fs';

   const main = async () => {
     try {
       // Connection à devnet directement, pas besoin d'Anchor
       const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
       
       // Charge ton wallet depuis le fichier par défaut
       const walletKeyPair = Keypair.fromSecretKey(
         Buffer.from(JSON.parse(fs.readFileSync('/Users/drippy/.config/solana/id.json', 'utf-8')))
       );
       
       console.log('Creating mint with wallet:', walletKeyPair.publicKey.toString());
       
       const mint = await createMint(
         connection,
         walletKeyPair,
         walletKeyPair.publicKey,
         null,
         9
       );
       
       console.log('Mint created successfully!');
       console.log('Mint address:', mint.toBase58());
       
       const tokenInfo = {
         death_mint: mint.toBase58(),
         death_token_program_id: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
         death_staking_program_id: ''
       };
       
       fs.writeFileSync('token-info.json', JSON.stringify(tokenInfo, null, 2));
       console.log('Token info saved to token-info.json');
       
     } catch (error) {
       console.error('Error:', error);
     }
   };

   main();