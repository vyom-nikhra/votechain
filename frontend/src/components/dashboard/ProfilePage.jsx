import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import walletService from '../../services/walletService';
import toast from 'react-hot-toast';
import Breadcrumbs from '../common/Breadcrumbs';
import { 
  FaUser, 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaLock, 
  FaEye, 
  FaEyeSlash,
  FaIdCard,
  FaEnvelope,
  FaGraduationCap,
  FaCalendarAlt,
  FaWallet,
  FaTrophy,
  FaHistory,
  FaShieldAlt,
  FaLink,
  FaExternalLinkAlt,
  FaCertificate,
  FaCog,
  FaChartBar,
  FaVoteYea
} from 'react-icons/fa';

const ProfilePage = () => {
  const { user, updateProfile, changePassword, isLoading } = useAuthStore();
  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    year: '',
    bio: '',
    phoneNumber: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [stats, setStats] = useState({
    totalVotes: 0,
    nftBadges: 0,
    joinedDate: '',
    lastLogin: ''
  });

  const [showNFTModal, setShowNFTModal] = useState(false);
  const [blockchainNFTs, setBlockchainNFTs] = useState([]);
  const [loadingNFTs, setLoadingNFTs] = useState(false);

  // Initialize profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        department: user.department || '',
        year: user.year || '',
        bio: user.bio || '',
        phoneNumber: user.phoneNumber || ''
      });

      // Mock stats - replace with real API calls
      setStats({
        totalVotes: user.votesCount || 0,
        nftBadges: Array.isArray(user.nftBadges) ? user.nftBadges.length : (user.nftBadges || 0),
        joinedDate: new Date(user.createdAt).toLocaleDateString(),
        lastLogin: new Date(user.lastLogin || Date.now()).toLocaleDateString()
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        setEditMode(false);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (result.success) {
        setChangePasswordMode(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  // Wallet connection functions
  const handleConnectWallet = async () => {
    try {
      if (!walletService.isMetaMaskAvailable()) {
        toast.error('MetaMask is not installed. Please install MetaMask to connect your wallet.');
        window.open('https://metamask.io/download/', '_blank');
        return;
      }

      const result = await walletService.connectWallet();
      
      if (result.success) {
        // Update profile with wallet address
        const profileUpdate = await updateProfile({
          ...profileData,
          walletAddress: result.address
        });
        
        if (profileUpdate.success) {
          toast.success('Wallet connected successfully!');
        }
      }
    } catch (error) {
      toast.error(error.message || 'Failed to connect wallet');
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await walletService.disconnectWallet();
      
      // Update profile to remove wallet address
      const profileUpdate = await updateProfile({
        ...profileData,
        walletAddress: null
      });
      
      if (profileUpdate.success) {
        toast.success('Wallet disconnected successfully!');
      }
    } catch (error) {
      toast.error('Failed to disconnect wallet');
    }
  };

  const copyWalletAddress = () => {
    if (user?.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress);
      toast.success('Wallet address copied to clipboard!');
    }
  };

  const fetchBlockchainNFTs = async () => {
    if (!user?.walletAddress) {
      toast.error('No wallet connected. Please connect your wallet first.');
      return;
    }

    setLoadingNFTs(true);
    try {
      const result = await walletService.getUserNFTs(user.walletAddress);
      if (result.success) {
        setBlockchainNFTs(result.nfts);
        setShowNFTModal(true);
        toast.success(`Found ${result.count} NFT badges on blockchain!`);
      } else {
        toast.error('Failed to fetch NFTs from blockchain: ' + result.error);
      }
    } catch (error) {
      toast.error('Error connecting to blockchain: ' + error.message);
    } finally {
      setLoadingNFTs(false);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    // Reset form to original values
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        department: user.department || '',
        year: user.year || '',
        bio: user.bio || '',
        phoneNumber: user.phoneNumber || ''
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Breadcrumbs */}
        <Breadcrumbs customItems={[{ label: 'Profile' }]} />

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl">
                  <FaUser className="text-2xl text-primary" />
                </div>
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  My Profile
                </span>
              </h1>
              <p className="text-base-content/70 text-lg ml-16">
                Manage your account settings and preferences
              </p>
            </div>
            <div className="flex gap-3">
              {!editMode ? (
                <button 
                  className="btn btn-primary hover:scale-105 transition-transform"
                  onClick={() => setEditMode(true)}
                >
                  <FaEdit className="mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    className="btn btn-success hover:scale-105 transition-transform"
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                  >
                    {isLoading ? <span className="loading loading-spinner loading-sm"></span> : <FaSave className="mr-2" />}
                    Save
                  </button>
                  <button 
                    className="btn btn-ghost hover:scale-105 transition-transform"
                    onClick={cancelEdit}
                  >
                    <FaTimes className="mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="card bg-base-100 shadow-xl border-[0.5px] border-blue-500/20 hover:border-purple-400/40 hover:shadow-blue-500/10 transition-all duration-300">
              <div className="card-body">
                <div className="flex items-center mb-6">
                  <div className="avatar placeholder mr-4">
                    <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400 rounded-full w-20 flex items-center justify-center">
                      <FaUser className="text-3xl" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {profileData.firstName} {profileData.lastName}
                    </h2>
                    <p className="text-base-content/70">{profileData.email}</p>
                    <div className="badge badge-primary mt-2">
                      {user?.role || 'Student'}
                    </div>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <FaUser className="text-sm" />
                        First Name
                      </span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleProfileChange}
                      disabled={!editMode}
                      className={`input input-bordered ${editMode ? 'focus:input-primary' : 'input-disabled'}`}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <FaUser className="text-sm" />
                        Last Name
                      </span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleProfileChange}
                      disabled={!editMode}
                      className={`input input-bordered ${editMode ? 'focus:input-primary' : 'input-disabled'}`}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <FaEnvelope className="text-sm" />
                        Email
                      </span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      disabled={!editMode}
                      className={`input input-bordered ${editMode ? 'focus:input-primary' : 'input-disabled'}`}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <FaIdCard className="text-sm" />
                        Student ID
                      </span>
                    </label>
                    <input
                      type="text"
                      value={user?.studentId || ''}
                      disabled
                      className="input input-bordered input-disabled"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <FaGraduationCap className="text-sm" />
                        Department
                      </span>
                    </label>
                    <select
                      name="department"
                      value={profileData.department}
                      onChange={handleProfileChange}
                      disabled={!editMode}
                      className={`select select-bordered ${editMode ? 'focus:select-primary' : 'select-disabled'}`}
                    >
                      <option value="">Select Department</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Business">Business</option>
                      <option value="Medicine">Medicine</option>
                      <option value="Arts">Arts</option>
                      <option value="Sciences">Sciences</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <FaCalendarAlt className="text-sm" />
                        Academic Year
                      </span>
                    </label>
                    <select
                      name="year"
                      value={profileData.year}
                      onChange={handleProfileChange}
                      disabled={!editMode}
                      className={`select select-bordered ${editMode ? 'focus:select-primary' : 'select-disabled'}`}
                    >
                      <option value="">Select Year</option>
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                    </select>
                  </div>
                </div>

                <div className="form-control mt-4">
                  <label className="label">
                    <span className="label-text font-medium">Bio</span>
                  </label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleProfileChange}
                    disabled={!editMode}
                    rows="3"
                    placeholder="Tell us about yourself..."
                    className={`textarea textarea-bordered ${editMode ? 'focus:textarea-primary' : 'textarea-disabled'}`}
                  />
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="card bg-base-100 shadow-xl border-[0.5px] border-yellow-500/20 hover:border-yellow-400/40 hover:shadow-yellow-500/10 transition-all duration-300">
              <div className="card-body">
                <h3 className="card-title text-xl mb-4 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg">
                    <FaLock className="text-yellow-400" />
                  </div>
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    Security Settings
                  </span>
                </h3>

                <div className="divider"></div>

                {!changePasswordMode ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">Password</h4>
                      <p className="text-base-content/70">Last changed 30 days ago</p>
                    </div>
                    <button 
                      className="btn btn-outline btn-primary"
                      onClick={() => setChangePasswordMode(true)}
                    >
                      <FaLock className="mr-2" />
                      Change Password
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="font-semibold mb-4">Change Password</h4>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Current Password</span>
                      </label>
                      <div className="input-group">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter current password"
                          className="input input-bordered flex-1"
                        />
                        <button 
                          type="button"
                          className="btn btn-square btn-outline"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">New Password</span>
                      </label>
                      <div className="input-group">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter new password"
                          className="input input-bordered flex-1"
                        />
                        <button 
                          type="button"
                          className="btn btn-square btn-outline"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Confirm New Password</span>
                      </label>
                      <div className="input-group">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="Confirm new password"
                          className="input input-bordered flex-1"
                        />
                        <button 
                          type="button"
                          className="btn btn-square btn-outline"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        className="btn btn-success"
                        onClick={handleChangePassword}
                      >
                        <FaLock className="mr-2" />
                        Update Password
                      </button>
                      <button 
                        className="btn btn-ghost"
                        onClick={() => {
                          setChangePasswordMode(false);
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          });
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="space-y-6">
            {/* Profile Stats */}
            <div className="card bg-base-100 shadow-xl border-[0.5px] border-green-500/20 hover:border-green-400/40 hover:shadow-green-500/10 transition-all duration-300">
              <div className="card-body">
                <h3 className="card-title text-xl mb-4 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg">
                    <FaChartBar className="text-green-400" />
                  </div>
                  <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    Activity Stats
                  </span>
                </h3>
                <div className="divider"></div>
                <div className="stats stats-vertical shadow bg-base-200">
                  <div className="stat">
                    <div className="stat-figure text-primary">
                      <FaVoteYea className="text-3xl" />
                    </div>
                    <div className="stat-title">Total Votes</div>
                    <div className="stat-value text-primary">{stats.totalVotes}</div>
                  </div>
                  
                  <div className="stat">
                    <div className="stat-figure text-secondary">
                      <FaTrophy className="text-3xl" />
                    </div>
                    <div className="stat-title">NFT Badges</div>
                    <div className="stat-value text-secondary">{stats.nftBadges}</div>
                  </div>
                  
                  <div className="stat">
                    <div className="stat-figure text-accent">
                      <FaCalendarAlt className="text-3xl" />
                    </div>
                    <div className="stat-title">Member Since</div>
                    <div className="stat-value text-sm">{stats.joinedDate}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Wallet Connection */}
            <div className="card bg-base-100 shadow-xl border-[0.5px] border-pink-500/20 hover:border-pink-400/40 hover:shadow-pink-500/10 transition-all duration-300">
              <div className="card-body">
                <h3 className="card-title flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-lg">
                    <FaWallet className="text-pink-400" />
                  </div>
                  <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                    Blockchain Wallet
                  </span>
                </h3>
                <div className="divider"></div>
                <div className="space-y-4">
                  {user?.walletAddress ? (
                    <div>
                      <p className="text-sm text-base-content/70 mb-2">Connected Wallet:</p>
                      <div className="bg-base-200 p-3 rounded-lg flex items-center justify-between">
                        <code className="text-xs break-all">
                          {walletService.formatAddress(user.walletAddress)}
                        </code>
                        <div className="flex gap-2">
                          <button
                            onClick={copyWalletAddress}
                            className="btn btn-ghost btn-xs"
                            title="Copy full address"
                          >
                            <FaExternalLinkAlt />
                          </button>
                          <button
                            onClick={handleDisconnectWallet}
                            className="btn btn-ghost btn-xs btn-error"
                            title="Disconnect wallet"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                      <div className="badge badge-success mt-2">
                        ✓ Ready for blockchain voting
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-base-content/70 mb-4">
                        Connect your MetaMask wallet to participate in blockchain voting
                      </p>
                      <button 
                        onClick={handleConnectWallet}
                        className="btn btn-accent btn-block"
                        disabled={isLoading}
                      >
                        <FaWallet className="mr-2" />
                        {isLoading ? 'Connecting...' : 'Connect Wallet'}
                      </button>
                      <div className="mt-2 text-xs text-base-content/60 flex items-center">
                        <FaLink className="mr-1" />
                        Supports MetaMask and other Web3 wallets
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card bg-base-100 shadow-xl border-[0.5px] border-cyan-500/20 hover:border-cyan-400/40 hover:shadow-cyan-500/10 transition-all duration-300">
              <div className="card-body">
                <h3 className="card-title text-xl mb-4 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg">
                    <FaCog className="text-cyan-400" />
                  </div>
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Quick Actions
                  </span>
                </h3>
                <div className="space-y-2">
                  <button className="btn btn-outline btn-block">
                    <FaHistory className="mr-2" />
                    View Vote History
                  </button>
                  <button 
                    className="btn btn-outline btn-block"
                    onClick={fetchBlockchainNFTs}
                    disabled={loadingNFTs || !user?.walletAddress}
                  >
                    {loadingNFTs ? (
                      <span className="loading loading-spinner mr-2"></span>
                    ) : (
                      <FaTrophy className="mr-2" />
                    )}
                    My NFT Collection
                  </button>
                  <button className="btn btn-outline btn-block">
                    <FaShieldAlt className="mr-2" />
                    Privacy Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* NFT Collection Modal */}
      {showNFTModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FaTrophy className="text-warning" />
              My NFT Collection
              <div className="badge badge-primary ml-2">{blockchainNFTs.length} NFTs</div>
            </h3>

            <div className="tabs tabs-boxed mb-4">
              <a className="tab tab-active">Blockchain NFTs</a>
              <a className="tab">Database Records</a>
            </div>

            {blockchainNFTs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {blockchainNFTs.map((nft, index) => (
                  <div key={nft.tokenId} className="card bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                    <div className="card-body p-4">
                      <h4 className="font-bold flex items-center gap-2">
                        <FaCertificate className="text-success" />
                        Voting NFT #{nft.tokenId}
                      </h4>
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="opacity-70">Type:</span> {nft.type}
                        </div>
                        <div>
                          <span className="opacity-70">Token ID:</span> 
                          <code className="bg-base-300 px-1 ml-1 rounded">{nft.tokenId}</code>
                        </div>
                        <div>
                          <span className="opacity-70">Contract:</span>
                          <code className="bg-base-300 px-1 ml-1 rounded text-xs">
                            {nft.contractAddress.substring(0, 10)}...
                          </code>
                        </div>
                      </div>
                      <div className="card-actions justify-end mt-2">
                        <div className="badge badge-success badge-sm">Minted</div>
                        <div className="badge badge-outline badge-sm">On-Chain</div>
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

            {/* Database NFTs for comparison */}
            {user?.nftBadges && user.nftBadges.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Database Records ({user.nftBadges.length})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {user.nftBadges.map((badge, index) => (
                    <div key={index} className="bg-base-200 p-3 rounded-lg text-sm">
                      <div>Election: {badge.electionId}</div>
                      <div>Type: {badge.badgeType}</div>
                      <div>Minted: {new Date(badge.mintedAt).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-action">
              <button 
                className="btn btn-primary"
                onClick={() => window.open(`https://localhost:8545`, '_blank')}
              >
                <FaExternalLinkAlt className="mr-2" />
                View on Block Explorer
              </button>
              <button 
                className="btn"
                onClick={() => setShowNFTModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;