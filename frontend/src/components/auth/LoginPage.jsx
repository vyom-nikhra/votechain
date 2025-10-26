import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { 
  MdEmail, 
  MdVisibility, 
  MdVisibilityOff, 
  MdLock, 
  MdSecurity,
  MdTrendingUp,
  MdBarChart,
  MdSchool
} from 'react-icons/md';
import { FaVoteYea, FaArrowRight, FaGoogle, FaGithub } from 'react-icons/fa';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (!formData.email || !formData.password) {
        toast.error('Please fill in all fields');
        return false;
      }

      const result = await login(formData);
      if (result.success) {
        navigate('/dashboard');
      }
      
      return result.success;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="btn btn-ghost text-lg">
            ← Back to Home
          </Link>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding */}
          <motion.div 
            className="text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
              <div className="avatar placeholder">
                <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-2xl w-16 h-16">
                  <FaVoteYea className="text-3xl" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Welcome Back!
                </h1>
                <p className="text-base-content/70">Sign in to VoteChain</p>
              </div>
            </div>
            
            <p className="text-xl text-base-content/80 mb-8 max-w-lg">
              Access your secure voting dashboard and participate in democratic decisions that shape your university.
            </p>

            <div className="grid gap-4 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-success/10 border border-success/20">
                <MdSecurity className="text-2xl text-success flex-shrink-0" />
                <div className="text-left">
                  <div className="font-semibold text-base-content">Blockchain Security</div>
                  <div className="text-sm text-base-content/70">Military-grade encryption</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-info/10 border border-info/20">
                <MdTrendingUp className="text-2xl text-info flex-shrink-0" />
                <div className="text-left">
                  <div className="font-semibold text-base-content">Live Updates</div>
                  <div className="text-sm text-base-content/70">Real-time election results</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-warning/10 border border-warning/20">
                <MdBarChart className="text-2xl text-warning flex-shrink-0" />
                <div className="text-left">
                  <div className="font-semibold text-base-content">Analytics</div>
                  <div className="text-sm text-base-content/70">Personal voting insights</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div 
            className="card bg-base-100 shadow-2xl border border-base-200 w-full max-w-md mx-auto"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form className="card-body p-8" onSubmit={handleSubmit}>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-base-content mb-2">Sign In</h2>
                <p className="text-base-content/70">Access your voting dashboard</p>
              </div>

              {/* Email Field */}
              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-2">
                    <MdEmail className="text-lg text-primary" />
                    Email Address
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@university.edu"
                    className="input input-bordered w-full pl-12 focus:input-primary text-base"
                    required
                  />
                  <MdEmail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-base-content/40 text-lg" />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-2">
                    <MdLock className="text-lg text-primary" />
                    Password
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="input input-bordered w-full pl-12 pr-12 focus:input-primary text-base"
                    required
                  />
                  <MdLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-base-content/40 text-lg" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-base-content/40 hover:text-primary transition-colors"
                  >
                    {showPassword ? <MdVisibilityOff className="text-xl" /> : <MdVisibility className="text-xl" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <label className="cursor-pointer label p-0">
                  <input type="checkbox" className="checkbox checkbox-primary checkbox-sm mr-2" />
                  <span className="label-text text-sm">Remember me</span>
                </label>
                <Link to="/forgot-password" className="link text-primary text-sm hover:text-primary-focus">
                  Forgot password?
                </Link>
              </div>

              {/* Login Button */}
              <button 
                type="submit" 
                className="btn btn-primary btn-lg w-full mb-6 text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <FaArrowRight className="ml-2" />
                  </>
                )}
              </button>

              <div className="divider text-base-content/50">OR</div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button type="button" className="btn btn-outline btn-sm">
                  <FaGoogle className="mr-2" />
                  Google
                </button>
                <button type="button" className="btn btn-outline btn-sm">
                  <FaGithub className="mr-2" />
                  GitHub
                </button>
              </div>

              {/* Demo Accounts */}
              <div className="card bg-base-200 p-4 mb-6">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <MdSchool className="text-info" />
                  Demo Accounts
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span>👨‍🎓 Demo Student:</span>
                    <code className="bg-base-300 px-2 py-1 rounded">student@demo.com</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>👩‍💼 Demo Admin:</span>
                    <code className="bg-base-300 px-2 py-1 rounded">admin@demo.com</code>
                  </div>
                </div>
              </div>

              {/* Register Link */}
              <div className="text-center">
                <p className="text-base-content/70">
                  Don't have an account?{' '}
                  <Link to="/register" className="link text-primary font-medium hover:text-primary-focus">
                    Sign up here
                  </Link>
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;