import apiClient from '../apiClient';
import { Listing, ListingFilters, PaginatedResponse } from '../types';

class ListingService {
  /**
   * Get all listings with optional filters
   */
  async getListings(filters = {}) {
    try {
      return await apiClient.getPaginated('/listings', filters);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get listing by ID
   */
  async getListingById(id) {
    try {
      return await apiClient.get(`/listings/${id}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create new listing
   */
  async createListing(listingData) {
    try {
      return await apiClient.post('/listings', listingData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update listing
   */
  async updateListing(id, listingData) {
    try {
      return await apiClient.put(`/listings/${id}`, listingData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete listing
   */
  async deleteListing(id) {
    try {
      return await apiClient.delete(`/listings/${id}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload listing photo
   */
  async uploadListingPhoto(id, formData) {
    try {
      return await apiClient.uploadFormData(`/listings/${id}/photos`, formData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Set main photo for listing
   */
  async setMainPhoto(id, photoUrl) {
    try {
      return await apiClient.patch(`/listings/${id}/main-photo`, { photoUrl });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get seller listings
   */
  async getSellerListings(sellerId, status = 'active') {
    try {
      return await apiClient.getPaginated('/listings', { sellerId, status });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search listings
   */
  async searchListings(query) {
    try {
      return await apiClient.getPaginated('/listings/search', { query });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get listing categories
   */
  async getCategories() {
    try {
      return await apiClient.get('/listings/categories');
    } catch (error) {
      throw error;
    }
  }
}

const listingService = new ListingService();
export default listingService; 