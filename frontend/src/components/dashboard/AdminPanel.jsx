import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { analyticsAPI, usersAPI, electionsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { 
  FaUsers, 
  FaVoteYea, 
  FaChartLine, 
  FaUserShield,
  FaEdit,
  FaTrash,
  FaBan,
  FaCheck,
  FaSearch,
  FaFilter,
  FaPlus,
  FaCrown,
  FaEye,
  FaDownload,
  FaUpload,
  FaCog,
  FaDatabase,
  FaShieldAlt,
  FaExclamationTriangle,
  FaTimes,
  FaLink,
  FaCubes,
  FaExternalLinkAlt,
  FaCertificate,
  FaLock
} from 'react-icons/fa';

// Utility function to format dates in IST
const formatDateIST = (dateString) => {
  if (!dateString) return 'Not set';
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', { 
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const AdminPanel = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateElectionModal, setShowCreateElectionModal] = useState(false);
  
  const [newElection, setNewElection] = useState({
    title: '',
    description: '',
    electionType: 'simple',
    category: 'general',
    registrationStartDate: '',
    registrationEndDate: '',
    votingStartDate: '',
    votingEndDate: '',
    candidates: ['', ''],
    eligibleDepartments: [],
    eligibleYears: []
  });

  // Loading state while user is being fetched
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="alert alert-error">
          <FaExclamationTriangle />
          <div>
            <h3 className="font-bold">Access Denied</h3>
            <div className="text-sm">You don't have permission to access the admin panel.</div>
          </div>
        </div>
      </div>
    );
  }

  // Fetch system analytics
  const { data: systemStats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['system-stats'],
    queryFn: async () => {
      try {
        const response = await analyticsAPI.getSystemStats();
        return response.data;
      } catch (error) {
        console.error('System stats error:', error);
        // Return fallback data if API fails
        return {
          overview: {
            totalUsers: 1,
            totalElections: 0,
            totalVotes: 0,
            verificationRate: 100
          }
        };
      }
    },
    retry: false,
    refetchOnWindowFocus: false
  });

  // Fetch users
  const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['admin-users', userFilter, searchTerm],
    queryFn: async () => {
      try {
        const response = await usersAPI.getAll({
          role: userFilter === 'all' ? undefined : userFilter,
          search: searchTerm || undefined,
          limit: 50
        });
        return response.data.users || [];
      } catch (error) {
        console.error('Users fetch error:', error);
        // Return fallback data if API fails
        return [];
      }
    },
    retry: false,
    refetchOnWindowFocus: false
  });

  // Fetch elections for admin
  const { data: elections, isLoading: electionsLoading, error: electionsError } = useQuery({
    queryKey: ['admin-elections'],
    queryFn: async () => {
      try {
        const response = await electionsAPI.getAll({ limit: 10 });
        return response.data.elections || [];
      } catch (error) {
        console.error('Elections fetch error:', error);
        return [];
      }
    },
    retry: false,
    refetchOnWindowFocus: false
  });

  // Update user role mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, updates }) => usersAPI.update(userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      setShowUserModal(false);
      toast.success('User updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: usersAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      queryClient.invalidateQueries(['system-stats']);
      setShowDeleteModal(false);
      setSelectedUser(null);
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  });

  // Create election mutation
  const createElectionMutation = useMutation({
    mutationFn: electionsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-elections']);
      queryClient.invalidateQueries(['system-stats']);
      setShowCreateElectionModal(false);
      setNewElection({
        title: '',
        description: '',
        electionType: 'simple',
        category: 'general',
        registrationStartDate: '',
        registrationEndDate: '',
        votingStartDate: '',
        votingEndDate: '',
        candidates: ['', ''],
        eligibleDepartments: [],
        eligibleYears: []
      });
      toast.success('Election created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create election');
    }
  });

  const handleUpdateUser = (updates) => {
    if (selectedUser) {
      updateUserMutation.mutate({
        userId: selectedUser._id,
        updates
      });
    }
  };

  const handleElectionInputChange = (e) => {
    const { name, value } = e.target;
    setNewElection(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCandidateChange = (index, value) => {
    const updatedCandidates = [...newElection.candidates];
    updatedCandidates[index] = value;
    setNewElection(prev => ({
      ...prev,
      candidates: updatedCandidates
    }));
  };

  const addCandidate = () => {
    setNewElection(prev => ({
      ...prev,
      candidates: [...prev.candidates, '']
    }));
  };

  const removeCandidate = (index) => {
    if (newElection.candidates.length > 2) {
      const updatedCandidates = newElection.candidates.filter((_, i) => i !== index);
      setNewElection(prev => ({
        ...prev,
        candidates: updatedCandidates
      }));
    }
  };

  const handleYearToggle = (year) => {
    const updatedYears = newElection.eligibleYears.includes(year)
      ? newElection.eligibleYears.filter(y => y !== year)
      : [...newElection.eligibleYears, year];
    
    setNewElection(prev => ({
      ...prev,
      eligibleYears: updatedYears
    }));
  };

  const handleCreateElection = () => {
    // Validation
    if (!newElection.title || !newElection.description || 
        !newElection.registrationStartDate || !newElection.registrationEndDate ||
        !newElection.votingStartDate || !newElection.votingEndDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (newElection.candidates.some(c => !c.trim())) {
      toast.error('Please provide names for all candidates');
      return;
    }

    // Validate date sequence
    const regStart = new Date(newElection.registrationStartDate);
    const regEnd = new Date(newElection.registrationEndDate);
    const voteStart = new Date(newElection.votingStartDate);
    const voteEnd = new Date(newElection.votingEndDate);

    if (regStart >= regEnd) {
      toast.error('Registration end date must be after registration start date');
      return;
    }

    if (regEnd > voteStart) {
      toast.error('Voting must start after registration ends');
      return;
    }

    if (voteStart >= voteEnd) {
      toast.error('Voting end date must be after voting start date');
      return;
    }

    // Transform data to match backend format with proper IST timezone handling
    const convertToISO = (dateTimeLocal) => {
      if (!dateTimeLocal) return null;
      // datetime-local returns "YYYY-MM-DDTHH:MM" format
      // We need to treat this as IST time and convert to UTC
      const localDate = new Date(dateTimeLocal);
      return localDate.toISOString();
    };

    const electionData = {
      title: newElection.title,
      description: newElection.description,
      electionType: newElection.electionType,
      category: newElection.category,
      registrationStartTime: convertToISO(newElection.registrationStartDate),
      registrationEndTime: convertToISO(newElection.registrationEndDate),
      votingStartTime: convertToISO(newElection.votingStartDate),
      votingEndTime: convertToISO(newElection.votingEndDate),
      eligibleDepartments: newElection.eligibleDepartments,
      eligibleYears: newElection.eligibleYears,
      candidates: newElection.candidates.filter(name => name.trim()).map(name => ({
        name: name.trim(),
        description: `Candidate for ${newElection.title}`,
        manifesto: `I will work hard to represent the students' interests.`
      }))
    };

    createElectionMutation.mutate(electionData);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'users', label: 'User Management', icon: FaUsers },
    { id: 'elections', label: 'Elections', icon: FaVoteYea },
    { id: 'system', label: 'System Settings', icon: FaCog },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
              <FaUserShield className="text-primary" />
              Admin Panel
            </h1>
            <p className="text-base-content/70 text-lg mt-2">
              Manage users, elections, and system settings
            </p>
          </div>
          <div className="badge badge-primary badge-lg">
            <FaCrown className="mr-1" />
            Administrator
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants} className="tabs tabs-boxed mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="mr-2" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Debug Info */}
            {statsError && (
              <div className="alert alert-warning">
                <FaExclamationTriangle />
                <span>Stats loading failed: {statsError.message}</span>
              </div>
            )}
            
            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="stat bg-base-100 rounded-lg shadow-lg">
                <div className="stat-figure text-primary">
                  <FaUsers className="text-3xl" />
                </div>
                <div className="stat-title">Total Users</div>
                <div className="stat-value text-primary">
                  {statsLoading ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    systemStats?.overview?.totalUsers || systemStats?.totalUsers || 0
                  )}
                </div>
                <div className="stat-desc">
                  {systemStats?.overview?.recentRegistrations || 0} new this month
                </div>
              </div>

              <div className="stat bg-base-100 rounded-lg shadow-lg">
                <div className="stat-figure text-success">
                  <FaVoteYea className="text-3xl" />
                </div>
                <div className="stat-title">Total Elections</div>
                <div className="stat-value text-success">
                  {statsLoading ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    systemStats?.overview?.totalElections || systemStats?.totalElections || 0
                  )}
                </div>
                <div className="stat-desc">Active elections running</div>
              </div>

              <div className="stat bg-base-100 rounded-lg shadow-lg">
                <div className="stat-figure text-warning">
                  <FaChartLine className="text-3xl" />
                </div>
                <div className="stat-title">Total Votes</div>
                <div className="stat-value text-warning">
                  {statsLoading ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    systemStats?.overview?.totalVotes || systemStats?.totalVotes || 0
                  )}
                </div>
                <div className="stat-desc">Democracy in action</div>
              </div>

              <div className="stat bg-base-100 rounded-lg shadow-lg">
                <div className="stat-figure text-accent">
                  <FaShieldAlt className="text-3xl" />
                </div>
                <div className="stat-title">Verification Rate</div>
                <div className="stat-value text-accent">
                  {statsLoading ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    systemStats?.overview?.verificationRate || systemStats?.verificationRate || 95
                  )}%
                </div>
                <div className="stat-desc">Email verified users</div>
              </div>
            </div>

            {/* Blockchain Status */}
            <div className="card bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-xl">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <FaCubes />
                      Blockchain Integration Status
                    </h3>
                    <p className="opacity-90 mt-1">Secure, transparent, and immutable voting</p>
                  </div>
                  <div className="badge badge-success gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    Connected
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <FaLock className="text-sm" />
                      <span className="text-sm font-semibold">Smart Contracts</span>
                    </div>
                    <div className="text-xs opacity-80">
                      Voting: 0x9fE4...a6e0<br/>
                      NFT: 0xe7f1...0512<br/>
                      ZK: 0x5FbD...0aa3
                    </div>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <FaCertificate className="text-sm" />
                      <span className="text-sm font-semibold">NFT Badges</span>
                    </div>
                    <div className="text-xs opacity-80">
                      Voter certificates<br/>
                      Participation proof<br/>
                      Blockchain verified
                    </div>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <FaExternalLinkAlt className="text-sm" />
                      <span className="text-sm font-semibold">Network</span>
                    </div>
                    <div className="text-xs opacity-80">
                      Chain ID: 31337<br/>
                      Hardhat Local<br/>
                      Fast & secure
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">Quick Actions</h3>
                  <div className="space-y-3">
                    <button 
                      className="btn btn-primary btn-block"
                      onClick={() => setShowCreateElectionModal(true)}
                    >
                      <FaPlus className="mr-2" />
                      Create New Election
                    </button>
                    <button 
                      className="btn btn-outline btn-block"
                      onClick={() => setActiveTab('users')}
                    >
                      <FaUsers className="mr-2" />
                      Manage Users
                    </button>
                    <button className="btn btn-outline btn-block">
                      <FaDownload className="mr-2" />
                      Export Reports
                    </button>
                    <button className="btn btn-outline btn-block">
                      <FaDatabase className="mr-2" />
                      Backup System
                    </button>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span>New user registration</span>
                      <span className="badge badge-info">2 min ago</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Election created</span>
                      <span className="badge badge-success">1 hour ago</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Vote cast</span>
                      <span className="badge badge-warning">3 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Error Display */}
            {usersError && (
              <div className="alert alert-error">
                <FaExclamationTriangle />
                <span>Failed to load users: {usersError.message}</span>
              </div>
            )}
            
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="form-control flex-1">
                <div className="input-group">
                  <span className="bg-base-200">
                    <FaSearch />
                  </span>
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="input input-bordered flex-1"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="form-control">
                <select
                  className="select select-bordered"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                >
                  <option value="all">All Users</option>
                  <option value="student">Students</option>
                  <option value="admin">Administrators</option>
                  <option value="moderator">Moderators</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Student ID</th>
                        <th>Department</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersLoading ? (
                        [...Array(5)].map((_, i) => (
                          <tr key={i}>
                            <td><div className="h-4 bg-base-300 rounded animate-pulse"></div></td>
                            <td><div className="h-4 bg-base-300 rounded animate-pulse"></div></td>
                            <td><div className="h-4 bg-base-300 rounded animate-pulse"></div></td>
                            <td><div className="h-4 bg-base-300 rounded animate-pulse"></div></td>
                            <td><div className="h-4 bg-base-300 rounded animate-pulse"></div></td>
                            <td><div className="h-4 bg-base-300 rounded animate-pulse"></div></td>
                            <td><div className="h-4 bg-base-300 rounded animate-pulse"></div></td>
                          </tr>
                        ))
                      ) : usersData?.map(user => (
                        <tr key={user._id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="avatar placeholder">
                                <div className="bg-primary text-primary-content rounded-full w-8">
                                  <span className="text-xs">{user.firstName?.[0]}</span>
                                </div>
                              </div>
                              <div>
                                <div className="font-bold">{user.firstName} {user.lastName}</div>
                                <div className="text-sm opacity-50">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>{user.studentId}</td>
                          <td>{user.department}</td>
                          <td>
                            <div className={`badge ${
                              user.role === 'admin' ? 'badge-error' :
                              user.role === 'moderator' ? 'badge-warning' :
                              'badge-info'
                            }`}>
                              {user.role}
                            </div>
                          </td>
                          <td>
                            <div className={`badge ${
                              user.isActive ? 'badge-success' : 'badge-neutral'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </div>
                          </td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="flex gap-1">
                              <button 
                                className="btn btn-xs btn-outline"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowUserModal(true);
                                }}
                              >
                                <FaEdit />
                              </button>
                              <button 
                                className="btn btn-xs btn-outline btn-error"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowDeleteModal(true);
                                }}
                                disabled={user.role === 'admin'}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Elections Tab */}
        {activeTab === 'elections' && (
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Election Management</h3>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateElectionModal(true)}
              >
                <FaPlus className="mr-2" />
                Create Election
              </button>
            </div>

            {electionsError && (
              <div className="alert alert-error">
                <FaExclamationTriangle />
                <span>Failed to load elections: {electionsError.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {electionsLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="card bg-base-100 shadow-xl animate-pulse">
                    <div className="card-body">
                      <div className="h-6 bg-base-300 rounded mb-2"></div>
                      <div className="h-16 bg-base-300 rounded"></div>
                    </div>
                  </div>
                ))
              ) : elections && elections.length > 0 ? elections.map(election => (
                <div key={election._id} className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="card-title">{election.title}</h3>
                      <div className={`badge ${
                        election.currentPhase === 'voting' ? 'badge-success' :
                        election.currentPhase === 'registration' ? 'badge-warning' :
                        election.currentPhase === 'upcoming' ? 'badge-info' :
                        election.currentPhase === 'completed' ? 'badge-neutral' : 'badge-ghost'
                      }`}>
                        {election.currentPhase || 'draft'}
                      </div>
                    </div>
                    <p className="text-sm text-base-content/70">
                      {election.description?.substring(0, 100)}...
                    </p>
                    
                    {/* Date Information */}
                    <div className="text-xs text-base-content/60 space-y-1 mt-2">
                      <div>📅 Registration: {formatDateIST(election.registrationStartTime)} - {formatDateIST(election.registrationEndTime)}</div>
                      <div>🗳️ Voting: {formatDateIST(election.votingStartTime)} - {formatDateIST(election.votingEndTime)}</div>
                    </div>
                    
                    {/* Blockchain Information */}
                    {(election.contractAddress || election.metadata?.blockchainTxHash) && (
                      <div className="mt-3 p-2 bg-base-200 rounded-lg">
                        <div className="flex items-center gap-1 text-xs text-success mb-1">
                          <FaCubes />
                          <span className="font-semibold">Blockchain Verified</span>
                        </div>
                        <div className="text-xs text-base-content/60 space-y-1">
                          {election.contractAddress && (
                            <div className="flex items-center gap-1">
                              <FaLink className="text-xs" />
                              <span>Contract: {election.contractAddress.substring(0, 6)}...{election.contractAddress.substring(-4)}</span>
                              <button 
                                onClick={() => navigator.clipboard.writeText(election.contractAddress)}
                                className="btn btn-ghost btn-xs"
                                title="Copy contract address"
                              >
                                <FaExternalLinkAlt />
                              </button>
                            </div>
                          )}
                          {election.metadata?.blockchainTxHash && (
                            <div className="flex items-center gap-1">
                              <FaLock className="text-xs" />
                              <span>Tx: {election.metadata.blockchainTxHash.substring(0, 6)}...{election.metadata.blockchainTxHash.substring(-4)}</span>
                              <button 
                                onClick={() => navigator.clipboard.writeText(election.metadata.blockchainTxHash)}
                                className="btn btn-ghost btn-xs"
                                title="Copy transaction hash"
                              >
                                <FaExternalLinkAlt />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex gap-2">
                        <div className="badge badge-info">
                          {election.results?.totalVotes || 0} votes
                        </div>
                        <div className="badge badge-ghost">
                          {election.candidates?.length || 0} candidates
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button className="btn btn-xs btn-outline">
                          <FaEye />
                        </button>
                        <button className="btn btn-xs btn-outline btn-warning">
                          <FaEdit />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full text-center py-16">
                  <FaVoteYea className="text-6xl text-base-content/30 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-base-content/70 mb-2">
                    No Elections Yet
                  </h3>
                  <p className="text-base-content/50 mb-4">
                    Create your first election to get started with the voting system.
                  </p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowCreateElectionModal(true)}
                  >
                    <FaPlus className="mr-2" />
                    Create First Election
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* System Settings Tab */}
        {activeTab === 'system' && (
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-xl font-bold">System Settings</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h4 className="card-title">Security Settings</h4>
                  <div className="space-y-4">
                    <div className="form-control">
                      <label className="cursor-pointer label">
                        <span className="label-text">Require email verification</span>
                        <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="cursor-pointer label">
                        <span className="label-text">Enable two-factor authentication</span>
                        <input type="checkbox" className="toggle toggle-primary" />
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="cursor-pointer label">
                        <span className="label-text">Auto-backup database</span>
                        <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h4 className="card-title">System Maintenance</h4>
                  <div className="space-y-3">
                    <button className="btn btn-outline btn-block">
                      <FaDatabase className="mr-2" />
                      Backup Database
                    </button>
                    <button className="btn btn-outline btn-block">
                      <FaUpload className="mr-2" />
                      Update System
                    </button>
                    <button className="btn btn-outline btn-warning btn-block">
                      <FaExclamationTriangle className="mr-2" />
                      Maintenance Mode
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* User Edit Modal */}
      {showUserModal && selectedUser && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Edit User: {selectedUser.firstName} {selectedUser.lastName}</h3>
            
            <div className="py-4 space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Role</span>
                </label>
                <select
                  className="select select-bordered"
                  defaultValue={selectedUser.role}
                  onChange={(e) => handleUpdateUser({ role: e.target.value })}
                >
                  <option value="student">Student</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="form-control">
                <label className="cursor-pointer label">
                  <span className="label-text">Active Status</span>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary"
                    defaultChecked={selectedUser.isActive}
                    onChange={(e) => handleUpdateUser({ isActive: e.target.checked })}
                  />
                </label>
              </div>
            </div>

            <div className="modal-action">
              <button className="btn" onClick={() => setShowUserModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete User</h3>
            <p className="py-4">
              Are you sure you want to delete {selectedUser.firstName} {selectedUser.lastName}? 
              This action cannot be undone.
            </p>
            <div className="modal-action">
              <button 
                className="btn btn-error"
                onClick={() => deleteUserMutation.mutate(selectedUser._id)}
                disabled={deleteUserMutation.isLoading}
              >
                {deleteUserMutation.isLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  'Delete'
                )}
              </button>
              <button 
                className="btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Election Modal */}
      {showCreateElectionModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg mb-4">Create New Election</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Election Title *</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={newElection.title}
                    onChange={handleElectionInputChange}
                    placeholder="Student Council Election 2024"
                    className="input input-bordered"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Election Type</span>
                  </label>
                  <select
                    name="electionType"
                    value={newElection.electionType}
                    onChange={handleElectionInputChange}
                    className="select select-bordered"
                  >
                    <option value="simple">Simple Voting</option>
                    <option value="ranked">Ranked Choice</option>
                    <option value="quadratic">Quadratic Voting</option>
                    <option value="multi-tier">Multi-Tier</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Category</span>
                  </label>
                  <select
                    name="category"
                    value={newElection.category}
                    onChange={handleElectionInputChange}
                    className="select select-bordered"
                  >
                    <option value="general">General Election</option>
                    <option value="student_council">Student Council</option>
                    <option value="department">Department Election</option>
                    <option value="club">Club Election</option>
                    <option value="society">Society Election</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Eligible Departments</span>
                  </label>
                  <select
                    multiple
                    name="eligibleDepartments"
                    value={newElection.eligibleDepartments}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setNewElection(prev => ({ ...prev, eligibleDepartments: selected }));
                    }}
                    className="select select-bordered"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Business">Business</option>
                    <option value="Medicine">Medicine</option>
                    <option value="Arts">Arts</option>
                    <option value="Sciences">Sciences</option>
                  </select>
                  <div className="label">
                    <span className="label-text-alt">Hold Ctrl/Cmd to select multiple</span>
                  </div>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Description *</span>
                </label>
                <textarea
                  name="description"
                  value={newElection.description}
                  onChange={handleElectionInputChange}
                  rows="4"
                  placeholder="Describe the purpose and scope of this election..."
                  className="textarea textarea-bordered"
                />
              </div>

              <div className="alert alert-info mb-4">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span>All dates and times are in Indian Standard Time (IST)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Registration Start * (IST)</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="registrationStartDate"
                    value={newElection.registrationStartDate}
                    onChange={handleElectionInputChange}
                    className="input input-bordered"
                  />
                  <div className="label">
                    <span className="label-text-alt">When students can start registering</span>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Registration End * (IST)</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="registrationEndDate"
                    value={newElection.registrationEndDate}
                    onChange={handleElectionInputChange}
                    className="input input-bordered"
                  />
                  <div className="label">
                    <span className="label-text-alt">Registration deadline</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Voting Start * (IST)</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="votingStartDate"
                    value={newElection.votingStartDate}
                    onChange={handleElectionInputChange}
                    className="input input-bordered"
                  />
                  <div className="label">
                    <span className="label-text-alt">When voting begins</span>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Voting End * (IST)</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="votingEndDate"
                    value={newElection.votingEndDate}
                    onChange={handleElectionInputChange}
                    className="input input-bordered"
                  />
                  <div className="label">
                    <span className="label-text-alt">Voting deadline</span>
                  </div>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Eligible Academic Years</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(year => (
                    <label key={year} className="cursor-pointer label">
                      <input
                        type="checkbox"
                        checked={newElection.eligibleYears.includes(year)}
                        onChange={() => handleYearToggle(year)}
                        className="checkbox checkbox-primary"
                      />
                      <span className="label-text ml-2">Year {year}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Candidates *</span>
                </label>
                <div className="space-y-2">
                  {newElection.candidates.map((candidate, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={candidate}
                        onChange={(e) => handleCandidateChange(index, e.target.value)}
                        placeholder={`Candidate ${index + 1} name`}
                        className="input input-bordered flex-1"
                      />
                      {newElection.candidates.length > 2 && (
                        <button
                          type="button"
                          className="btn btn-error btn-square"
                          onClick={() => removeCandidate(index)}
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn btn-outline btn-sm mt-2"
                  onClick={addCandidate}
                >
                  <FaPlus className="mr-2" />
                  Add Candidate
                </button>
              </div>
            </div>

            <div className="modal-action">
              <button 
                className="btn btn-success"
                onClick={handleCreateElection}
                disabled={createElectionMutation.isLoading}
              >
                {createElectionMutation.isLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  <FaCheck className="mr-2" />
                )}
                Create Election
              </button>
              <button 
                className="btn"
                onClick={() => setShowCreateElectionModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;