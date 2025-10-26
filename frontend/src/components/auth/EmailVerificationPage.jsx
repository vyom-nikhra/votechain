import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaCheckCircle, FaEnvelope } from 'react-icons/fa';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const handleVerifyEmail = async () => {
    if (!token) {
      toast.error('Invalid verification link');
      return;
    }

    setIsVerifying(true);
    
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/verify-email/${token}`;
      console.log('Making API call to:', apiUrl);
      console.log('Token:', token);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        console.log('Response not ok, status text:', response.statusText);
        toast.error(`API Error: ${response.status} ${response.statusText}`);
        return;
      }
      
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        toast.success('You are now verified to login!');
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      } else {
        toast.error(data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      toast.error('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 flex items-center justify-center p-4">
      <motion.div
        className="card bg-base-100 shadow-2xl border border-base-300 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="card-body text-center p-8">
          {/* Header */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="avatar placeholder">
              <div className="bg-primary text-white rounded-full w-12">
                <FaEnvelope className="text-xl" />
              </div>
            </div>
            <h1 className="text-2xl font-bold">Email Verification</h1>
          </div>

          {/* Content */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Verify Your Email Address</h2>
            <p className="text-base-content/70 mb-6">
              Click the button below to verify your email address and activate your account.
            </p>
          </div>

          {/* Verify Button */}
          <button 
            onClick={handleVerifyEmail}
            disabled={isVerifying || !token}
            className="btn btn-primary btn-block btn-lg"
          >
            {isVerifying ? (
              <>
                <span className="loading loading-spinner"></span>
                Verifying...
              </>
            ) : (
              <>
                <FaCheckCircle className="mr-2" />
                Verify Email
              </>
            )}
          </button>

          {!token && (
            <div className="alert alert-error mt-4">
              <span>Invalid verification link. Please check your email for the correct link.</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerificationPage;