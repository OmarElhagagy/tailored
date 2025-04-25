import axios, { 
  AxiosResponse, 
  AxiosError, 
  InternalAxiosRequestConfig 
} from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // This enables sending cookies with requests
});

// Store for pending requests during token refresh
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Function to add callbacks to the subscriber list
const subscribeToTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Function to notify all subscribers about the new token
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// Add request interceptor for token injection
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Check if the error is due to an expired token
    if (
      error.response?.status === 401 &&
      error.response?.data &&
      typeof error.response.data === 'object' &&
      'errors' in error.response.data &&
      Array.isArray((error.response.data as any).errors) &&
      (error.response.data as any).errors.some((err: any) => 
        err.message && 
        (err.message.includes('expired') || err.message.includes('invalid'))
      ) &&
      originalRequest && 
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // If token refresh is already in progress, add request to queue
        try {
          const newToken = await new Promise<string>((resolve) => {
            subscribeToTokenRefresh((token: string) => {
              resolve(token);
            });
          });
          
          // Retry the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            originalRequest._retry = true;
          }
          return axios(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }
      
      // Start token refresh process
      isRefreshing = true;
      
      try {
        // Call refresh token API
        const response = await axios.post(
          `${API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        
        const { token } = response.data;
        
        // Store the new token
        localStorage.setItem('token', token);
        
        // Update headers for the original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          originalRequest._retry = true;
        }
        
        // Notify all waiting requests that the token has been refreshed
        onTokenRefreshed(token);
        
        // Reset refreshing state
        isRefreshing = false;
        
        // Retry the original request with the new token
        return axios(originalRequest);
      } catch (refreshError) {
        // Token refresh failed, clear local tokens and reject
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        isRefreshing = false;
        
        // Trigger logout event for the app to handle
        window.dispatchEvent(new CustomEvent('auth:logout', {
          detail: { reason: 'session_expired' }
        }));
        
        return Promise.reject(refreshError);
      }
    }
    
    // For other errors, just reject with the original error
    return Promise.reject(error);
  }
);

export default api; 