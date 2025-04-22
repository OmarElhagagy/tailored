import { apiClient } from '../apiClient';
import { ApiResponse, PaginatedResponse } from '../types';
import { User } from './auth';

export interface UserFilters {
  role?: string;
  verificationStatus?: string;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface UserUpdate {
  name?: string;
  contactEmail?: string;
  businessName?: string;
  businessDescription?: string;
  businessWebsite?: string;
  businessEstablishedYear?: number;
  businessAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  sellerProfile?: Partial<User['sellerProfile']>;
}

export interface SellerProfileStats {
  totalSales: number;
  totalListings: number;
  averageRating: number;
  responseRate: number;
  averageResponseTime: number; // in minutes
  completionRate: number;
  totalReviews: number;
  onTimeDeliveryRate: number;
  returnRate: number;
}

// API services for users
export const usersService = {
  // Get all users with pagination and filters (admin only)
  getAllUsers: (filters: UserFilters = {}): Promise<PaginatedResponse<User>> => {
    return apiClient.getPaginated<User>('/users', filters);
  },

  // Get a single user by ID
  getUserById: (id: string): Promise<ApiResponse<User>> => {
    return apiClient.get<User>(`/users/${id}`);
  },

  // Update current user
  updateUser: (userData: UserUpdate): Promise<ApiResponse<User>> => {
    return apiClient.put<User, UserUpdate>('/users/profile', userData);
  },

  // Update seller profile specifically
  updateSellerProfile: (profileData: Partial<User['sellerProfile']>): Promise<ApiResponse<User>> => {
    return apiClient.put<User, { sellerProfile: Partial<User['sellerProfile']> }>('/users/seller-profile', {
      sellerProfile: profileData
    });
  },

  // Upload profile image
  uploadProfileImage: (formData: FormData): Promise<ApiResponse<{ imageUrl: string }>> => {
    return apiClient.uploadFormData<{ imageUrl: string }>('/users/profile-image', formData);
  },

  // Upload business logo
  uploadBusinessLogo: (formData: FormData): Promise<ApiResponse<{ imageUrl: string }>> => {
    return apiClient.uploadFormData<{ imageUrl: string }>('/users/business-logo', formData);
  },

  // Upload business banner
  uploadBusinessBanner: (formData: FormData): Promise<ApiResponse<{ imageUrl: string }>> => {
    return apiClient.uploadFormData<{ imageUrl: string }>('/users/business-banner', formData);
  },

  // Get seller profile stats
  getSellerStats: (sellerId: string): Promise<ApiResponse<SellerProfileStats>> => {
    return apiClient.get<SellerProfileStats>(`/users/${sellerId}/stats`);
  },

  // Get favorite sellers
  getFavoriteSellers: (): Promise<ApiResponse<User[]>> => {
    return apiClient.get<User[]>('/users/favorite-sellers');
  },

  // Toggle seller favorite status
  toggleFavoriteSeller: (sellerId: string): Promise<ApiResponse<{ isFavorite: boolean }>> => {
    return apiClient.post<{ isFavorite: boolean }>(`/users/favorite-sellers/${sellerId}`);
  },

  // Submit business credentials for verification
  submitBusinessCredentials: (formData: FormData): Promise<ApiResponse<{ success: boolean; message: string }>> => {
    return apiClient.uploadFormData<{ success: boolean; message: string }>('/business-credentials/submit', formData);
  },

  // Get business credentials status
  getBusinessCredentialsStatus: (): Promise<ApiResponse<{
    status: 'not_submitted' | 'pending' | 'verified' | 'rejected';
    rejectionReason?: string;
    submittedDate?: string;
    verificationDate?: string;
  }>> => {
    return apiClient.get<{
      status: 'not_submitted' | 'pending' | 'verified' | 'rejected';
      rejectionReason?: string;
      submittedDate?: string;
      verificationDate?: string;
    }>('/business-credentials/status');
  },

  // Accept legal terms
  acceptLegalTerms: (documentId: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.post<{ success: boolean }, { documentId: string }>('/legal/accept', { documentId });
  },

  // Get user's legal acceptance status
  getLegalAcceptanceStatus: (): Promise<ApiResponse<{
    acceptedDocuments: Array<{
      documentId: string;
      documentName: string;
      version: string;
      acceptedAt: string;
    }>;
    pendingDocuments: Array<{
      documentId: string;
      documentName: string;
      version: string;
      mandatory: boolean;
    }>;
  }>> => {
    return apiClient.get<{
      acceptedDocuments: Array<{
        documentId: string;
        documentName: string;
        version: string;
        acceptedAt: string;
      }>;
      pendingDocuments: Array<{
        documentId: string;
        documentName: string;
        version: string;
        mandatory: boolean;
      }>;
    }>('/legal/status');
  },

  // Delete user account (self)
  deleteAccount: (password: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.post<{ success: boolean }, { password: string }>('/users/delete-account', { password });
  }
}; 