import { apiClient } from '../apiClient';
import { ApiResponse, PaginatedResponse } from '../types';

// Define types based on backend model
export interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  subCategory?: string;
  sellerId: string;
  photos: string[];
  mainPhoto: string;
  inventoryItems: {
    itemId: string;
    quantity: number;
  }[];
  tags: string[];
  customizable: boolean;
  customizationOptions: {
    name: string;
    choices: string[];
  }[];
  estimatedMakingTime?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit: 'cm' | 'in';
  };
  weight?: {
    value: number;
    unit: 'kg' | 'g' | 'lb' | 'oz';
  };
  status: 'active' | 'sold' | 'inactive' | 'draft';
  views: number;
  favoriteCount: number;
  rating: {
    average: number;
    count: number;
  };
  deliveryOptions: {
    method: 'pickup' | 'standard' | 'express' | 'overnight';
    fee: number;
    estimatedDays?: {
      min: number;
      max: number;
    };
    description?: string;
    availableLocations?: string[];
  }[];
  bulkDiscounts?: {
    minimumQuantity: number;
    discountPercentage: number;
    description?: string;
  }[];
  priceCalculation: 'fixed' | 'weight_based' | 'material_based' | 'custom';
  pricePerKg?: number;
  materialCostFactors?: {
    baseCost: number;
    additionalFactors: {
      name: string;
      costMultiplier: number;
      description?: string;
    }[];
  };
  availableMaterials?: {
    name: string;
    description?: string;
    priceMultiplier: number;
  }[];
  pricingTemplate?: 'basic' | 'premium' | 'custom' | 'none';
  showPricingBreakdown?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListingFilters {
  searchTerm?: string;
  category?: string;
  subCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
  tags?: string[];
  status?: string;
  customizable?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// API services for listings
export const listingsService = {
  // Get all listings with pagination and filters
  getAllListings: (filters: ListingFilters = {}): Promise<PaginatedResponse<Listing>> => {
    return apiClient.getPaginated<Listing>('/listings', filters);
  },

  // Get a single listing by ID
  getListingById: (id: string): Promise<ApiResponse<Listing>> => {
    return apiClient.get<Listing>(`/listings/${id}`);
  },

  // Create a new listing
  createListing: (listingData: Partial<Listing>): Promise<ApiResponse<Listing>> => {
    return apiClient.post<Listing, Partial<Listing>>('/listings', listingData);
  },

  // Update a listing
  updateListing: (id: string, listingData: Partial<Listing>): Promise<ApiResponse<Listing>> => {
    return apiClient.put<Listing, Partial<Listing>>(`/listings/${id}`, listingData);
  },

  // Delete a listing
  deleteListing: (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.delete<{ success: boolean }>(`/listings/${id}`);
  },

  // Get featured listings
  getFeaturedListings: (): Promise<ApiResponse<Listing[]>> => {
    return apiClient.get<Listing[]>('/listings/featured');
  },

  // Search listings
  searchListings: (searchTerm: string): Promise<PaginatedResponse<Listing>> => {
    return apiClient.getPaginated<Listing>('/listings/search', { searchTerm });
  },

  // Add a view to a listing
  addView: (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.post<{ success: boolean }>(`/listings/${id}/view`);
  },

  // Add/remove listing from favorites
  toggleFavorite: (id: string): Promise<ApiResponse<{ isFavorite: boolean }>> => {
    return apiClient.post<{ isFavorite: boolean }>(`/listings/${id}/favorite`);
  },

  // Get related listings based on a specific listing
  getRelatedListings: (id: string): Promise<ApiResponse<Listing[]>> => {
    return apiClient.get<Listing[]>(`/listings/${id}/related`);
  },

  // Get seller's listings
  getSellerListings: (sellerId: string): Promise<PaginatedResponse<Listing>> => {
    return apiClient.getPaginated<Listing>('/listings', { sellerId });
  }
}; 