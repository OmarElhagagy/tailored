import axios from 'axios';

// Base API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_TIMEOUT = 15000; // 15 seconds

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },
  
  forgotPassword: async (email: string) => {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  },
  
  resetPassword: async (token: string, password: string) => {
    const response = await api.post('/api/auth/reset-password', { token, password });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  }
};

// Listings API
export const listingsAPI = {
  getListings: async (params: any = {}) => {
    const response = await api.get('/api/listings', { params });
    return response.data;
  },
  
  getListing: async (id: string) => {
    const response = await api.get(`/api/listings/${id}`);
    return response.data;
  },
  
  createListing: async (listingData: any) => {
    const response = await api.post('/api/listings', listingData);
    return response.data;
  },
  
  updateListing: async (id: string, listingData: any) => {
    const response = await api.put(`/api/listings/${id}`, listingData);
    return response.data;
  },
  
  deleteListing: async (id: string) => {
    const response = await api.delete(`/api/listings/${id}`);
    return response.data;
  }
};

// Orders API
export const ordersAPI = {
  getOrders: async (params: any = {}) => {
    const response = await api.get('/api/orders', { params });
    return response.data;
  },
  
  getOrder: async (id: string) => {
    const response = await api.get(`/api/orders/${id}`);
    return response.data;
  },
  
  createOrder: async (orderData: any) => {
    const response = await api.post('/api/orders', orderData);
    return response.data;
  },
  
  updateOrder: async (id: string, orderData: any) => {
    const response = await api.put(`/api/orders/${id}`, orderData);
    return response.data;
  },
  
  cancelOrder: async (id: string, reason: string) => {
    const response = await api.post(`/api/orders/${id}/cancel`, { reason });
    return response.data;
  }
};

// User Profile API
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/api/users/profile');
    return response.data;
  },
  
  updateProfile: async (profileData: any) => {
    const response = await api.put('/api/users/profile', profileData);
    return response.data;
  },
  
  getBusinessCredentials: async () => {
    const response = await api.get('/api/business-credentials');
    return response.data;
  },
  
  updateBusinessCredentials: async (credentialsData: any) => {
    const response = await api.put('/api/business-credentials', credentialsData);
    return response.data;
  }
};

// Payments API
export const paymentsAPI = {
  initiatePayment: async (orderId: string, paymentMethod: string, paymentData: any = {}) => {
    const response = await api.post(`/api/payments/initiate`, { 
      orderId, 
      paymentMethod,
      ...paymentData
    });
    return response.data;
  },
  
  verifyPayment: async (paymentId: string) => {
    const response = await api.get(`/api/payments/${paymentId}/verify`);
    return response.data;
  },
  
  getPaymentMethods: async () => {
    const response = await api.get('/api/payments/methods');
    return response.data;
  }
};

// Notifications API
export const notificationsAPI = {
  getNotifications: async () => {
    const response = await api.get('/api/notifications');
    return response.data;
  },
  
  markAsRead: async (notificationId: string) => {
    const response = await api.put(`/api/notifications/${notificationId}/read`);
    return response.data;
  },
  
  markAllAsRead: async () => {
    const response = await api.put('/api/notifications/read-all');
    return response.data;
  }
};

export default api; 