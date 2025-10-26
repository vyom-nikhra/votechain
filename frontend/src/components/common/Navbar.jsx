import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  MdDarkMode, 
  MdNotifications, 
  MdLogout, 
  MdPerson, 
  MdHistory,
  MdAdminPanelSettings 
} from 'react-icons/md';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/dashboard': return 'Dashboard';
      case '/elections': return 'Elections';
      case '/admin': return 'Admin Panel';
      case '/profile': return 'Profile';
      default: 
        if (path.includes('/vote/')) return 'Cast Your Vote';
        return 'VoteChain';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-base-100 border-b border-base-300 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Page Title & Breadcrumbs */}
        <div>
          <h1 className="text-2xl font-bold text-base-content">
            {getPageTitle()}
          </h1>
          <div className="text-sm breadcrumbs">
            <ul>
              <li><span className="text-base-content/60">VoteChain</span></li>
              <li><span className="text-primary">{getPageTitle()}</span></li>
            </ul>
          </div>
        </div>

        {/* Right side - Theme toggle, Notifications, User menu */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
              <MdDarkMode className="text-xl" />
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-40 border border-base-300">
              <li><button data-set-theme="votechain" data-act-class="active">Default</button></li>
              <li><button data-set-theme="dark" data-act-class="active">Dark</button></li>
              <li><button data-set-theme="light" data-act-class="active">Light</button></li>
              <li><button data-set-theme="cupcake" data-act-class="active">Cupcake</button></li>
              <li><button data-set-theme="cyberpunk" data-act-class="active">Cyberpunk</button></li>
            </ul>
          </div>

          {/* Notifications */}
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
              <div className="indicator">
                <MdNotifications className="text-xl" />
                <span className="badge badge-xs badge-primary indicator-item"></span>
              </div>
            </div>
            <div tabIndex={0} className="dropdown-content z-[1] card card-compact w-80 p-2 shadow-lg bg-base-100 border border-base-300">
              <div className="card-body">
                <h3 className="card-title text-sm">Notifications</h3>
                <div className="space-y-2">
                  <div className="alert alert-info py-2">
                    <span className="text-xs">New election available: Student Council 2024</span>
                  </div>
                  <div className="alert alert-success py-2">
                    <span className="text-xs">Your vote was successfully recorded</span>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn btn-primary btn-sm btn-block">View All</button>
                </div>
              </div>
            </div>
          </div>

          {/* User Menu */}
          <div className="dropdown dropdown-end">
            <div 
              tabIndex={0} 
              role="button" 
              className="btn btn-ghost btn-circle avatar"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="w-10 rounded-full bg-primary text-white flex items-center justify-center">
                <span className="text-sm font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <AnimatePresence>
              {showUserMenu && (
                <motion.ul 
                  tabIndex={0} 
                  className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-300"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <li className="menu-title">
                    <span className="text-base-content/60">Account</span>
                  </li>
                  <li>
                    <button 
                      onClick={() => {
                        navigate('/profile');
                        setShowUserMenu(false);
                      }}
                      className="justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <MdPerson />
                        <span>Profile</span>
                      </div>
                      <span className="badge badge-sm">Settings</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setShowUserMenu(false)}>
                      <MdHistory />
                      Voting History
                    </button>
                  </li>
                  {user?.role === 'admin' && (
                    <li>
                      <button 
                        onClick={() => {
                          navigate('/admin');
                          setShowUserMenu(false);
                        }}
                      >
                        <MdAdminPanelSettings />
                        Admin Panel
                      </button>
                    </li>
                  )}
                  <div className="divider my-1"></div>
                  <li>
                    <button 
                      onClick={handleLogout}
                      className="text-error"
                    >
                      <MdLogout />
                      Logout
                    </button>
                  </li>
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;