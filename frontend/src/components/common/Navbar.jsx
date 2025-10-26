import { useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  MdDarkMode, 
  MdNotifications, 
  MdLogout, 
  MdPerson, 
  MdHistory,
  MdAdminPanelSettings 
} from 'react-icons/md';
import { cn } from '../../lib/utils';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);
  
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 100) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

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
    <motion.header 
      ref={navRef}
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        isScrolled ? "bg-transparent" : "bg-base-100 border-b border-base-300"
      )}
    >
      <motion.div 
        animate={{
          backdropFilter: isScrolled ? "blur(10px)" : "none",
          boxShadow: isScrolled
            ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
            : "none",
          maxWidth: isScrolled ? "1200px" : "100%",
          margin: isScrolled ? "1rem auto" : "0",
          borderRadius: isScrolled ? "9999px" : "0",
          padding: isScrolled ? "0.5rem 1.5rem" : "1rem 1.5rem",
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 50,
        }}
        className={cn(
          isScrolled && "bg-white/80 dark:bg-neutral-950/80"
        )}
      >
        <div className="flex items-center justify-between">
          {/* Page Title & Breadcrumbs - Hide when scrolled */}
          {!isScrolled && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: isScrolled ? 0 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-2xl font-bold text-base-content">
                {getPageTitle()}
              </h1>
              <div className="text-sm breadcrumbs">
                <ul>
                  <li><span className="text-base-content/60">VoteChain</span></li>
                  <li><span className="text-primary">{getPageTitle()}</span></li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* Logo - Show when scrolled */}
          {isScrolled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="flex items-center space-x-2"
            >
              <span className="font-bold text-lg text-base-content dark:text-white">VoteChain</span>
            </motion.div>
          )}

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
      </motion.div>
    </motion.header>
  );
};

export default Navbar;