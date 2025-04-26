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

console.log('AuthContext initializing');

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  console.log('AuthProvider rendering');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('AuthProvider useEffect running');
    
    // Check for token in URL parameters (for cross-domain redirects)
    const checkUrlForToken = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      
      if (urlToken) {
        console.log('Token found in URL parameters');
        localStorage.setItem('token', urlToken);
        setToken(urlToken);
        
        // Clean up URL
        const newUrl = window.location.pathname + 
                      (urlParams.size > 1 ? '?' + urlParams.toString() : '');
        window.history.replaceState({}, document.title, newUrl);
        return true;
      }
      return false;
    };
    
    // If no token in state, check URL
    if (!token) {
      const foundTokenInUrl = checkUrlForToken();
      if (!foundTokenInUrl) {
        console.log('No token found in URL or localStorage');
        setLoading(false);
        return;
      }
    }
    
    const loadUser = async () => {
      if (token) {
        try {
          console.log('Attempting to load user with token');
          const res = await axios.get(`${API_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (res.data.success) {
            console.log('User loaded successfully');
            setUser(res.data.data);
            setIsAuthenticated(true);
          } else {
            console.log('Failed to load user, clearing token');
            localStorage.removeItem('token');
            setToken(null);
            setIsAuthenticated(false);
          }
        } catch (err) {
          console.error('Error loading user:', err);
          localStorage.removeItem('token');
          setToken(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log('No token found, skipping user load');
      }
      setLoading(false);
    };

    loadUser().catch(err => {
      console.error('Unexpected error in loadUser:', err);
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
        localStorage.setItem('token', res.data.data.token);
        setToken(res.data.data.token);
        setUser(res.data.data.user);
        setIsAuthenticated(true);
      } else {
        setError(res.data.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during login');
      console.error('Login error:', err);
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
        localStorage.setItem('token', res.data.data.token);
        setToken(res.data.data.token);
        setUser(res.data.data.user);
        setIsAuthenticated(true);
      } else {
        setError(res.data.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during registration');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const clearError = () => {
    setError(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
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