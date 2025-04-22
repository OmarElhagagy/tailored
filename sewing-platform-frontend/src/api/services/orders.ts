import { apiClient } from '../apiClient';
import { ApiResponse, PaginatedResponse } from '../types';

// Define types based on backend model
export interface Order {
  _id: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  quantity: number;
  customRequest?: string;
  customizationChoices?: Record<string, string>;
  materialChoice?: string;
  weight?: number;
  status: 'pending' | 'accepted' | 'making' | 'ready' | 'delivered' | 'canceled' | 'completed' | 'disputed';
  statusHistory: {
    status: 'pending' | 'accepted' | 'making' | 'ready' | 'delivered' | 'canceled' | 'completed' | 'disputed';
    timestamp: string;
    note?: string;
  }[];
  scheduledDay?: string;
  paymentMethod: 'cash' | 'cashOnDelivery' | 'vodafoneCash' | 'creditCard' | 'fawry' | 'bankTransfer' | 'instaPay';
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded' | 'failed';
  paymentTransactions: {
    transactionId: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    provider: string;
    timestamp: string;
    notes?: string;
  }[];
  delivery: {
    method: 'pickup' | 'standard' | 'express' | 'overnight';
    fee: number;
    estimatedDays?: {
      min: number;
      max: number;
    };
    deliveryAddress?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    carrier?: string;
    trackingInfo?: {
      carrier: string;
      trackingNumber: string;
      trackingUrl: string;
      statusHistory: {
        status: 'info_received' | 'in_transit' | 'out_for_delivery' | 'delivery_attempt' | 'exception' | 'delivered';
        location?: string;
        timestamp: string;
        description?: string;
      }[];
      lastUpdated: string;
      estimatedDelivery?: string;
      currentStatus: 'pending' | 'info_received' | 'in_transit' | 'out_for_delivery' | 'delivery_attempt' | 'exception' | 'delivered';
      notificationsEnabled: boolean;
      lastNotificationSent?: string;
      signatureRequired: boolean;
      actualDeliveryPhoto?: string;
      deliveryInstructions?: string;
      delayReason?: string;
    };
    pickupDate?: string;
    pickupLocation?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      notes?: string;
    };
    actualDelivery?: string;
    shippingLabel?: string;
    lastUpdated?: string;
  };
  price: {
    base: number;
    materialCost: number;
    weightBasedCost: number;
    customizationCost: number;
    discount: number;
    subtotal: number;
    tax: number;
    deliveryFee: number;
    total: number;
    currency: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrderFilters {
  buyerId?: string;
  sellerId?: string;
  status?: string | string[];
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// API services for orders
export const ordersService = {
  // Get all orders with pagination and filters
  getAllOrders: (filters: OrderFilters = {}): Promise<PaginatedResponse<Order>> => {
    return apiClient.getPaginated<Order>('/orders', filters);
  },

  // Get a single order by ID
  getOrderById: (id: string): Promise<ApiResponse<Order>> => {
    return apiClient.get<Order>(`/orders/${id}`);
  },

  // Create a new order
  createOrder: (orderData: Partial<Order>): Promise<ApiResponse<Order>> => {
    return apiClient.post<Order, Partial<Order>>('/orders', orderData);
  },

  // Update an order
  updateOrder: (id: string, orderData: Partial<Order>): Promise<ApiResponse<Order>> => {
    return apiClient.put<Order, Partial<Order>>(`/orders/${id}`, orderData);
  },

  // Cancel an order
  cancelOrder: (id: string, reason: string): Promise<ApiResponse<Order>> => {
    return apiClient.post<Order, { reason: string }>(`/orders/${id}/cancel`, { reason });
  },

  // Update order status
  updateOrderStatus: (id: string, status: Order['status'], note?: string): Promise<ApiResponse<Order>> => {
    return apiClient.post<Order, { status: Order['status'], note?: string }>(`/orders/${id}/status`, { status, note });
  },

  // Get buyer's orders
  getBuyerOrders: (buyerId: string, filters: Omit<OrderFilters, 'buyerId'> = {}): Promise<PaginatedResponse<Order>> => {
    return apiClient.getPaginated<Order>('/orders', { ...filters, buyerId });
  },

  // Get seller's orders
  getSellerOrders: (sellerId: string, filters: Omit<OrderFilters, 'sellerId'> = {}): Promise<PaginatedResponse<Order>> => {
    return apiClient.getPaginated<Order>('/orders', { ...filters, sellerId });
  },

  // Update delivery info
  updateDeliveryInfo: (id: string, deliveryInfo: Partial<Order['delivery']>): Promise<ApiResponse<Order>> => {
    return apiClient.put<Order, { delivery: Partial<Order['delivery']> }>(`/orders/${id}/delivery`, { delivery: deliveryInfo });
  },

  // Add tracking info
  addTrackingInfo: (id: string, trackingInfo: Partial<Order['delivery']['trackingInfo']>): Promise<ApiResponse<Order>> => {
    return apiClient.post<Order, { trackingInfo: Partial<Order['delivery']['trackingInfo']> }>(`/orders/${id}/tracking`, { trackingInfo });
  },

  // Add payment transaction
  addPaymentTransaction: (id: string, transaction: Omit<Order['paymentTransactions'][0], 'timestamp'>): Promise<ApiResponse<Order>> => {
    return apiClient.post<Order, { transaction: Omit<Order['paymentTransactions'][0], 'timestamp'> }>(`/orders/${id}/payment`, { transaction });
  },

  // Request a refund
  requestRefund: (id: string, reason: string, amount?: number): Promise<ApiResponse<{ success: boolean, refundId: string }>> => {
    return apiClient.post<{ success: boolean, refundId: string }, { reason: string, amount?: number }>(`/orders/${id}/refund-request`, { reason, amount });
  },

  // Get order analytics
  getOrderAnalytics: (filters: OrderFilters = {}): Promise<ApiResponse<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    statusDistribution: Record<Order['status'], number>;
    revenueByDay: Array<{ date: string, revenue: number }>;
  }>> => {
    return apiClient.get<{
      totalOrders: number;
      totalRevenue: number;
      averageOrderValue: number;
      statusDistribution: Record<Order['status'], number>;
      revenueByDay: Array<{ date: string, revenue: number }>;
    }>('/orders/analytics', filters);
  }
}; 