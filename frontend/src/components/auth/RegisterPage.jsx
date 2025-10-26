import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { 
  FaEye, 
  FaEyeSlash, 
  FaBolt, 
  FaChartLine, 
  FaTrophy, 
  FaUser, 
  FaEnvelope, 
  FaIdCard,
  FaLock,
  FaRocket
} from 'react-icons/fa';
import BlurryBlob from '../animata/background/blurry-blob';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    department: '',
    year: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    
    try {
      // Validation
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.studentId || !formData.department || !formData.year || !formData.password) {
        toast.error('Please fill in all required fields');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return false;
      }

      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return false;
      }

      if (!formData.acceptTerms) {
        toast.error('Please accept the terms and conditions');
        return false;
      }

      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        studentId: formData.studentId,
        department: formData.department,
        year: parseInt(formData.year),
        password: formData.password,
      };

      const result = await register(userData);
      if (result.success) {
        toast.success('Account created successfully! Please login to continue.');
        navigate('/login');
      }
      
      return result.success;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
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

        <div className="max-w-7xl mx-auto">
          <div className="hero-content flex-col lg:flex-row gap-12">
            <motion.div 
              className="text-center lg:text-left lg:flex-1"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 justify-center lg:justify-start mb-6">
                <FaRocket className="text-4xl text-blue-400" />
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Join VoteChain!
                </h1>
              </div>
              <p className="text-xl text-gray-300 mb-8 max-w-lg">
                Be part of the democratic revolution. Create your account and start 
                participating in secure, blockchain-powered elections.
              </p>
              <div className="grid gap-4 text-white/80 max-w-md mx-auto lg:mx-0">
                <div className="flex items-center gap-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-sm">
                  <FaBolt className="text-2xl text-yellow-300 flex-shrink-0" />
                  <span className="text-lg text-white">Instant account verification</span>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
                  <FaChartLine className="text-2xl text-blue-300 flex-shrink-0" />
                  <span className="text-lg text-white">Personalized voting dashboard</span>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 backdrop-blur-sm">
                  <FaTrophy className="text-2xl text-orange-300 flex-shrink-0" />
                  <span className="text-lg text-white">Earn NFT badges for participation</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="w-full max-w-2xl lg:flex-1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <form className="bg-white rounded-3xl p-8 shadow-2xl" onSubmit={handleSubmit}>
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col">
                    <label className="text-gray-800 font-semibold mb-2">First Name</label>
                    <div className="border-2 border-gray-200 rounded-xl h-12 flex items-center px-3 focus-within:border-blue-500 transition-colors">
                      <FaUser className="text-gray-400" />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="John"
                        className="ml-3 rounded-xl border-none w-full h-full focus:outline-none text-gray-800"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-gray-800 font-semibold mb-2">Last Name</label>
                    <div className="border-2 border-gray-200 rounded-xl h-12 flex items-center px-3 focus-within:border-blue-500 transition-colors">
                      <FaUser className="text-gray-400" />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Doe"
                        className="ml-3 rounded-xl border-none w-full h-full focus:outline-none text-gray-800"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Email Field */}
                <div className="flex flex-col mb-4">
                  <label className="text-gray-800 font-semibold mb-2">University Email</label>
                  <div className="border-2 border-gray-200 rounded-xl h-12 flex items-center px-3 focus-within:border-blue-500 transition-colors">
                    <FaEnvelope className="text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john.doe@university.edu"
                      className="ml-3 rounded-xl border-none w-full h-full focus:outline-none text-gray-800"
                      required
                    />
                  </div>
                </div>

                {/* Student ID Field */}
                <div className="flex flex-col mb-4">
                  <label className="text-gray-800 font-semibold mb-2">Student ID</label>
                  <div className="border-2 border-gray-200 rounded-xl h-12 flex items-center px-3 focus-within:border-blue-500 transition-colors">
                    <FaIdCard className="text-gray-400" />
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      placeholder="STU2024001"
                      className="ml-3 rounded-xl border-none w-full h-full focus:outline-none text-gray-800"
                      required
                    />
                  </div>
                </div>

                {/* Academic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col">
                    <label className="text-gray-800 font-semibold mb-2">Department</label>
                    <div className="border-2 border-gray-200 rounded-xl h-12 flex items-center px-3 focus-within:border-blue-500 transition-colors">
                      <FaChartLine className="text-gray-400" />
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="ml-3 rounded-xl border-none w-full h-full focus:outline-none text-gray-800 bg-transparent"
                        required
                      >
                        <option value="">Select Department</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Electronics">Electronics & Communication</option>
                        <option value="Mechanical">Mechanical Engineering</option>
                        <option value="Civil">Civil Engineering</option>
                        <option value="Business">Business Administration</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-gray-800 font-semibold mb-2">Academic Year</label>
                    <div className="border-2 border-gray-200 rounded-xl h-12 flex items-center px-3 focus-within:border-blue-500 transition-colors">
                      <FaTrophy className="text-gray-400" />
                      <select
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="ml-3 rounded-xl border-none w-full h-full focus:outline-none text-gray-800 bg-transparent"
                        required
                      >
                        <option value="">Select Year</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Password Fields */}
                <div className="flex flex-col mb-4">
                  <label className="text-gray-800 font-semibold mb-2">Password</label>
                  <div className="border-2 border-gray-200 rounded-xl h-12 flex items-center px-3 focus-within:border-blue-500 transition-colors">
                    <FaLock className="text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 6 characters"
                      className="ml-3 rounded-xl border-none w-full h-full focus:outline-none text-gray-800"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col mb-4">
                  <label className="text-gray-800 font-semibold mb-2">Confirm Password</label>
                  <div className="border-2 border-gray-200 rounded-xl h-12 flex items-center px-3 focus-within:border-blue-500 transition-colors">
                    <FaLock className="text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      className="ml-3 rounded-xl border-none w-full h-full focus:outline-none text-gray-800"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start mb-6">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className="mt-1 mr-2"
                    required
                  />
                  <label className="text-sm text-gray-800">
                    I accept the{' '}
                    <a href="#" className="text-blue-500 hover:text-blue-600 font-medium">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-blue-500 hover:text-blue-600 font-medium">Privacy Policy</a>
                  </label>
                </div>

                {/* Register Button */}
                <button 
                  type="submit" 
                  className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors mb-4"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>

                {/* Login Link */}
                <div className="text-center">
                  <p className="text-gray-800 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-500 hover:text-blue-600 font-medium">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;