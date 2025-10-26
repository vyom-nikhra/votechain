import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI, electionsAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
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
  FaRocket
} from 'react-icons/fa';

const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => analyticsAPI.getDashboardStats(),
    select: (response) => response.data,
  });

  const { data: electionsData, isLoading: electionsLoading } = useQuery({
    queryKey: ['recent-elections'],
    queryFn: () => electionsAPI.getAll({ limit: 5 }),
    select: (response) => response.data.elections || [],
  });

  const handleLogout = () => {
    logout();
    navigate('/');
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
        {/* Header */}
        <motion.div 
          variants={itemVariants}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-base-content">
              Welcome back, {user?.firstName || 'Student'}! 👋
            </h1>
            <p className="text-base-content/70 text-lg mt-2">
              Ready to participate in democratic decision making?
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="btn btn-ghost btn-circle">
              <FaBell className="text-xl" />
            </button>
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-10">
                    <FaUser />
                  </div>
                </div>
              </div>
              <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                <li><a onClick={() => navigate('/profile')}><FaUser className="mr-2" />Profile</a></li>
                <li><a><FaCog className="mr-2" />Settings</a></li>
                <li><a onClick={handleLogout}><FaSignOutAlt className="mr-2" />Logout</a></li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="stat bg-base-100 rounded-lg shadow-lg">
            <div className="stat-figure text-primary">
              <FaVoteYea className="text-3xl" />
            </div>
            <div className="stat-title">Total Elections</div>
            <div className="stat-value text-primary">
              {statsLoading ? '...' : stats?.totalElections || 0}
            </div>
            <div className="stat-desc">Available to vote</div>
          </div>

          <div className="stat bg-base-100 rounded-lg shadow-lg">
            <div className="stat-figure text-success">
              <FaChartBar className="text-3xl" />
            </div>
            <div className="stat-title">Votes Cast</div>
            <div className="stat-value text-success">
              {statsLoading ? '...' : stats?.votescast || 0}
            </div>
            <div className="stat-desc">Your participation</div>
          </div>

          <div className="stat bg-base-100 rounded-lg shadow-lg">
            <div className="stat-figure text-warning">
              <FaCalendarAlt className="text-3xl" />
            </div>
            <div className="stat-title">Active Elections</div>
            <div className="stat-value text-warning">
              {statsLoading ? '...' : stats?.activeElections || 0}
            </div>
            <div className="stat-desc">Happening now</div>
          </div>

          <div className="stat bg-base-100 rounded-lg shadow-lg">
            <div className="stat-figure text-accent">
              <FaTrophy className="text-3xl" />
            </div>
            <div className="stat-title">NFT Badges</div>
            <div className="stat-value text-accent">
              {statsLoading ? '...' : stats?.nftBadges || 0}
            </div>
            <div className="stat-desc">Earned rewards</div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        >
          {/* Active Elections */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title flex items-center">
                <FaVoteYea className="text-primary mr-2" />
                Active Elections
              </h2>
              <p className="text-base-content/70 mb-4">
                Elections you can vote in right now
              </p>
              
              {electionsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-base-300 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : electionsData && electionsData.length > 0 ? (
                <div className="space-y-4">
                  {electionsData.slice(0, 3).map((election) => {
                    const status = getElectionStatus(election);
                    return (
                      <div key={election._id} className="alert alert-info">
                        <FaCalendarAlt />
                        <div>
                          <h3 className="font-bold">{election.title}</h3>
                          <div className="text-sm">
                            <span className={`badge badge-${status.color} mr-2`}>
                              {status.text}
                            </span>
                            • {election.totalVotes || 0} votes cast
                          </div>
                        </div>
                        {status.status === 'active' && (
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => navigate(`/voting/${election._id}`)}
                          >
                            Vote Now
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaVoteYea className="text-4xl text-base-content/30 mx-auto mb-2" />
                  <p className="text-base-content/50">No active elections at the moment</p>
                </div>
              )}
              
              <div className="card-actions justify-end mt-4">
                <button 
                  className="btn btn-outline"
                  onClick={() => navigate('/elections')}
                >
                  View All Elections
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title flex items-center">
                <FaHistory className="text-success mr-2" />
                Recent Activity
              </h2>
              <p className="text-base-content/70 mb-4">
                Your recent voting activity
              </p>
              
              {statsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-12 bg-base-300 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                      <div>
                        <div className="font-semibold">Voted in {activity.electionTitle}</div>
                        <div className="text-sm text-base-content/60">
                          {new Date(activity.votedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="badge badge-success">Confirmed</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaHistory className="text-4xl text-base-content/30 mx-auto mb-2" />
                  <p className="text-base-content/50">No voting activity yet</p>
                  <p className="text-sm text-base-content/40 mt-1">
                    Start participating in elections to see your activity here
                  </p>
                </div>
              )}
              
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-outline">View All Activity</button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* User Info Card */}
        <motion.div 
          variants={itemVariants}
          className="card bg-gradient-to-r from-primary to-secondary text-primary-content shadow-xl"
        >
          <div className="card-body">
            <h2 className="card-title">Your Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div>
                <div className="text-sm opacity-90">Student ID</div>
                <div className="font-bold">{user?.studentId || 'Loading...'}</div>
              </div>
              <div>
                <div className="text-sm opacity-90">Department</div>
                <div className="font-bold">{user?.department || 'Loading...'}</div>
              </div>
              <div>
                <div className="text-sm opacity-90">Academic Year</div>
                <div className="font-bold">{user?.year ? `Year ${user.year}` : 'Loading...'}</div>
              </div>
              <div>
                <div className="text-sm opacity-90">Wallet Status</div>
                <div className="font-bold">
                  {user?.walletAddress ? (
                    <span className="badge badge-success">Connected</span>
                  ) : (
                    <span className="badge badge-warning">Not Connected</span>
                  )}
                </div>
              </div>
            </div>
            
            {!user?.walletAddress && (
              <div className="mt-4">
                <button className="btn btn-accent">
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