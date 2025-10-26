/**
 * Web3 Wallet Service
 * Handles MetaMask and other wallet connections
 */

class WalletService {
  constructor() {
    this.provider = null;
    this.accounts = [];
    this.chainId = null;
    this.isConnected = false;
  }

  // Check if MetaMask is installed
  isMetaMaskAvailable() {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  // Connect to MetaMask
  async connectWallet() {
    if (!this.isMetaMaskAvailable()) {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    try {
      this.provider = window.ethereum;
      
      // Request account access
      const accounts = await this.provider.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please create an account in MetaMask.');
      }

      this.accounts = accounts;
      this.isConnected = true;

      // Get chain ID
      this.chainId = await this.provider.request({
        method: 'eth_chainId',
      });

      // Check if we're on the correct network (Hardhat local network)
      const expectedChainId = '0x7a69'; // 31337 in hex
      if (this.chainId !== expectedChainId) {
        await this.switchToHardhatNetwork();
      }

      return {
        success: true,
        address: accounts[0],
        chainId: this.chainId,
      };
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw new Error(error.message || 'Failed to connect wallet');
    }
  }

  // Switch to Hardhat local network
  async switchToHardhatNetwork() {
    const hardhatNetwork = {
      chainId: '0x7a69', // 31337 in hex
      chainName: 'Hardhat Local',
      nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: ['http://127.0.0.1:8545'],
      blockExplorerUrls: null,
    };

    try {
      // Try to switch to the network
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hardhatNetwork.chainId }],
      });
    } catch (switchError) {
      // If the network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await this.provider.request({
            method: 'wallet_addEthereumChain',
            params: [hardhatNetwork],
          });
        } catch (addError) {
          throw new Error('Failed to add Hardhat network to MetaMask');
        }
      } else {
        throw new Error('Failed to switch to Hardhat network');
      }
    }

    this.chainId = hardhatNetwork.chainId;
  }

  // Disconnect wallet
  async disconnectWallet() {
    this.provider = null;
    this.accounts = [];
    this.chainId = null;
    this.isConnected = false;
    
    return {
      success: true,
      message: 'Wallet disconnected successfully',
    };
  }

  // Get current account
  getCurrentAccount() {
    return this.accounts.length > 0 ? this.accounts[0] : null;
  }

  // Check if connected to correct network
  isOnCorrectNetwork() {
    return this.chainId === '0x7a69'; // Hardhat local network
  }

  // Listen for account changes
  onAccountChanged(callback) {
    if (this.provider) {
      this.provider.on('accountsChanged', (accounts) => {
        this.accounts = accounts;
        callback(accounts);
      });
    }
  }

  // Listen for network changes
  onNetworkChanged(callback) {
    if (this.provider) {
      this.provider.on('chainChanged', (chainId) => {
        this.chainId = chainId;
        callback(chainId);
      });
    }
  }

  // Sign a message (for authentication)
  async signMessage(message) {
    if (!this.isConnected || this.accounts.length === 0) {
      throw new Error('Wallet not connected');
    }

    try {
      const signature = await this.provider.request({
        method: 'personal_sign',
        params: [message, this.accounts[0]],
      });

      return {
        success: true,
        signature,
        address: this.accounts[0],
      };
    } catch (error) {
      throw new Error('Failed to sign message: ' + error.message);
    }
  }

  // Format address for display
  formatAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  // Check wallet status
  async checkConnection() {
    if (!this.isMetaMaskAvailable()) {
      return { connected: false, error: 'MetaMask not available' };
    }

    try {
      const accounts = await this.provider.request({
        method: 'eth_accounts',
      });

      if (accounts.length > 0) {
        this.accounts = accounts;
        this.isConnected = true;
        
        this.chainId = await this.provider.request({
          method: 'eth_chainId',
        });

        return {
          connected: true,
          address: accounts[0],
          chainId: this.chainId,
          onCorrectNetwork: this.isOnCorrectNetwork(),
        };
      }

      return { connected: false };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }

  // Get NFTs from blockchain
  async getUserNFTs(userAddress) {
    if (!this.provider) {
      throw new Error('Wallet not connected');
    }

    try {
      // NFT Contract address (from deployment file)
      const NFT_CONTRACT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'; // VotingNFT contract
      
      // ERC-721 ABI for balance and tokenOfOwnerByIndex functions
      const ERC721_ABI = [
        "function balanceOf(address owner) view returns (uint256)",
        "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
        "function tokenURI(uint256 tokenId) view returns (string)",
        "function ownerOf(uint256 tokenId) view returns (address)"
      ];

      // Create ethers provider
      const { ethers } = await import('ethers');
      const provider = new ethers.providers.Web3Provider(this.provider);
      const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, ERC721_ABI, provider);

      // Get number of NFTs owned by user
      const balance = await contract.balanceOf(userAddress);
      const nftCount = balance.toNumber();

      const nfts = [];
      
      // Get each NFT token ID and metadata
      for (let i = 0; i < nftCount; i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(userAddress, i);
        
        try {
          const tokenURI = await contract.tokenURI(tokenId);
          nfts.push({
            tokenId: tokenId.toString(),
            tokenURI,
            contractAddress: NFT_CONTRACT_ADDRESS,
            type: 'Voting NFT Badge'
          });
        } catch (error) {
          console.warn(`Could not fetch metadata for token ${tokenId}:`, error);
          nfts.push({
            tokenId: tokenId.toString(),
            tokenURI: null,
            contractAddress: NFT_CONTRACT_ADDRESS,
            type: 'Voting NFT Badge'
          });
        }
      }

      return {
        success: true,
        nfts,
        count: nftCount
      };
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      return {
        success: false,
        error: error.message,
        nfts: [],
        count: 0
      };
    }
  }

  // Get NFT details from blockchain
  async getNFTDetails(tokenId, contractAddress) {
    if (!this.provider) {
      throw new Error('Wallet not connected');
    }

    try {
      const ERC721_ABI = [
        "function tokenURI(uint256 tokenId) view returns (string)",
        "function ownerOf(uint256 tokenId) view returns (address)"
      ];

      const { ethers } = await import('ethers');
      const provider = new ethers.providers.Web3Provider(this.provider);
      const contract = new ethers.Contract(contractAddress, ERC721_ABI, provider);

      const tokenURI = await contract.tokenURI(tokenId);
      const owner = await contract.ownerOf(tokenId);

      return {
        success: true,
        tokenId,
        tokenURI,
        owner,
        contractAddress
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const walletService = new WalletService();

export default walletService;