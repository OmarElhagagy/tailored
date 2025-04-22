import { apiClient } from '../apiClient';
import { ApiResponse } from '../types';

// Define types based on backend model
export interface User {
  _id: string;
  email?: string;
  contactEmail?: string;
  phone: string;
  role: 'buyer' | 'seller' | 'admin';
  name?: string;
  phoneVerified: boolean;
  businessName?: string;
  businessAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  credentialVerificationStatus: 'not_submitted' | 'pending' | 'verified' | 'rejected';
  businessDescription?: string;
  businessWebsite?: string;
  businessEstablishedYear?: number;
  sellerProfile?: {
    bio?: string;
    expertiseLevel?: 'beginner' | 'intermediate' | 'expert' | 'master';
    specialties?: string[];
    languages?: string[];
    bannerImage?: string;
    logoImage?: string;
    brandColor?: string;
    socialLinks?: {
      instagram?: string;
      facebook?: string;
      pinterest?: string;
      tiktok?: string;
      youtube?: string;
      website?: string;
    };
    paymentMethods?: {
      cash?: boolean;
      cashOnDelivery?: boolean;
      vodafoneCash?: boolean;
      fawry?: boolean;
      instaPay?: boolean;
      creditCard?: boolean;
      bankTransfer?: boolean;
    };
    paymentInstructions?: string;
    contactInfo?: {
      preferredContactMethod?: 'email' | 'phone' | 'messaging';
      publicNote?: string;
      displayBusinessHours?: boolean;
    };
    availability?: 'full_time' | 'part_time' | 'weekends_only' | 'custom';
    businessHours?: Array<{
      day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
      open?: string;
      close?: string;
      closed?: boolean;
    }>;
    productionCapacity?: {
      maxOrdersPerWeek?: number;
      maxCustomOrdersPerMonth?: number;
      currentBacklogDays?: number;
    };
    servicesOffered?: string[];
    certifications?: Array<{
      name: string;
      issuer?: string;
      year?: number;
      verified?: boolean;
    }>;
    policies?: {
      customOrderPolicy?: string;
      returnPolicy?: string;
      shippingPolicy?: string;
      cancellationPolicy?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  identifier: string; // Email or phone
  password: string;
}

export interface RegisterData {
  email?: string;
  phone: string;
  password: string;
  role: 'buyer' | 'seller';
  name?: string;
  business?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
  role: 'buyer' | 'seller' | 'admin';
  userId: string;
  verified: boolean;
  message?: string;
}

export interface PhoneVerification {
  verificationCode: string;
}

export interface PasswordResetRequest {
  phone: string;
}

export interface PasswordReset {
  code: string;
  password: string;
  confirmPassword: string;
}

// API services for authentication
export const authService = {
  // Register a new user
  register: (registerData: RegisterData): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post<AuthResponse, RegisterData>('/auth/register', registerData);
  },

  // Login with phone/email and password
  login: (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post<AuthResponse, LoginCredentials>('/auth/login', credentials);
  },

  // Logout
  logout: (): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.post<{ success: boolean }>('/auth/logout');
  },

  // Verify phone number with OTP
  verifyPhone: (data: PhoneVerification): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post<AuthResponse, PhoneVerification>('/auth/verify-phone', data);
  },

  // Request a new phone verification code
  requestPhoneVerification: (): Promise<ApiResponse<{ success: boolean; message: string }>> => {
    return apiClient.post<{ success: boolean; message: string }>('/auth/request-phone-verification');
  },

  // Request password reset code
  requestPasswordReset: (data: PasswordResetRequest): Promise<ApiResponse<{ success: boolean; message: string }>> => {
    return apiClient.post<{ success: boolean; message: string }, PasswordResetRequest>('/auth/forgot-password', data);
  },

  // Reset password with code
  resetPassword: (data: PasswordReset): Promise<ApiResponse<{ success: boolean; message: string }>> => {
    return apiClient.post<{ success: boolean; message: string }, PasswordReset>('/auth/reset-password', data);
  },

  // Change password (when logged in)
  changePassword: (currentPassword: string, newPassword: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.post<{ success: boolean }, { currentPassword: string; newPassword: string }>('/auth/change-password', {
      currentPassword,
      newPassword
    });
  },

  // Get current user
  getCurrentUser: (): Promise<ApiResponse<User>> => {
    return apiClient.get<User>('/auth/me');
  },

  // Refresh token
  refreshToken: (): Promise<ApiResponse<{ token: string }>> => {
    return apiClient.post<{ token: string }>('/auth/refresh-token');
  },

  // Two-factor authentication setup
  setupTwoFactor: (): Promise<ApiResponse<{ setupUrl: string; secret: string }>> => {
    return apiClient.post<{ setupUrl: string; secret: string }>('/auth/two-factor/setup');
  },

  // Verify two-factor setup
  verifyTwoFactor: (code: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.post<{ success: boolean }, { code: string }>('/auth/two-factor/verify', { code });
  },

  // Disable two-factor
  disableTwoFactor: (password: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.post<{ success: boolean }, { password: string }>('/auth/two-factor/disable', { password });
  }
}; 