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
        navigate('/dashboard');
      }
      
      return result.success;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary p-4">
      <div className="max-w-7xl mx-auto">
        <div className="hero-content flex-col lg:flex-row gap-12">
          <motion.div 
            className="text-center lg:text-left lg:flex-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 justify-center lg:justify-start mb-6">
              <FaRocket className="text-4xl text-white" />
              <h1 className="text-5xl font-bold text-white">
                Join VoteChain!
              </h1>
            </div>
            <p className="text-xl text-white/90 mb-8 max-w-lg">
              Be part of the democratic revolution. Create your account and start 
              participating in secure, blockchain-powered elections.
            </p>
            <div className="grid gap-4 text-white/80 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <FaBolt className="text-2xl text-yellow-300 flex-shrink-0" />
                <span className="text-lg">Instant account verification</span>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <FaChartLine className="text-2xl text-blue-300 flex-shrink-0" />
                <span className="text-lg">Personalized voting dashboard</span>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <FaTrophy className="text-2xl text-orange-300 flex-shrink-0" />
                <span className="text-lg">Earn NFT badges for participation</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="card flex-shrink-0 w-full max-w-2xl shadow-2xl bg-base-100 lg:flex-1 border border-base-300"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
        <form className="card-body p-8" onSubmit={handleSubmit}>
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-12">
                  <FaRocket className="text-2xl" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-base-content">Create Account</h2>
            </div>
            <p className="text-base-content/70 text-lg">
              Join the blockchain voting revolution
            </p>
            <div className="divider my-6"></div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <FaUser className="text-sm" />
                  First Name
                </span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className="input input-bordered focus:input-primary"
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <FaUser className="text-sm" />
                  Last Name
                </span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className="input input-bordered focus:input-primary"
                required
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="form-section mb-6">
            <h3 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
              <FaEnvelope className="text-primary" />
              Contact Information
            </h3>

          {/* Email Field */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                <FaEnvelope className="text-sm" />
                University Email
              </span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john.doe@university.edu"
              className="input input-bordered focus:input-primary"
              required
            />
          </div>

          {/* Student ID Field */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                <FaIdCard className="text-sm" />
                Student ID
              </span>
            </label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              placeholder="STU2024001"
              className="input input-bordered focus:input-primary"
              required
            />
          </div>

          </div>

          {/* Academic Information */}
          <div className="form-section mb-6">
            <h3 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
              <FaIdCard className="text-primary" />
              Academic Information
            </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <FaChartLine className="text-sm" />
                  Department
                </span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="select select-bordered focus:select-primary"
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
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <FaTrophy className="text-sm" />
                  Academic Year
                </span>
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="select select-bordered focus:select-primary"
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

          {/* Security Section */}
          <div className="form-section mb-6">
            <h3 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
              <FaLock className="text-primary" />
              Security
            </h3>

          {/* Password Field */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                <FaLock className="text-sm" />
                Password
              </span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className="input input-bordered focus:input-primary w-full pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-base-content/40 hover:text-primary transition-colors"
              >
                {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                <FaLock className="text-sm" />
                Confirm Password
              </span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                className="input input-bordered focus:input-primary w-full pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-base-content/40 hover:text-primary transition-colors"
              >
                {showConfirmPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
              </button>
            </div>
          </div>
          </div>

          {/* Terms and Actions */}
          <div className="form-section">
          {/* Terms Checkbox */}
          <div className="form-control">
            <label className="cursor-pointer label justify-start space-x-3">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="checkbox checkbox-primary"
                required
              />
              <span className="label-text">
                I accept the{' '}
                <a href="#" className="link text-primary">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="link text-primary">Privacy Policy</a>
              </span>
            </label>
          </div>

          {/* Register Button */}
          <div className="form-control mt-8">
            <button 
              type="submit" 
              className="btn btn-primary btn-lg text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Creating account...
                </>
              ) : (
                <>
                  <FaRocket className="text-lg" />
                  Create Account
                </>
              )}
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center mt-4">
            <p className="text-base-content/60">
              Already have an account?{' '}
              <Link to="/login" className="link text-primary font-medium">
                Sign in here
              </Link>
            </p>
          </div>
          </div>
        </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;