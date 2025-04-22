import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setLoading: (isLoading: boolean) => void;
}

/**
 * Authentication store using Zustand with persistence
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // This would be a real API call in production
          // For now, we'll simulate a successful login
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock successful login
          const mockUser = {
            id: '1',
            name: 'John Doe',
            email: email,
            role: 'tailor'
          };
          
          const mockToken = 'mock-jwt-token';
          
          set({
            token: mockToken,
            user: mockUser,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'An error occurred during login',
            isLoading: false
          });
        }
      },
      
      register: async (name: string, email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // This would be a real API call in production
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock successful registration
          const mockUser = {
            id: '1',
            name: name,
            email: email,
            role: 'customer'
          };
          
          const mockToken = 'mock-jwt-token';
          
          set({
            token: mockToken,
            user: mockUser,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'An error occurred during registration',
            isLoading: false
          });
        }
      },
      
      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false
        });
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
); 