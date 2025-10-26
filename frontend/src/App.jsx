import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { motion } from 'framer-motion';

// Error Handling & Toast
import ErrorBoundary from './components/common/ErrorBoundary';
import ToastProvider from './components/common/ToastProvider';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorProvider from './context/ErrorContext';
 
// Components
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import LandingPage from './components/common/LandingPage';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import Dashboard from './components/dashboard/Dashboard';
import ElectionsList from './components/voting/ElectionsList';
import VotingPage from './components/voting/VotingPage';
import AdminPanel from './components/dashboard/AdminPanel';
import ProfilePage from './components/dashboard/ProfilePage';

// Hooks and Store
import { useAuthStore } from './store/authStore';
import ProtectedRoute from './components/common/ProtectedRoute';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  const { user, isLoading, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isLoading) {
    return (
      <LoadingSpinner 
        fullScreen={true} 
        text="Loading VoteChain..." 
        size="lg" 
      />
    );
  }

  return (
    <ErrorBoundary>
      <ErrorProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <div className="min-h-screen bg-base-100">
              <ToastProvider />
          
          {user ? (
            <div className="flex">
              <Sidebar />
              <div className="flex-1 ml-64">
                <Navbar />
                <motion.main 
                  className="p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/elections" element={
                      <ProtectedRoute>
                        <ElectionsList />
                      </ProtectedRoute>
                    } />
                    <Route path="/vote/:electionId" element={
                      <ProtectedRoute>
                        <VotingPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                      <ProtectedRoute adminOnly>
                        <AdminPanel />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } />
                  </Routes>
                </motion.main>
              </div>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          )}
        </div>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ErrorProvider>
    </ErrorBoundary>
  );
}

export default App;
