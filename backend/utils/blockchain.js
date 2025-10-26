import { ethers } from 'ethers';

// Network configuration - now supports local Hardhat
const NETWORK_CONFIG = {
  chainId: process.env.CHAIN_ID || 31337,
  name: process.env.CHAIN_ID === '31337' ? 'Hardhat Local' : 'Polygon Mumbai Testnet',
  rpcUrl: process.env.POLYGON_RPC_URL || 'http://127.0.0.1:8545',
  explorerUrl: process.env.CHAIN_ID === '31337' ? 'http://localhost:8545' : 'https://mumbai.polygonscan.com'
};

// Contract ABIs (simplified for integration)
const VOTING_ABI = [
  "function createElection(string memory _title, string memory _description, string[] memory _candidates, uint256 _startTime, uint256 _endTime, uint8 _voteType) external returns (uint256)",
  "function castVote(uint256 _electionId, bytes32 _voteHash, bytes32 _nullifierHash, bytes calldata _zkProof) external",
  "function getElection(uint256 _electionId) external view returns (tuple(uint256 id, string title, string description, address creator, uint256 startTime, uint256 endTime, uint8 voteType, uint8 status, uint256 totalVotes))",
  "event VoteCast(uint256 indexed electionId, address indexed voter, bytes32 voteHash, uint8 voteType)",
  "event ElectionCreated(uint256 indexed electionId, string title, address indexed creator, uint256 startTime, uint256 endTime)"
];

const NFT_ABI = [
  "function mintVoterBadge(address to, uint256 electionId, string memory badgeType) external returns (uint256)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function getAddress() external view returns (address)"
];

// Contract addresses on Local Hardhat Network
const CONTRACT_ADDRESSES = {
  VOTING: process.env.VOTING_CONTRACT || '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  NFT: process.env.NFT_CONTRACT || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  ZK_VERIFIER: process.env.ZK_VERIFIER_CONTRACT || '0x5FbDB2315678afecb367f032d93F642f64180aa3'
};

// Initialize provider
const getProvider = () => {
  return new ethers.JsonRpcProvider(NETWORK_CONFIG.rpcUrl);
};

// Initialize signer (for backend operations)  
const getSigner = () => {
  // Use Hardhat test account for local development
  const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
  
  const provider = getProvider();
  return new ethers.Wallet(privateKey, provider);
};

