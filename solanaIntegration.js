// QuickNode Solana Integration
import { Connection, Keypair, SystemProgram, Transaction, LAMPORTS_PER_SOL, sendAndConfirmTransaction } from '@solana/web3.js';

// Your QuickNode endpoints
const QUICKNODE_HTTP = 'https://wispy-distinguished-county.solana-devnet.quiknode.pro/0bee6b68a06b7331484c108b912f4ceacda1b874/';
const QUICKNODE_WSS = 'wss://wispy-distinguished-county.solana-devnet.quiknode.pro/0bee6b68a06b7331484c108b912f4ceacda1b874/';

// Initialize connection
export const connection = new Connection(QUICKNODE_HTTP, {
  commitment: 'confirmed',
  wsEndpoint: QUICKNODE_WSS,
});

// Record aid issuance on Solana blockchain
export const recordAidOnBlockchain = async (aidData) => {
  try {
    console.log('🚀 Recording aid on Solana blockchain via QuickNode...');
    
    // Create a temporary keypair for the transaction (in production, use NGO's wallet)
    const payer = Keypair.generate();
    
    // Request airdrop for transaction fee
    try {
      const airdropSignature = await connection.requestAirdrop(
        payer.publicKey,
        0.1 * LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(airdropSignature);
      console.log('✅ Airdrop confirmed');
    } catch (e) {
      console.log('⚠️ Airdrop failed, using simulation fallback');
      throw new Error('Airdrop failed');
    }

    // Create transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: payer.publicKey, // Send to self with memo
        lamports: 1, // Minimal amount
      })
    );

    // Send and confirm transaction
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payer],
      { commitment: 'confirmed' }
    );

    console.log('✅ Transaction confirmed:', signature);

    // Get transaction details
    const txInfo = await connection.getTransaction(signature, {
      commitment: 'confirmed'
    });

    return {
      success: true,
      signature: signature,
      blockTime: txInfo?.blockTime || Math.floor(Date.now() / 1000),
      slot: txInfo?.slot || await connection.getSlot(),
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
    };
  } catch (error) {
    console.error('❌ Blockchain transaction failed:', error);
    
    // Return simulated data if blockchain fails
    return {
      success: false,
      signature: generateSimulatedSignature(),
      blockTime: Math.floor(Date.now() / 1000),
      slot: Math.floor(Math.random() * 1000000),
      explorerUrl: null,
      simulated: true
    };
  }
};

// Generate simulated signature for fallback
function generateSimulatedSignature() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
  return Array.from({length: 88}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// Test connection
export const testQuickNodeConnection = async () => {
  try {
    const version = await connection.getVersion();
    const slot = await connection.getSlot();
    console.log('✅ QuickNode connected:', { version, slot });
    return true;
  } catch (error) {
    console.error('❌ QuickNode connection failed:', error);
    return false;
  }
};

