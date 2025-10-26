import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('votechain-auth');
    if (authData) {
      try {
        const { token } = JSON.parse(authData).state;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error parsing auth token:', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle different types of errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
      return Promise.reject(new Error('Request timed out. Please try again.'));
    }
    
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        // Token expired or invalid, clear auth
        localStorage.removeItem('votechain-auth');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
        break;
      case 403:
        console.error('Access forbidden');
        break;
      case 404:
        console.error('Resource not found');
        break;
      case 500:
        console.error('Server error');
        break;
      default:
        console.error('API Error:', status, data);
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  connectWallet: (walletAddress) => api.post('/auth/connect-wallet', { walletAddress }),
  refreshToken: () => api.post('/auth/refresh'),
};

// Elections API
export const electionsAPI = {
  getAll: (params) => api.get('/elections', { params }),
  getById: (id) => api.get(`/elections/${id}`),
  create: (electionData) => api.post('/elections', electionData),
  update: (id, electionData) => api.put(`/elections/${id}`, electionData),
  delete: (id) => api.delete(`/elections/${id}`),
  getResults: (id) => api.get(`/elections/${id}/results`),
  getStats: (id) => api.get(`/elections/${id}/stats`),
};

// Voting API
export const votingAPI = {
  castVote: (voteData) => api.post('/votes', voteData),
  getMyVotes: () => api.get('/votes/my-votes'),
  getVotesByElection: (electionId) => api.get(`/votes/election/${electionId}`),
  verifyVote: (voteId) => api.get(`/votes/${voteId}/verify`),
};

// Analytics API
export const analyticsAPI = {
  getDashboardStats: () => api.get('/analytics/dashboard'),
  getElectionStats: (electionId) => api.get(`/analytics/elections/${electionId}`),
  getUserStats: () => api.get('/analytics/user'),
  getSystemStats: () => api.get('/analytics/system'),
};

// Users API (Admin only)
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  getStats: () => api.get('/users/stats'),
};

export default api;