import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import walletService from '../../services/walletService';
import toast from 'react-hot-toast';
import Breadcrumbs from '../common/Breadcrumbs';
import { 
  FaCubes,
  FaSearch,
  FaExternalLinkAlt,
  FaCertificate,
  FaTrophy,
  FaLink,
  FaEye,
  FaWallet,
  FaHashtag
} from 'react-icons/fa';

const BlockchainExplorer = () => {
  const { user } = useAuthStore();
  const [userNFTs, setUserNFTs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [contractInfo, setContractInfo] = useState(null);

  const deploymentInfo = {
    network: "Hardhat Local",
    chainId: 31337,
    contracts: {
      Voting: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
      VotingNFT: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
      ZKVerifier: "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    },
    deployer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  };

  const fetchUserNFTs = async () => {
    if (!user?.walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      // Try blockchain first
      let result = await walletService.getUserNFTs(user.walletAddress);
      
      // If blockchain fails, try backend fallback
      if (!result.success && result.error.includes('EIP-1193')) {
        console.log('Blockchain unavailable, trying backend fallback...');
        result = await walletService.fetchUserNFTsFromBackend(user.walletAddress);
      }
      
      if (result.success) {
        setUserNFTs(result.nfts);
        const source = result.source === 'backend' ? '(from database)' : '(from blockchain)';
        toast.success(`Found ${result.count} NFTs ${source}`);
      } else {
        console.error('NFT fetch failed:', result.error);
        // Don't show error toast for wallet connection issues - just show empty state
        if (!result.error.includes('MetaMask') && !result.error.includes('Wallet')) {
          toast.error('Failed to fetch NFTs: ' + result.error);
        }
      }
    } catch (error) {
      console.error('NFT fetch error:', error);
      // Don't show error toast for connection issues
      if (!error.message.includes('EIP-1193') && !error.message.includes('MetaMask')) {
        toast.error('Error: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.walletAddress) {
      fetchUserNFTs();
    }
  }, [user?.walletAddress]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 max-w-6xl"
    >
      {/* Breadcrumbs */}
      <Breadcrumbs customItems={[{ label: 'Blockchain Explorer' }]} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <FaCubes className="text-primary" />
          Blockchain Explorer
        </h1>
        <p className="text-base-content/70">
          View your NFT badges and blockchain data on Hardhat Local Network
        </p>
      </div>

      {/* Network Info */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title flex items-center gap-2">
            <FaLink className="text-info" />
            Network Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm opacity-70">Network</div>
              <div className="font-semibold">{deploymentInfo.network}</div>
            </div>
            <div>
              <div className="text-sm opacity-70">Chain ID</div>
              <div className="font-semibold">{deploymentInfo.chainId}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Addresses */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title flex items-center gap-2">
            <FaHashtag className="text-secondary" />
            Smart Contracts
          </h2>
          <div className="space-y-3">
            {Object.entries(deploymentInfo.contracts).map(([name, address]) => (
              <div key={name} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                <div>
                  <div className="font-semibold">{name}</div>
                  <div className="text-sm opacity-70">Smart Contract</div>
                </div>
                <div className="text-right">
                  <code className="bg-base-300 px-2 py-1 rounded text-xs">
                    {address}
                  </code>
                  <button 
                    className="btn btn-ghost btn-xs ml-2"
                    onClick={() => copyToClipboard(address)}
                  >
                    <FaExternalLinkAlt />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User's NFTs */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h2 className="card-title flex items-center gap-2">
              <FaTrophy className="text-warning" />
              Your NFT Collection
            </h2>
            <button 
              className="btn btn-primary btn-sm"
              onClick={fetchUserNFTs}
              disabled={loading || !user?.walletAddress}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <FaSearch />
              )}
              Refresh
            </button>
          </div>

          {!user?.walletAddress ? (
            <div className="text-center py-8">
              <FaWallet className="text-6xl opacity-30 mx-auto mb-4" />
              <p className="text-lg font-medium">No Wallet Connected</p>
              <p className="text-sm opacity-70">Connect your wallet to view NFTs</p>
            </div>
          ) : userNFTs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userNFTs.map((nft, index) => (
                <div key={nft.tokenId} className="card bg-gradient-to-br from-success/10 to-primary/10 border border-success/20">
                  <div className="card-body p-4">
                    <h4 className="font-bold flex items-center gap-2">
                      <FaCertificate className="text-success" />
                      Voting NFT Badge
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="opacity-70">Token ID:</span>
                        <code className="bg-base-300 px-1 ml-1 rounded">{nft.tokenId}</code>
                      </div>
                      <div>
                        <span className="opacity-70">Contract:</span>
                        <div className="break-all">
                          <code className="bg-base-300 px-1 rounded text-xs">
                            {nft.contractAddress}
                          </code>
                        </div>
                      </div>
                      {nft.tokenURI && (
                        <div>
                          <span className="opacity-70">Metadata URI:</span>
                          <div className="text-xs opacity-60 break-all">{nft.tokenURI}</div>
                        </div>
                      )}
                    </div>
                    <div className="card-actions justify-between mt-3">
                      <div className="badge badge-success">On-Chain</div>
                      <button 
                        className="btn btn-ghost btn-xs"
                        onClick={() => copyToClipboard(`Token ID: ${nft.tokenId}\nContract: ${nft.contractAddress}`)}
                      >
                        <FaExternalLinkAlt className="mr-1" />
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaTrophy className="text-6xl opacity-30 mx-auto mb-4" />
              <p className="text-lg font-medium">No NFTs Found</p>
              <p className="text-sm opacity-70">Vote in elections to earn NFT badges!</p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="card bg-base-200 shadow-xl mt-8">
        <div className="card-body">
          <h3 className="font-bold mb-2">How to View Your NFTs</h3>
          <div className="space-y-2 text-sm">
            <div>1. Make sure MetaMask is connected to Hardhat Local Network (Chain ID: 31337)</div>
            <div>2. Your wallet address: <code className="bg-base-300 px-1 rounded">{user?.walletAddress || 'Not connected'}</code></div>
            <div>3. Vote in elections to mint NFT badges automatically</div>
            <div>4. NFTs are stored on the blockchain and linked to your wallet address</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BlockchainExplorer;