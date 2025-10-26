import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
impor            >
            {item.icon}
            <div className="flex-1">
              <div className="font-medium">{item.name}</div>
              <div className="text-xs opacity-70">{item.description}</div>
            </div>tion } from 'framer-motion';
import { 
  MdDashboard, 
  MdHowToVote, 
  MdPerson, 
  MdAdminPanelSettings,
  MdAccountBalanceWallet 
} from 'react-icons/md';

const Sidebar = () => {
  const { user, isAdmin } = useAuthStore();

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
      path: '/profile',
      name: 'Profile',
      icon: <MdPerson className="text-xl" />,
      description: 'Your Account'
    },
  ];

  if (isAdmin()) {
    navItems.push({
      path: '/admin',
      name: 'Admin Panel',
      icon: <MdAdminPanelSettings className="text-xl" />,
      description: 'System Management'
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
      <nav className="p-4 space-y-2 flex-1">
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

      {/* Footer */}
      <div className="p-4 border-t border-base-300">
        <div className="text-center">
          <p className="text-xs text-base-content/40">
            VoteChain v1.0
          </p>
          <p className="text-xs text-base-content/40">
            Powered by Blockchain
          </p>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;