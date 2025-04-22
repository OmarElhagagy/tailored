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
  errors?: Record<string, string[]>;
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
  meta: PaginationMeta;
}

/**
 * User and Authentication types
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'tailor' | 'customer';
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
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
  id: string;
  customerId: string;
  customerName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  totalAmount: number;
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  items: OrderItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
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