import { apiClient } from '../apiClient';
import { 
  LoginRequest, 
  LoginResponse,
  RegisterRequest,
  User,
  ApiResponse 
} from '../types';

/**
 * Auth service to handle authentication API calls
 */
export const authService = {
  /**
   * Login user
   * @param credentials Login credentials
   * @returns Login response with token and user data
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post<LoginResponse, LoginRequest>('/auth/login', credentials);
  },

  /**
   * Register new user
   * @param data Registration data
   * @returns Registration response with token and user data
   */
  async register(data: RegisterRequest): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post<LoginResponse, RegisterRequest>('/auth/register', data);
  },

  /**
   * Get current user profile
   * @returns User profile data
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiClient.get<User>('/auth/me');
  },

  /**
   * Update user profile
   * @param data Updated user data
   * @returns Updated user profile
   */
  async updateProfile(data: Partial<Omit<User, 'id' | 'role' | 'createdAt' | 'updatedAt'>>): Promise<ApiResponse<User>> {
    return apiClient.patch<User>('/auth/profile', data);
  },

  /**
   * Change user password
   * @param data Old and new password data
   * @returns Success response
   */
  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>('/auth/change-password', data);
  },

  /**
   * Request password reset
   * @param email User email
   * @returns Success response
   */
  async forgotPassword(email: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>('/auth/forgot-password', { email });
  },

  /**
   * Reset password with token
   * @param data Reset token and new password
   * @returns Success response
   */
  async resetPassword(data: { token: string; password: string }): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>('/auth/reset-password', data);
  },

  /**
   * Logout user
   * @returns Success response
   */
  async logout(): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>('/auth/logout');
  }
}; 