import apiClient from '../apiClient';
import { Review, PaginatedResponse } from '../types';

class ReviewService {
  /**
   * Get reviews for a listing
   */
  async getListingReviews(listingId) {
    try {
      return await apiClient.getPaginated(`/reviews/listing/${listingId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get reviews for a seller
   */
  async getSellerReviews(sellerId) {
    try {
      return await apiClient.getPaginated(`/reviews/seller/${sellerId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get buyer's reviews
   */
  async getBuyerReviews() {
    try {
      return await apiClient.getPaginated('/reviews/buyer');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create new review
   */
  async createReview(reviewData) {
    try {
      return await apiClient.post('/reviews', reviewData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update review
   */
  async updateReview(id, reviewData) {
    try {
      return await apiClient.put(`/reviews/${id}`, reviewData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete review
   */
  async deleteReview(id) {
    try {
      return await apiClient.delete(`/reviews/${id}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add seller reply to review
   */
  async addSellerReply(id, reply) {
    try {
      return await apiClient.post(`/reviews/${id}/reply`, { reply });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload review photo
   */
  async uploadReviewPhoto(id, formData) {
    try {
      return await apiClient.uploadFormData(`/reviews/${id}/photos`, formData);
    } catch (error) {
      throw error;
    }
  }
}

const reviewService = new ReviewService();
export default reviewService; 