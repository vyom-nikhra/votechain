import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaChevronRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Breadcrumbs = ({ customItems }) => {
  const location = useLocation();
  
  // If custom items are provided, use them
  if (customItems) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center space-x-2 text-sm mb-6"
      >
        <Link 
          to="/dashboard" 
          className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors duration-200"
        >
          <FaHome className="text-lg" />
          <span>Home</span>
        </Link>
        
        {customItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <FaChevronRight className="text-slate-600 text-xs" />
            {item.href ? (
              <Link 
                to={item.href} 
                className="text-slate-400 hover:text-blue-400 transition-colors duration-200"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-blue-400 font-medium">
                {item.label}
              </span>
            )}
          </div>
        ))}
      </motion.div>
    );
  }

  // Auto-generate breadcrumbs from URL path
  const pathnames = location.pathname.split('/').filter((x) => x);
  
  // Create breadcrumb labels
  const getBreadcrumbLabel = (path) => {
    const labels = {
      'dashboard': 'Dashboard',
      'elections': 'Elections',
      'blockchain': 'Blockchain Explorer',
      'profile': 'Profile',
      'admin': 'Admin Panel',
      'vote': 'Vote',
      'results': 'Results'
    };
    
    return labels[path] || path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center space-x-2 text-sm mb-6"
    >
      <Link 
        to="/dashboard" 
        className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors duration-200"
      >
        <FaHome className="text-lg" />
        <span>Home</span>
      </Link>
      
      {pathnames.map((path, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        
        return (
          <div key={path} className="flex items-center gap-2">
            <FaChevronRight className="text-slate-600 text-xs" />
            {isLast ? (
              <span className="text-blue-400 font-medium">
                {getBreadcrumbLabel(path)}
              </span>
            ) : (
              <Link 
                to={routeTo} 
                className="text-slate-400 hover:text-blue-400 transition-colors duration-200"
              >
                {getBreadcrumbLabel(path)}
              </Link>
            )}
          </div>
        );
      })}
    </motion.div>
  );
};

export default Breadcrumbs;
