#!/usr/bin/env node

/**
 * Script to update contract addresses in the frontend
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Latest contract addresses from deployment
const CONTRACT_ADDRESSES = {
  VOTING: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
  NFT: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
  ZK_VERIFIER: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'
};

function updateWalletService() {
  const walletServicePath = path.join(__dirname, '../../frontend/src/services/walletService.js');
  
  if (fs.existsSync(walletServicePath)) {
    let content = fs.readFileSync(walletServicePath, 'utf8');
    
    // Update NFT contract address
    content = content.replace(
      /const NFT_CONTRACT_ADDRESS = '[^']+'/,
      `const NFT_CONTRACT_ADDRESS = '${CONTRACT_ADDRESSES.NFT}'`
    );
    
    fs.writeFileSync(walletServicePath, content);
    console.log('✅ Updated frontend/src/services/walletService.js');
  }
}

function updateEnvFile() {
  const envPath = path.join(__dirname, '../.env');
  
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Update or add contract addresses
  const updates = [
    `VOTING_CONTRACT=${CONTRACT_ADDRESSES.VOTING}`,
    `NFT_CONTRACT=${CONTRACT_ADDRESSES.NFT}`,
    `ZK_VERIFIER_CONTRACT=${CONTRACT_ADDRESSES.ZK_VERIFIER}`
  ];
  
  updates.forEach(update => {
    const [key, value] = update.split('=');
    const regex = new RegExp(`^${key}=.*`, 'm');
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, update);
    } else {
      envContent += `\n${update}`;
    }
  });
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Updated backend/.env');
}

console.log('🔄 Updating contract addresses...');
updateWalletService();
updateEnvFile();
console.log('✅ Contract addresses updated!');
console.log('\n📋 Current addresses:');
console.log(`Voting Contract: ${CONTRACT_ADDRESSES.VOTING}`);
console.log(`NFT Contract: ${CONTRACT_ADDRESSES.NFT}`);
console.log(`ZK Verifier: ${CONTRACT_ADDRESSES.ZK_VERIFIER}`);