// Blockchain service class
class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.votingContract = null;
    this.nftContract = null;
    this.isConnected = false;
  }

  async initialize() {
    try {
      console.log('🔗 Initializing blockchain service...');
      
      this.provider = getProvider();
      this.signer = getSigner();

      // Initialize contracts
      this.votingContract = new ethers.Contract(
        CONTRACT_ADDRESSES.VOTING,
        VOTING_ABI,
        this.signer
      );

      this.nftContract = new ethers.Contract(
        CONTRACT_ADDRESSES.NFT,
        NFT_ABI,
        this.signer
      );

      // Test connection
      const network = await this.provider.getNetwork();
      console.log(`✅ Connected to blockchain: ${NETWORK_CONFIG.name} (Chain ID: ${network.chainId})`);
      
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('❌ Blockchain initialization failed:', error.message);
      this.isConnected = false;
      return false;
    }
  }

  async createElectionOnChain(electionData) {
    if (!this.isConnected) {
      console.warn('Blockchain not connected, skipping election creation');
      return { success: false, error: 'Blockchain not connected' };
    }

    try {
      const { title, description, candidates, votingStartTime, votingEndTime, electionType } = electionData;

      // Convert candidate objects to names array
      const candidateNames = candidates.map(c => c.name);
      
      // Convert vote type to enum (simple=0, ranked=1, quadratic=2)
      const voteTypeMap = { 'simple': 0, 'ranked': 1, 'quadratic': 2 };
      const voteType = voteTypeMap[electionType] || 0;

      // Convert timestamps to blockchain format (Unix timestamp)
      const startTime = Math.floor(new Date(votingStartTime).getTime() / 1000);
      const endTime = Math.floor(new Date(votingEndTime).getTime() / 1000);

      console.log('📝 Creating election on blockchain:', { title, candidateCount: candidateNames.length });

      const tx = await this.votingContract.createElection(
        title,
        description,
        candidateNames,
        startTime,
        endTime,
        voteType
      );

      const receipt = await tx.wait();
      
      // Find the ElectionCreated event to get blockchain election ID
      const event = receipt.logs.find(log => {
        try {
          const parsed = this.votingContract.interface.parseLog(log);
          return parsed.name === 'ElectionCreated';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = this.votingContract.interface.parseLog(event);
        const blockchainElectionId = parsed.args.electionId.toString();
        
        console.log('✅ Election created on blockchain with ID:', blockchainElectionId);
        
        return {
          success: true,
          blockchainElectionId,
          transactionHash: tx.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString()
        };
      }

      throw new Error('ElectionCreated event not found in transaction receipt');
    } catch (error) {
      console.error('❌ Failed to create election on blockchain:', error.message);
      return { success: false, error: error.message };
    }
  }

  async castVoteOnChain(voteData) {
    if (!this.isConnected) {
      console.warn('Blockchain not connected, skipping vote recording');
      return { success: false, error: 'Blockchain not connected' };
    }

    try {
      const { blockchainElectionId, voteHash, nullifierHash } = voteData;

      // For demo purposes, use empty ZK proof (in production, generate real proof)
      const zkProof = '0x';

      console.log('🗳️  Recording vote on blockchain for election:', blockchainElectionId);

      const tx = await this.votingContract.castVote(
        blockchainElectionId,
        voteHash,
        nullifierHash,
        zkProof
      );

      const receipt = await tx.wait();

      console.log('✅ Vote recorded on blockchain:', tx.hash);

      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('❌ Failed to record vote on blockchain:', error.message);
      return { success: false, error: error.message };
    }
  }

  async mintVoterNFT(voterAddress, electionId) {
    if (!this.isConnected) {
      return { success: false, error: 'Blockchain not connected' };
    }

    try {
      console.log('🏅 Minting voter NFT for:', voterAddress);

      const tx = await this.nftContract.mintVoterBadge(
        voterAddress,
        electionId,
        'voter'
      );

      const receipt = await tx.wait();

      console.log('✅ Voter NFT minted:', tx.hash);

      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        tokenId: receipt.logs[0]?.topics[3] // Usually the token ID
      };
    } catch (error) {
      console.error('❌ Failed to mint voter NFT:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Get blockchain election data (for verification)
  async getElectionFromChain(blockchainElectionId) {
    if (!this.isConnected) {
      return null;
    }

    try {
      const election = await this.votingContract.getElection(blockchainElectionId);
      return {
        id: election.id.toString(),
        title: election.title,
        totalVotes: election.totalVotes.toString(),
        status: election.status
      };
    } catch (error) {
      console.error('Failed to get election from blockchain:', error);
      return null;
    }
  }

  // Verify NFT certificate on blockchain
  async verifyVotingNFT(tokenId) {
    try {
      if (!this.nftContract) {
        throw new Error('NFT contract not initialized');
      }

      console.log('🔍 Verifying NFT token ID:', tokenId);

      // Get token owner
      const owner = await this.nftContract.ownerOf(tokenId);
      
      // Get token metadata URI
      const tokenURI = await this.nftContract.tokenURI(tokenId);
      
      // Get current block number for verification
      const currentBlock = await this.provider.getBlockNumber();

      // Parse metadata if it's a valid JSON URI
      let metadata = null;
      try {
        if (tokenURI.startsWith('data:application/json;base64,')) {
          // Base64 encoded JSON
          const base64Data = tokenURI.split(',')[1];
          const jsonString = Buffer.from(base64Data, 'base64').toString('utf-8');
          metadata = JSON.parse(jsonString);
        } else if (tokenURI.startsWith('http')) {
          // HTTP URL (would need to fetch in real implementation)
          metadata = { uri: tokenURI };
        } else {
          // Raw JSON string
          metadata = JSON.parse(tokenURI);
        }
      } catch (parseError) {
        console.warn('Could not parse NFT metadata:', parseError.message);
        metadata = { raw: tokenURI };
      }

      return {
        tokenId: tokenId.toString(),
        owner: owner,
        contractAddress: await this.nftContract.getAddress(),
        metadata: metadata,
        blockNumber: currentBlock,
        verified: true,
        verificationTime: new Date().toISOString()
      };

    } catch (error) {
      console.error('NFT verification failed:', error);
      throw new Error(`Failed to verify NFT: ${error.message}`);
    }
  }
}

// Export singleton instance
const blockchainService = new BlockchainService();

// Old compatibility exports (keeping existing structure)
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

// Initialize the service on import
blockchainService.initialize().catch(console.error);

export default blockchainService;

export {
  NETWORK_CONFIG,
  getProvider,
  getSigner,
  blockchainService
};