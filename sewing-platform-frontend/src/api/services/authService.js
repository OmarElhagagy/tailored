import axios from 'axios';
import { AuthResponse, LoginCredentials, RegisterData, User } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const AUTH_TOKEN_KEY = 'authToken';
const USER_KEY = 'user';

const authService = {
  /**
   * Register a new user
   */
  register: async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  },

  /**
   * Log in a user
   */
  login: async (credentials) => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    if (response.data.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Log out the current user
   */
  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = '/login';
  },

  /**
   * Get the current authenticated user
   */
  getCurrentUser: () => {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem(USER_KEY) : null;
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!authService.getCurrentUser()?.token;
  },

  /**
   * Update the current user's profile
   */
  updateProfile: async (userData) => {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    const response = await axios.put(
      `${API_URL}/users/profile`, 
      userData,
      { headers: { Authorization: `Bearer ${user.token}` } }
    );
    
    // Update stored user data with new profile info
    if (response.data) {
      const updatedUser = { ...user, ...response.data };
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    }
    
    return response.data;
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email) => {
    const response = await axios.post(`${API_URL}/auth/request-reset`, { email });
    return response.data;
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token, newPassword) => {
    const response = await axios.post(`${API_URL}/auth/reset-password`, {
      token,
      password: newPassword
    });
    return response.data;
  },

  /**
   * Get stored token
   */
  getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  /**
   * Get stored user
   */
  getUser() {
    const userJson = localStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  },

  /**
   * Send password reset request
   */
  async forgotPassword(email) {
    try {
      return await axios.post(`${API_URL}/auth/forgot-password`, { email });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Verify phone number with code
   */
  async verifyPhone(verificationData) {
    try {
      return await axios.post(`${API_URL}/auth/verify-phone`, verificationData);
    } catch (error) {
      throw error;
    }
  }
};

// Configure axios interceptor to handle auth token
axios.interceptors.request.use(
  (config) => {
    const user = authService.getCurrentUser();
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default authService; 