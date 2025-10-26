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
}

// Create singleton instance
const walletService = new WalletService();

export default walletService;