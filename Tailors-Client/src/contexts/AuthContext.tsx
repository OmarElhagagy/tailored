import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { API_URL } from '../config/constants';

// Define User interface with all necessary properties
interface User {
  _id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  phoneVerified: boolean;
  businessName?: string;
  businessDescription?: string;
  businessWebsite?: string;
  businessEstablishedYear?: number;
  businessAddress?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  sellerProfile?: {
    specialties?: string[];
    serviceAreas?: string[];
    languages?: string[];
    bio?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Helper function to save auth state to localStorage
  const saveAuthState = (tokenValue: string, userData: User) => {
    localStorage.setItem('token', tokenValue);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
    setIsAuthenticated(true);
  };
  
  // Helper function to clear auth state
  const clearAuthState = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    // Check for token in URL parameters (for cross-domain redirects)
    const checkUrlForToken = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      
      if (urlToken) {
        localStorage.setItem('token', urlToken);
        setToken(urlToken);
        
        // Clean up URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        return true;
      }
      return false;
    };
    
    // If no token in state, check URL
    if (!token) {
      const foundTokenInUrl = checkUrlForToken();
      if (!foundTokenInUrl) {
        setLoading(false);
        return;
      }
    }
    
    const loadUser = async () => {
      if (token) {
        try {
          const res = await axios.get(`${API_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (res.data.success) {
            setUser(res.data.data);
            setIsAuthenticated(true);
            // Save user data to localStorage for consistency with admin app
            localStorage.setItem('user', JSON.stringify(res.data.data));
          } else {
            clearAuthState();
          }
        } catch (err) {
          clearAuthState();
        }
      }
      setLoading(false);
    };

    loadUser().catch(() => {
      clearAuthState();
      setLoading(false);
    });
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });

      if (res.data.success) {
        saveAuthState(res.data.data.token, res.data.data.user);
      } else {
        setError(res.data.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.post(`${API_URL}/api/auth/register`, userData);

      if (res.data.success) {
        saveAuthState(res.data.data.token, res.data.data.user);
      } else {
        setError(res.data.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthState();
  };

  const clearError = () => {
    setError(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 