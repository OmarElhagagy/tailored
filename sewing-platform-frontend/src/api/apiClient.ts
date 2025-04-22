import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, ApiError, PaginatedResponse } from './types';

// Base API configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.tailors.example.com';
const API_TIMEOUT = 30000; // 30 seconds

/**
 * API Client with interceptors, global error handling and type-safe methods
 */
class ApiClient {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    // Create axios instance with default config
    this.instance = axios.create({
      baseURL: API_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });

    // Add request interceptor
    this.instance.interceptors.request.use(
      (config) => this.handleRequest(config),
      (error) => Promise.reject(error)
    );

    // Add response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => this.handleError(error)
    );
  }

  /**
   * Request interceptor to add auth token and handle requests
   */
  private handleRequest(config: AxiosRequestConfig): AxiosRequestConfig {
    const token = this.getAuthToken();
    
    // If token exists, add to Authorization header
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  }

  /**
   * Response interceptor to handle errors and token refresh
   */
  private async handleError(error: AxiosError): Promise<any> {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && originalRequest && !originalRequest.headers._retry) {
      if (!this.isRefreshing) {
        this.isRefreshing = true;
        
        try {
          // Try to refresh the token
          const newToken = await this.refreshToken();
          
          // If successful, update Authorization header and retry queued requests
          if (newToken) {
            // Update token for original request
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            originalRequest.headers._retry = true;
            
            // Process queued requests with new token
            this.refreshSubscribers.forEach(callback => callback(newToken));
            this.refreshSubscribers = [];
            
            return this.instance(originalRequest);
          }
        } catch (refreshError) {
          // If refresh fails, redirect to login
          this.redirectToLogin();
        } finally {
          this.isRefreshing = false;
        }
      } else {
        // If a refresh is already in progress, queue this request
        return new Promise(resolve => {
          this.refreshSubscribers.push((token: string) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            originalRequest.headers._retry = true;
            resolve(this.instance(originalRequest));
          });
        });
      }
    }
    
    // Handle API errors
    if (error.response?.data) {
      return Promise.reject({
        message: error.response.data.message || 'An error occurred',
        code: error.response.data.code,
        status: error.response.status,
        errors: error.response.data.errors
      } as ApiError);
    }
    
    // Handle network errors
    if (error.message === 'Network Error') {
      return Promise.reject({
        message: 'Unable to connect to the server. Please check your internet connection.',
        code: 'NETWORK_ERROR',
      } as ApiError);
    }
    
    // Handle timeout
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        message: 'Request timeout. Please try again.',
        code: 'TIMEOUT_ERROR',
      } as ApiError);
    }
    
    // Default error
    return Promise.reject({
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    } as ApiError);
  }

  /**
   * Get auth token from storage
   */
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      // In browser environment
      return localStorage.getItem('auth-storage') 
        ? JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token 
        : null;
    }
    return null;
  }

  /**
   * Refresh auth token
   */
  private async refreshToken(): Promise<string | null> {
    try {
      const response = await this.instance.post<ApiResponse<{ token: string }>>('/auth/refresh-token');
      const newToken = response.data.data.token;
      
      // Update token in storage
      if (typeof window !== 'undefined') {
        const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
        localStorage.setItem('auth-storage', JSON.stringify({
          ...authStorage,
          state: {
            ...authStorage.state,
            token: newToken
          }
        }));
      }
      
      return newToken;
    } catch (error) {
      return null;
    }
  }

  /**
   * Redirect to login page
   */
  private redirectToLogin(): void {
    if (typeof window !== 'undefined') {
      // Clear auth storage
      localStorage.removeItem('auth-storage');
      // Redirect to login page
      window.location.href = '/login';
    }
  }

  /**
   * Generic request method with type safety
   */
  private async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.request<ApiResponse<T>>(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET request with type safety
   */
  public async get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'GET',
      url,
      params
    });
  }

  /**
   * GET request with pagination
   */
  public async getPaginated<T>(url: string, params?: Record<string, any>): Promise<PaginatedResponse<T>> {
    const response = await this.request<PaginatedResponse<T>>({
      method: 'GET',
      url,
      params
    });
    return response;
  }

  /**
   * POST request with type safety
   */
  public async post<T, D = any>(url: string, data?: D): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'POST',
      url,
      data
    });
  }

  /**
   * PUT request with type safety
   */
  public async put<T, D = any>(url: string, data?: D): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      url,
      data
    });
  }

  /**
   * PATCH request with type safety
   */
  public async patch<T, D = any>(url: string, data?: D): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PATCH',
      url,
      data
    });
  }

  /**
   * DELETE request with type safety
   */
  public async delete<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      url,
      params
    });
  }

  /**
   * Upload FormData with type safety
   */
  public async uploadFormData<T>(url: string, formData: FormData): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export service utilities
export * from './types'; 