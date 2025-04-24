import apiClient from '../apiClient';
import { Order, PaginatedResponse } from '../types';

class OrderService {
  /**
   * Get buyer orders
   */
  async getBuyerOrders(status) {
    try {
      const params = status ? { status } : {};
      return await apiClient.getPaginated('/orders/buyer', params);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get seller orders
   */
  async getSellerOrders(status) {
    try {
      const params = status ? { status } : {};
      return await apiClient.getPaginated('/orders/seller', params);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(id) {
    try {
      return await apiClient.get(`/orders/${id}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create new order
   */
  async createOrder(orderData) {
    try {
      return await apiClient.post('/orders', orderData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(id, status) {
    try {
      return await apiClient.patch(`/orders/${id}/status`, { status });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(id, reason) {
    try {
      return await apiClient.post(`/orders/${id}/cancel`, { reason });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Complete order
   */
  async completeOrder(id) {
    try {
      return await apiClient.post(`/orders/${id}/complete`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Request refund
   */
  async requestRefund(id, refundData) {
    try {
      return await apiClient.post(`/orders/${id}/refund`, refundData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add order notes
   */
  async addOrderNotes(id, notes) {
    try {
      return await apiClient.post(`/orders/${id}/notes`, { notes });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Make payment for order
   */
  async makePayment(id, paymentData) {
    try {
      return await apiClient.post(`/payments/order/${id}`, paymentData);
    } catch (error) {
      throw error;
    }
  }
}

const orderService = new OrderService();
export default orderService; 