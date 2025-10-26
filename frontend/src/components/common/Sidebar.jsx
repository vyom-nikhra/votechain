import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import { 
  MdDashboard, 
  MdHowToVote, 
  MdPerson, 
  MdAdminPanelSettings,
  MdAccountBalanceWallet,
  MdLogout
} from 'react-icons/md';
import { FaCubes } from 'react-icons/fa';

const Sidebar = () => {
  const { user, isAdmin, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: <MdDashboard className="text-xl" />,
      description: 'Overview & Stats'
    },
    {
      path: '/elections',
      name: 'Elections',
      icon: <MdHowToVote className="text-xl" />,
      description: 'Browse & Vote'
    },
    {
      path: '/blockchain',
      name: 'Blockchain',
      icon: <FaCubes className="text-xl" />,
      description: 'NFTs & Explorer'
    },
    {
      path: '/profile',
      name: 'Profile',
      icon: <MdPerson className="text-xl" />,
      description: 'Your Account'
    },
  ];

  if (isAdmin()) {
    navItems.push({
      path: '/create-election',
      name: 'Create Election',
      icon: <MdAdminPanelSettings className="text-xl" />,
      description: 'New Election'
    });
    navItems.push({
      path: '/live-results',
      name: 'Live Results',
      icon: <MdHowToVote className="text-xl" />,
      description: 'Monitor Voting'
    });
  }

  return (
    <motion.aside 
      className="fixed left-0 top-0 h-screen w-64 bg-base-200 border-r border-base-300 z-40"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo */}
      <div className="p-6 border-b border-base-300">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white">
            <MdAccountBalanceWallet className="text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-base-content">VoteChain</h1>
            <p className="text-xs text-base-content/60">Decentralized Voting</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-base-300">
        <div className="flex items-center space-x-3">
          <div className="avatar placeholder">
            <div className="bg-primary text-white rounded-full w-10">
              <span className="text-sm font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-base-content truncate">
              {user?.name}
            </p>
            <p className="text-xs text-base-content/60 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        {user?.role === 'admin' && (
          <div className="mt-2">
            <span className="badge badge-primary badge-xs">Admin</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'text-base-content hover:bg-base-300'
              }`
            }
          >
            {item.icon}
            <div className="flex-1">
              <div className="font-medium">{item.name}</div>
              <div className="text-xs opacity-70">{item.description}</div>
            </div>
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-base-300">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 w-full text-error hover:bg-error/10"
        >
          <MdLogout className="text-xl" />
          <div className="flex-1 text-left">
            <div className="font-medium">Logout</div>
            <div className="text-xs opacity-70">Sign out</div>
          </div>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;