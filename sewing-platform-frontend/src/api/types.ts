/**
 * API Response types
 */

// Common API response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Error response
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  errors?: Array<{ field?: string; message: string }>;
}

// Pagination metadata
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Paginated response
export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * User and Authentication types
 */
export interface User {
  _id: string;
  email: string;
  name: string;
  phone: string;
  role: 'buyer' | 'seller' | 'admin';
  businessName?: string;
  businessAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  credentialVerificationStatus?: 'not_submitted' | 'pending' | 'verified' | 'rejected';
  profileImage?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'tailor' | 'customer';
}

/**
 * Inventory types
 */
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  price: number;
  supplier: string;
  lastRestocked: string;
  lowStock?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInventoryItemRequest {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  price: number;
  supplier: string;
}

export interface UpdateInventoryItemRequest {
  name?: string;
  category?: string;
  quantity?: number;
  unit?: string;
  minStock?: number;
  price?: number;
  supplier?: string;
}

export interface InventoryFilters {
  search?: string;
  category?: string;
  lowStockOnly?: boolean;
  sortBy?: 'name' | 'quantity' | 'price' | 'lastRestocked';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

/**
 * Order types
 */
export interface Order {
  _id: string;
  orderNumber: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';
  quantity: number;
  totalPrice: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  deliveryMethod: string;
  deliveryFee: number;
  customizations?: Record<string, string>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CreateOrderRequest {
  customerId: string;
  items: Omit<OrderItem, 'id' | 'orderId'>[];
  notes?: string;
  dueDate?: string;
}

export interface UpdateOrderRequest {
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  paymentStatus?: 'unpaid' | 'paid' | 'refunded';
  notes?: string;
  dueDate?: string;
}

export interface OrderFilters {
  search?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  paymentStatus?: 'unpaid' | 'paid' | 'refunded';
  fromDate?: string;
  toDate?: string;
  sortBy?: 'createdAt' | 'dueDate' | 'totalAmount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface Review {
  _id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  rating: number;
  comment: string;
  photos?: string[];
  sellerReply?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: 'buyer' | 'seller';
  businessName?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

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
  tags: string[];
  customizable: boolean;
  customizationOptions?: Array<{
    name: string;
    choices: string[];
  }>;
  estimatedMakingTime?: number;
  status: 'active' | 'sold' | 'inactive' | 'draft';
  rating: {
    average: number;
    count: number;
  };
  deliveryOptions: Array<{
    method: 'pickup' | 'standard' | 'express' | 'overnight';
    fee: number;
    estimatedDays?: {
      min: number;
      max: number;
    };
    description?: string;
  }>;
}

export interface ListingFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AxiosConfig extends AxiosRequestConfig {
  headers?: Record<string, string>;
} 