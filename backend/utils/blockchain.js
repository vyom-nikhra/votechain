import { ethers } from 'ethers';
import Web3 from 'web3';

// Polygon Mumbai testnet configuration
const POLYGON_CONFIG = {
  chainId: 80001,
  name: 'Polygon Mumbai Testnet',
  rpcUrl: process.env.POLYGON_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
  explorerUrl: 'https://mumbai.polygonscan.com'
};

// Initialize provider
const getProvider = () => {
  return new ethers.JsonRpcProvider(POLYGON_CONFIG.rpcUrl);
};

// Initialize signer (for backend operations)
const getSigner = () => {
  if (!process.env.PRIVATE_KEY) {
    throw new Error('Private key not configured');
  }
  
  const provider = getProvider();
  return new ethers.Wallet(process.env.PRIVATE_KEY, provider);
};

// Web3 instance for compatibility
const getWeb3Instance = () => {
  return new Web3(POLYGON_CONFIG.rpcUrl);
};

// Contract ABIs (will be updated when contracts are deployed)
const CONTRACT_ABIS = {
  voting: [
    // Voting contract ABI will be added after deployment
    {
      "inputs": [
        {"name": "_electionId", "type": "uint256"},
        {"name": "_candidateId", "type": "uint256"},
        {"name": "_proof", "type": "bytes32[]"}
      ],
      "name": "castVote",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"name": "_electionId", "type": "uint256"}],
      "name": "getElectionResults",
      "outputs": [
        {"name": "totalVotes", "type": "uint256"},
        {"name": "candidateVotes", "type": "uint256[]"}
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {"name": "_title", "type": "string"},
        {"name": "_candidates", "type": "string[]"},
        {"name": "_startTime", "type": "uint256"},
        {"name": "_endTime", "type": "uint256"}
      ],
      "name": "createElection",
      "outputs": [{"name": "electionId", "type": "uint256"}],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  
  votingNFT: [
    // NFT contract ABI
    {
      "inputs": [
        {"name": "to", "type": "address"},
        {"name": "tokenId", "type": "uint256"},
        {"name": "badgeType", "type": "string"},
        {"name": "electionId", "type": "uint256"}
      ],
      "name": "mintBadge",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  
  zkVerifier: [
    // ZK Verifier contract ABI
    {
      "inputs": [
        {"name": "_proof", "type": "uint[2]"},
        {"name": "_publicSignals", "type": "uint[]"}
      ],
      "name": "verifyProof",
      "outputs": [{"name": "", "type": "bool"}],
      "stateMutability": "view",
      "type": "function"
    }
  ]
};

// Contract addresses (will be updated after deployment)
const CONTRACT_ADDRESSES = {
  voting: process.env.VOTING_CONTRACT_ADDRESS || '',
  votingNFT: process.env.VOTING_NFT_CONTRACT_ADDRESS || '',
  zkVerifier: process.env.ZK_VERIFIER_CONTRACT_ADDRESS || ''
};

// Get contract instance
export const getContract = (contractName, signerOrProvider = null) => {
  if (!CONTRACT_ADDRESSES[contractName]) {
    throw new Error(`Contract address not found for ${contractName}`);
  }
  
  const provider = signerOrProvider || getProvider();
  return new ethers.Contract(
    CONTRACT_ADDRESSES[contractName],
    CONTRACT_ABIS[contractName],
    provider
  );
};

// Create election on blockchain
export const createElectionOnChain = async (electionData) => {
  try {
    const signer = getSigner();
    const votingContract = getContract('voting', signer);
    
    const candidates = electionData.candidates.map(c => c.name);
    const startTime = Math.floor(new Date(electionData.votingStartTime).getTime() / 1000);
    const endTime = Math.floor(new Date(electionData.votingEndTime).getTime() / 1000);
    
    const tx = await votingContract.createElection(
      electionData.title,
      candidates,
      startTime,
      endTime
    );
    
    const receipt = await tx.wait();
    
    return {
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      contractAddress: CONTRACT_ADDRESSES.voting,
      electionId: receipt.logs[0]?.args?.electionId || 0 // Extract from event logs
    };
    
  } catch (error) {
    console.error('Blockchain election creation error:', error);
    throw new Error(`Failed to create election on blockchain: ${error.message}`);
  }
};

// Cast vote on blockchain
export const castVoteOnChain = async (voteData) => {
  try {
    const signer = getSigner();
    const votingContract = getContract('voting', signer);
    
    const { electionId, candidateId, zkProof = [] } = voteData;
    
    const tx = await votingContract.castVote(
      electionId,
      candidateId,
      zkProof
    );
    
    const receipt = await tx.wait();
    
    return {
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      blockHash: receipt.blockHash,
      gasUsed: receipt.gasUsed.toString(),
      gasPrice: tx.gasPrice.toString(),
      status: receipt.status === 1 ? 'success' : 'failed'
    };
    
  } catch (error) {
    console.error('Blockchain vote casting error:', error);
    throw new Error(`Failed to cast vote on blockchain: ${error.message}`);
  }
};

// Mint NFT badge
export const mintVotingBadge = async (badgeData) => {
  try {
    const signer = getSigner();
    const nftContract = getContract('votingNFT', signer);
    
    const { userAddress, tokenId, badgeType, electionId } = badgeData;
    
    const tx = await nftContract.mintBadge(
      userAddress,
      tokenId,
      badgeType,
      electionId
    );
    
    const receipt = await tx.wait();
    
    return {
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      tokenId,
      badgeType,
      contractAddress: CONTRACT_ADDRESSES.votingNFT
    };
    
  } catch (error) {
    console.error('NFT minting error:', error);
    throw new Error(`Failed to mint NFT badge: ${error.message}`);
  }
};

// Get election results from blockchain
export const getElectionResultsFromChain = async (electionId) => {
  try {
    const votingContract = getContract('voting');
    const results = await votingContract.getElectionResults(electionId);
    
    return {
      totalVotes: results.totalVotes.toString(),
      candidateVotes: results.candidateVotes.map(votes => votes.toString()),
      blockchainTimestamp: Date.now()
    };
    
  } catch (error) {
    console.error('Blockchain results fetch error:', error);
    throw new Error(`Failed to fetch results from blockchain: ${error.message}`);
  }
};

// Verify transaction on blockchain
export const verifyTransaction = async (txHash) => {
  try {
    const provider = getProvider();
    const receipt = await provider.getTransactionReceipt(txHash);
    
    if (!receipt) {
      return { verified: false, error: 'Transaction not found' };
    }
    
    return {
      verified: receipt.status === 1,
      blockNumber: receipt.blockNumber,
      blockHash: receipt.blockHash,
      gasUsed: receipt.gasUsed.toString(),
      confirmations: await provider.getBlockNumber() - receipt.blockNumber
    };
    
  } catch (error) {
    console.error('Transaction verification error:', error);
    return { verified: false, error: error.message };
  }
};

// Get current gas price
export const getCurrentGasPrice = async () => {
  try {
    const provider = getProvider();
    const gasPrice = await provider.getFeeData();
    
    return {
      gasPrice: gasPrice.gasPrice?.toString(),
      maxFeePerGas: gasPrice.maxFeePerGas?.toString(),
      maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas?.toString()
    };
    
  } catch (error) {
    console.error('Gas price fetch error:', error);
    return null;
  }
};

// Check wallet balance
export const checkWalletBalance = async (address) => {
  try {
    const provider = getProvider();
    const balance = await provider.getBalance(address);
    
    return {
      balance: ethers.formatEther(balance),
      balanceWei: balance.toString()
    };
    
  } catch (error) {
    console.error('Balance check error:', error);
    return null;
  }
};

// Utility to validate Ethereum address
export const isValidAddress = (address) => {
  try {
    return ethers.isAddress(address);
  } catch (error) {
    return false;
  }
};

// Get network info
export const getNetworkInfo = async () => {
  try {
    const provider = getProvider();
    const network = await provider.getNetwork();
    
    return {
      chainId: Number(network.chainId),
      name: network.name,
      isTestnet: Number(network.chainId) !== 137, // Polygon mainnet
      explorerUrl: POLYGON_CONFIG.explorerUrl
    };
    
  } catch (error) {
    console.error('Network info error:', error);
    return null;
  }
};

export {
  POLYGON_CONFIG,
  CONTRACT_ADDRESSES,
  CONTRACT_ABIS,
  getProvider,
  getSigner,
  getWeb3Instance
};