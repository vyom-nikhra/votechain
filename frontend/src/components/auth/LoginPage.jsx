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
import { FaVoteYea, FaArrowRight, FaGoogle, FaGithub, FaApple } from 'react-icons/fa';
import BlurryBlob from '../animata/background/blurry-blob';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black relative overflow-hidden">
      {/* BlurryBlob Background Animation */}
      <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
        <BlurryBlob
          className="opacity-70"
          firstBlobColor="bg-blue-500"
          secondBlobColor="bg-purple-500"
        />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="btn btn-ghost text-lg text-white hover:text-blue-400">
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
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl w-16 h-16 flex items-center justify-center">
                  <FaVoteYea className="text-3xl" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Welcome Back!
                </h1>
                <p className="text-gray-400">Sign in to VoteChain</p>
              </div>
            </div>
            
            <p className="text-xl text-gray-300 mb-8 max-w-lg">
              Access your secure voting dashboard and participate in democratic decisions that shape your university.
            </p>

            <div className="grid gap-4 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 backdrop-blur-sm">
                <MdSecurity className="text-2xl text-green-400 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-semibold text-white">Blockchain Security</div>
                  <div className="text-sm text-gray-400">Military-grade encryption</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
                <MdTrendingUp className="text-2xl text-blue-400 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-semibold text-white">Live Updates</div>
                  <div className="text-sm text-gray-400">Real-time election results</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-sm">
                <MdBarChart className="text-2xl text-yellow-400 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-semibold text-white">Analytics</div>
                  <div className="text-sm text-gray-400">Personal voting insights</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div 
            className="w-full max-w-md mx-auto"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form className="bg-white rounded-3xl p-8 shadow-2xl" onSubmit={handleSubmit}>
              {/* Email Verification Reminder */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-800">Check Your Email</h4>
                    <p className="text-xs text-blue-600">If you just registered, verify your email before logging in</p>
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div className="flex flex-col mb-4">
                <label className="text-gray-800 font-semibold mb-2">Email</label>
                <div className="border-2 border-gray-200 rounded-xl h-12 flex items-center px-3 focus-within:border-blue-500 transition-colors">
                  <svg height={20} viewBox="0 0 32 32" width={20} xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                    <g id="Layer_3" data-name="Layer 3">
                      <path fill="currentColor" d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z" />
                    </g>
                  </svg>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your Email"
                    className="ml-3 rounded-xl border-none w-full h-full focus:outline-none text-gray-800"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col mb-4">
                <label className="text-gray-800 font-semibold mb-2">Password</label>
                <div className="border-2 border-gray-200 rounded-xl h-12 flex items-center px-3 focus-within:border-blue-500 transition-colors">
                  <svg height={20} viewBox="-64 0 512 512" width={20} xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                    <path fill="currentColor" d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0" />
                    <path fill="currentColor" d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0" />
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your Password"
                    className="ml-3 rounded-xl border-none w-full h-full focus:outline-none text-gray-800"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    {showPassword ? <MdVisibilityOff className="text-xl" /> : <MdVisibility className="text-xl" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-800">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-blue-500 hover:text-blue-600 font-medium">
                  Forgot password?
                </Link>
              </div>

              {/* Login Button */}
              <button 
                type="submit" 
                className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors mb-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              <p className="text-center text-gray-800 text-sm mb-4">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-500 hover:text-blue-600 font-medium">
                  Sign Up
                </Link>
              </p>

              <p className="text-center text-gray-500 text-sm mb-4 relative">
                <span className="bg-white px-2 relative z-10">Or With</span>
                <span className="absolute left-0 right-0 top-1/2 h-px bg-gray-300 -z-0"></span>
              </p>

              {/* Social Login */}
              <div className="flex gap-3">
                <button type="button" className="flex-1 h-12 border border-gray-300 hover:border-blue-500 rounded-xl flex items-center justify-center gap-2 bg-white transition-colors">
                  <svg version="1.1" width={20} height={20} id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style={{enableBackground: 'new 0 0 512 512'}} xmlSpace="preserve">
                    <path style={{fill: '#FBBB00'}} d="M113.47,309.408L95.648,375.94l-65.139,1.378C11.042,341.211,0,299.9,0,256c0-42.451,10.324-82.483,28.624-117.732h0.014l57.992,10.632l25.404,57.644c-5.317,15.501-8.215,32.141-8.215,49.456C103.821,274.792,107.225,292.797,113.47,309.408z" />
                    <path style={{fill: '#518EF8'}} d="M507.527,208.176C510.467,223.662,512,239.655,512,256c0,18.328-1.927,36.206-5.598,53.451c-12.462,58.683-45.025,109.925-90.134,146.187l-0.014-0.014l-73.044-3.727l-10.338-64.535c29.932-17.554,53.324-45.025,65.646-77.911h-136.89V208.176h138.887L507.527,208.176L507.527,208.176z" />
                    <path style={{fill: '#28B446'}} d="M416.253,455.624l0.014,0.014C372.396,490.901,316.666,512,256,512c-97.491,0-182.252-54.491-225.491-134.681l82.961-67.91c21.619,57.698,77.278,98.771,142.53,98.771c28.047,0,54.323-7.582,76.87-20.818L416.253,455.624z" />
                    <path style={{fill: '#F14336'}} d="M419.404,58.936l-82.933,67.896c-23.335-14.586-50.919-23.012-80.471-23.012c-66.729,0-123.429,42.957-143.965,102.724l-83.397-68.276h-0.014C71.23,56.123,157.06,0,256,0C318.115,0,375.068,22.126,419.404,58.936z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-800">Google</span>
                </button>
                <button type="button" className="flex-1 h-12 border border-gray-300 hover:border-blue-500 rounded-xl flex items-center justify-center gap-2 bg-white transition-colors">
                  <svg version="1.1" height={20} width={20} id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 22.773 22.773" style={{enableBackground: 'new 0 0 22.773 22.773'}} xmlSpace="preserve">
                    <g>
                      <g>
                        <path d="M15.769,0c0.053,0,0.106,0,0.162,0c0.13,1.606-0.483,2.806-1.228,3.675c-0.731,0.863-1.732,1.7-3.351,1.573c-0.108-1.583,0.506-2.694,1.25-3.561C13.292,0.879,14.557,0.16,15.769,0z" />
                        <path d="M20.67,16.716c0,0.016,0,0.03,0,0.045c-0.455,1.378-1.104,2.559-1.896,3.655c-0.723,0.995-1.609,2.334-3.191,2.334c-1.367,0-2.275-0.879-3.676-0.903c-1.482-0.024-2.297,0.735-3.652,0.926c-0.155,0-0.31,0-0.462,0c-0.995-0.144-1.798-0.932-2.383-1.642c-1.725-2.098-3.058-4.808-3.306-8.276c0-0.34,0-0.679,0-1.019c0.105-2.482,1.311-4.5,2.914-5.478c0.846-0.52,2.009-0.963,3.304-0.765c0.555,0.086,1.122,0.276,1.619,0.464c0.471,0.181,1.06,0.502,1.618,0.485c0.378-0.011,0.754-0.208,1.135-0.347c1.116-0.403,2.21-0.865,3.652-0.648c1.733,0.262,2.963,1.032,3.723,2.22c-1.466,0.933-2.625,2.339-2.427,4.74C17.818,14.688,19.086,15.964,20.67,16.716z" />
                      </g>
                    </g>
                  </svg>
                  <span className="text-sm font-medium text-gray-800">Apple</span>
                </button>
              </div>

              {/* Demo Accounts */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-gray-800">
                  <MdSchool className="text-blue-500" />
                  Demo Accounts
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">👨‍🎓 Demo Student:</span>
                    <code className="bg-white px-2 py-1 rounded text-gray-800">student@demo.com</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">👩‍💼 Demo Admin:</span>
                    <code className="bg-white px-2 py-1 rounded text-gray-800">admin@demo.com</code>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;