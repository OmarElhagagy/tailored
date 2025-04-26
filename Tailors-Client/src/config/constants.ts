/**
 * Application-wide constants
 */

// API URL based on environment
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Admin app URL
export const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || 'http://localhost:3001';

// Client app URL
export const CLIENT_URL = import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000';

// Authentication constants
export const TOKEN_KEY = 'token';
export const USER_KEY = 'user';

// App routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  SELLER: {
    DASHBOARD: '/seller/dashboard',
    PRODUCTS: '/seller/products',
    ORDERS: '/seller/orders',
    PROFILE: '/seller/profile',
    SETTINGS: '/seller/settings'
  },
  BUYER: {
    DASHBOARD: '/dashboard',
    ORDERS: '/orders',
    PROFILE: '/profile',
    CART: '/cart'
  }
}; 