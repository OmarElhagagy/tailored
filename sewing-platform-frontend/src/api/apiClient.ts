import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, ApiError, PaginatedResponse } from './types';

// Define the base API URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

/**
 * API Client with interceptors, global error handling and type-safe methods
 */
class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    // Create axios instance with default config
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Allow cookies for authentication
    });

    // Request interceptor for adding auth token
    this.instance.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        const token = localStorage.getItem('authToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    // Response interceptor for handling common errors
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: any) => {
        // Handle authentication errors
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        
        // Handle server errors
        if (!error.response) {
          console.error('Network error: Server may be down');
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * GET request with type safety
   */
  public async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    try {
      const response = await this.instance.get<ApiResponse<T>>(url, { params });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET request with pagination
   */
  public async getPaginated<T>(url: string, params?: Record<string, any>): Promise<PaginatedResponse<T>> {
    try {
      const response = await this.instance.get<ApiResponse<PaginatedResponse<T>>>(url, { params });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST request with type safety
   */
  public async post<T, D = any>(url: string, data?: D): Promise<T> {
    try {
      const response = await this.instance.post<ApiResponse<T>>(url, data);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * PUT request with type safety
   */
  public async put<T, D = any>(url: string, data?: D): Promise<T> {
    try {
      const response = await this.instance.put<ApiResponse<T>>(url, data);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * PATCH request with type safety
   */
  public async patch<T, D = any>(url: string, data?: D): Promise<T> {
    try {
      const response = await this.instance.patch<ApiResponse<T>>(url, data);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * DELETE request with type safety
   */
  public async delete<T>(url: string, params?: Record<string, any>): Promise<T> {
    try {
      const response = await this.instance.delete<ApiResponse<T>>(url, { params });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload FormData with type safety
   */
  public async uploadFormData<T>(url: string, formData: FormData): Promise<T> {
    try {
      const response = await this.instance.post<ApiResponse<T>>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
const apiClient = new ApiClient();
export default apiClient;

// Export service utilities
export * from './types'; 