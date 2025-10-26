import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI, electionsAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import walletService from '../../services/walletService';
import toast from 'react-hot-toast';
import Breadcrumbs from '../common/Breadcrumbs';
import { 
  FaUser, 
  FaVoteYea, 
  FaChartBar, 
  FaCog, 
  FaSignOutAlt,
  FaBell,
  FaCalendarAlt,
  FaTrophy,
  FaHistory,
  FaWallet,
  FaShieldAlt,
  FaRocket,
  FaUsers,
  FaClock,
  FaCheck
} from 'react-icons/fa';

const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['overview-stats'],
    queryFn: () => analyticsAPI.getOverviewStats(),
    select: (response) => response.data,
    refetchInterval: 30000, // Refetch every 30 seconds for live updates
  });

  const recentElections = stats?.recentElections || [];
  const electionsLoading = statsLoading;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleConnectWallet = async () => {
    try {
      if (!walletService.isMetaMaskAvailable()) {
        toast.error('MetaMask is not installed. Please install MetaMask to connect your wallet.');
        window.open('https://metamask.io/download/', '_blank');
        return;
      }

      const result = await walletService.connectWallet();
      
      if (result.success) {
        toast.success('Wallet connected! Please update your profile to save the wallet address.');
        navigate('/profile');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to connect wallet');
    }
  };

  const getElectionStatus = (election) => {
    const now = new Date();
    const startDate = new Date(election.votingStartTime || election.startDate);
    const endDate = new Date(election.votingEndTime || election.endDate);

    if (now < startDate) {
      return { status: 'upcoming', color: 'info', text: 'Upcoming' };
    } else if (now >= startDate && now <= endDate) {
      return { status: 'active', color: 'success', text: 'Active' };
    } else {
      return { status: 'ended', color: 'neutral', text: 'Ended' };
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Breadcrumbs */}
        <Breadcrumbs customItems={[{ label: 'Dashboard' }]} />

        {/* Header */}
        <motion.div 
          variants={itemVariants}
          className="mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Welcome back, {user?.firstName || 'Student'}!
            </span>
            <span className="ml-2">👋</span>
          </h1>
          <p className="text-base-content/70 text-lg">
            Ready to participate in democratic decision making?
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10"
        >
          <div className="card bg-base-100 shadow-xl border-[0.5px] border-blue-500/20 hover:border-blue-400/50 hover:shadow-blue-500/20 transition-all duration-300 group">
            <div className="card-body p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-base-content/60 mb-2 flex items-center gap-2">
                    <FaVoteYea className="text-primary" />
                    Total Elections
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {statsLoading ? '...' : stats?.overview?.totalElections || 0}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <FaVoteYea className="text-2xl text-blue-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl border-[0.5px] border-green-500/20 hover:border-green-400/50 hover:shadow-green-500/20 transition-all duration-300 group">
            <div className="card-body p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-base-content/60 mb-2 flex items-center gap-2">
                    <FaChartBar className="text-success" />
                    Votes Cast
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    {statsLoading ? '...' : stats?.overview?.totalVotes || 0}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <FaChartBar className="text-2xl text-green-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl border-[0.5px] border-yellow-500/20 hover:border-yellow-400/50 hover:shadow-yellow-500/20 transition-all duration-300 group">
            <div className="card-body p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-base-content/60 mb-2 flex items-center gap-2">
                    <FaCalendarAlt className="text-warning" />
                    Active Elections
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    {statsLoading ? '...' : stats?.overview?.activeElections || 0}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <FaCalendarAlt className="text-2xl text-yellow-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl border-[0.5px] border-pink-500/20 hover:border-pink-400/50 hover:shadow-pink-500/20 transition-all duration-300 group">
            <div className="card-body p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-base-content/60 mb-2 flex items-center gap-2">
                    <FaTrophy className="text-accent" />
                    NFT Badges
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                    {statsLoading ? '...' : stats?.overview?.totalVotes || 0}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <FaTrophy className="text-2xl text-pink-400" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10"
        >
          {/* Active Elections */}
          <div className="card bg-base-100 shadow-xl border-[0.5px] border-blue-500/20 hover:border-purple-400/40 hover:shadow-blue-500/10 transition-all duration-300">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
                  <FaVoteYea className="text-primary" />
                </div>
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Active Elections
                </span>
              </h2>
              
              {electionsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-base-300 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : recentElections && recentElections.length > 0 ? (
                <div className="space-y-4">
                  {recentElections.slice(0, 3).map((election) => {
                    const status = getElectionStatus(election);
                    return (
                      <div key={election._id} className="group border-[0.5px] border-gray-700 rounded-xl p-4 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 bg-base-100/50">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base-content mb-2 truncate group-hover:text-primary transition-colors">{election.title}</h3>
                            <div className="flex items-center gap-3 text-sm">
                              <span className={`badge badge-sm ${
                                status.status === 'active' 
                                  ? 'badge-success' 
                                  : status.status === 'upcoming'
                                  ? 'badge-info'
                                  : 'badge-neutral'
                              }`}>
                                {status.text}
                              </span>
                              <span className="text-base-content/60">
                                {election.totalVotes || 0} votes
                              </span>
                            </div>
                          </div>
                          {status.status === 'active' && (
                            <button 
                              className="btn btn-sm btn-primary hover:scale-105 transition-transform"
                              onClick={() => navigate(`/voting/${election._id}`)}
                            >
                              Vote
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaVoteYea className="text-4xl text-base-content/30 mx-auto mb-3" />
                  <p className="text-base-content/60">No active elections at the moment</p>
                </div>
              )}
              
              <div className="card-actions justify-end mt-6">
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => navigate('/elections')}
                >
                  View All Elections
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card bg-base-100 shadow-xl border-[0.5px] border-green-500/20 hover:border-green-400/40 hover:shadow-green-500/10 transition-all duration-300">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-success/20 to-success/10 rounded-lg">
                  <FaHistory className="text-success" />
                </div>
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Recent Activity
                </span>
              </h2>
              
              {statsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-base-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentActivity.map((activity, index) => (
                    <div key={index} className="group border-[0.5px] border-gray-700 rounded-xl p-3 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 bg-base-100/50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-base-content truncate group-hover:text-success transition-colors">Voted in {activity.electionTitle}</div>
                          <div className="text-sm text-base-content/60 mt-1">
                            {new Date(activity.votedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <span className="badge badge-success badge-sm gap-1">
                          <FaShieldAlt className="text-xs" />
                          Verified
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaHistory className="text-4xl text-base-content/30 mx-auto mb-3" />
                  <p className="text-base-content/60 mb-2">No voting activity yet</p>
                  <p className="text-sm text-base-content/50">
                    Start participating in elections to see your activity here
                  </p>
                </div>
              )}
              
              <div className="card-actions justify-end mt-6">
                <button className="btn btn-outline btn-sm">
                  View All Activity
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* User Info Card */}
        <motion.div 
          variants={itemVariants}
          className="card bg-base-100 border-[0.5px] border-gray-700 hover:border-purple-500/30 shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          <div className="card-body">
            <h2 className="card-title text-xl mb-6 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
                <FaUser className="text-primary" />
              </div>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Profile Information
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <div className="text-sm text-base-content/60 mb-1">Student ID</div>
                <div className="font-semibold text-base-content text-lg">{user?.studentId || 'Loading...'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-base-content/60 mb-1">Department</div>
                <div className="font-semibold text-base-content text-lg">{user?.department || 'Loading...'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-base-content/60 mb-1">Academic Year</div>
                <div className="font-semibold text-base-content text-lg">{user?.year ? `Year ${user.year}` : 'Loading...'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-base-content/60 mb-1">Wallet Status</div>
                <div>
                  {user?.walletAddress ? (
                    <span className="badge badge-success gap-1">
                      <FaShieldAlt className="text-xs" />
                      Connected
                    </span>
                  ) : (
                    <span className="badge badge-warning gap-1">
                      <FaShieldAlt className="text-xs" />
                      Not Connected
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {!user?.walletAddress && (
              <div className="divider my-4"></div>
            )}
            
            {!user?.walletAddress && (
              <div className="flex justify-end">
                <button 
                  onClick={handleConnectWallet}
                  className="btn btn-primary hover:scale-105 transition-transform"
                >
                  <FaWallet className="mr-2" />
                  Connect Wallet
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Blockchain Security Info */}
        <motion.div 
          variants={itemVariants}
          className="card bg-base-100 shadow-xl mt-8"
        >
          <div className="card-body">
            <h3 className="card-title flex items-center gap-2">
              <FaShieldAlt className="text-primary" />
              Why Blockchain Voting?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div className="text-center">
                <FaShieldAlt className="text-4xl text-success mx-auto mb-3" />
                <h4 className="font-semibold text-lg mb-2">Immutable Records</h4>
                <p className="text-base-content/70">
                  Once cast, votes cannot be altered or deleted, ensuring election integrity
                </p>
              </div>
              <div className="text-center">
                <FaRocket className="text-4xl text-info mx-auto mb-3" />
                <h4 className="font-semibold text-lg mb-2">Instant Results</h4>
                <p className="text-base-content/70">
                  Real-time vote counting with immediate, transparent results
                </p>
              </div>
              <div className="text-center">
                <FaTrophy className="text-4xl text-warning mx-auto mb-3" />
                <h4 className="font-semibold text-lg mb-2">NFT Rewards</h4>
                <p className="text-base-content/70">
                  Earn unique NFT badges for participating in democratic processes
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;