import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(credentials);
          const { user, token } = response.data;
          
          set({ user, token, isLoading: false });
          toast.success(`Welcome back, ${user.firstName}!`);
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Login failed';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(userData);
          const { user } = response.data; // No token during registration
          
          // Don't set user or token - they need email verification first
          set({ isLoading: false });
          toast.success(`Account created successfully! Please check ${user.email} for verification email.`);
          return { success: true, requiresVerification: true };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Registration failed';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      logout: () => {
        set({ user: null, token: null });
        toast.success('Logged out successfully');
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.updateProfile(profileData);
          const { user } = response.data;
          
          set({ user, isLoading: false });
          toast.success('Profile updated successfully');
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Profile update failed';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      changePassword: async (passwordData) => {
        set({ isLoading: true, error: null });
        try {
          await authAPI.changePassword(passwordData);
          set({ isLoading: false });
          toast.success('Password changed successfully');
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Password change failed';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      clearError: () => set({ error: null }),

      // Refresh user data
      refreshUser: async () => {
        try {
          const response = await authAPI.getProfile();
          const { user } = response.data;
          set({ user });
          return { success: true };
        } catch (error) {
          console.error('Failed to refresh user data:', error);
          return { success: false };
        }
      },

      // Initialize auth from token
      initializeAuth: async () => {
        const { token } = get();
        if (!token) return;

        set({ isLoading: true });
        try {
          const response = await authAPI.getProfile();
          const { user } = response.data;
          set({ user, isLoading: false });
        } catch (error) {
          // Token is invalid, clear auth
          set({ user: null, token: null, isLoading: false });
        }
      },

      // Getters
      isAuthenticated: () => {
        const { user, token } = get();
        return !!(user && token);
      },

      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin';
      },

      getToken: () => get().token,
    }),
    {
      name: 'votechain-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);

export { useAuthStore };