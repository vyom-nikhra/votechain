#!/usr/bin/env node

/**
 * Script to mint NFT badges for existing votes
 * This script finds all votes that don't have corresponding NFTs on the blockchain
 * and mints them retroactively.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Vote from '../models/Vote.js';
import User from '../models/User.js';
import Election from '../models/Election.js';
import blockchainService from '../utils/blockchain.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/votechain';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function mintNFTsForExistingVotes() {
  try {
    console.log('🔍 Finding votes without NFTs...');
    
    // Find all votes with user wallet addresses
    const votes = await Vote.find({ 
      transactionHash: { $exists: true }, // Only votes that were successfully recorded on blockchain
    }).populate('voterId', 'walletAddress firstName lastName studentId')
      .populate('electionId', 'title');

    console.log(`📊 Found ${votes.length} votes to process`);

    let mintedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const vote of votes) {
      try {
        if (!vote.voterId || !vote.voterId.walletAddress) {
          console.log(`⏭️  Skipping vote ${vote._id} - no wallet address`);
          skippedCount++;
          continue;
        }

        console.log(`🏅 Minting NFT for vote ${vote._id} by ${vote.voterId.firstName} ${vote.voterId.lastName}`);
        console.log(`   Election: ${vote.electionId?.title}`);
        console.log(`   Wallet: ${vote.voterId.walletAddress}`);

        const nftResult = await blockchainService.mintVoterNFT(
          vote.voterId.walletAddress, 
          vote.electionId._id.toString()
        );

        if (nftResult.success) {
          console.log(`✅ NFT minted successfully! TX: ${nftResult.transactionHash}`);
          
          // Update vote record with NFT info
          vote.nftMinted = true;
          vote.nftTransactionHash = nftResult.transactionHash;
          await vote.save();
          
          mintedCount++;
        } else {
          console.error(`❌ Failed to mint NFT for vote ${vote._id}:`, nftResult.error);
          errorCount++;
        }

        // Small delay between mints to avoid overwhelming the blockchain
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Error processing vote ${vote._id}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 SUMMARY:');
    console.log(`✅ Successfully minted: ${mintedCount} NFTs`);
    console.log(`⏭️  Skipped: ${skippedCount} votes`);
    console.log(`❌ Errors: ${errorCount} votes`);

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

async function main() {
  console.log('🚀 Starting NFT minting for existing votes...\n');
  
  await connectDB();
  await mintNFTsForExistingVotes();
  
  console.log('\n🏁 Script completed!');
  process.exit(0);
}

// Run the script
main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});