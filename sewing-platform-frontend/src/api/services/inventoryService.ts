import { apiClient } from '../apiClient';
import { 
  InventoryItem, 
  CreateInventoryItemRequest,
  UpdateInventoryItemRequest,
  InventoryFilters,
  ApiResponse,
  PaginatedResponse
} from '../types';

/**
 * Inventory service to handle inventory API calls
 */
export const inventoryService = {
  /**
   * Get all inventory items with pagination and filtering
   * @param filters Filtering and pagination options
   * @returns Paginated inventory items
   */
  async getInventoryItems(filters: InventoryFilters = {}): Promise<PaginatedResponse<InventoryItem>> {
    return apiClient.getPaginated<InventoryItem>('/inventory', filters);
  },

  /**
   * Get a single inventory item by ID
   * @param id Inventory item ID
   * @returns Inventory item
   */
  async getInventoryItem(id: string): Promise<ApiResponse<InventoryItem>> {
    return apiClient.get<InventoryItem>(`/inventory/${id}`);
  },

  /**
   * Create a new inventory item
   * @param data New inventory item data
   * @returns Created inventory item
   */
  async createInventoryItem(data: CreateInventoryItemRequest): Promise<ApiResponse<InventoryItem>> {
    return apiClient.post<InventoryItem, CreateInventoryItemRequest>('/inventory', data);
  },

  /**
   * Update an existing inventory item
   * @param id Inventory item ID
   * @param data Updated inventory item data
   * @returns Updated inventory item
   */
  async updateInventoryItem(id: string, data: UpdateInventoryItemRequest): Promise<ApiResponse<InventoryItem>> {
    return apiClient.patch<InventoryItem, UpdateInventoryItemRequest>(`/inventory/${id}`, data);
  },

  /**
   * Update inventory item quantity
   * @param id Inventory item ID
   * @param quantity New quantity
   * @returns Updated inventory item
   */
  async updateQuantity(id: string, quantity: number): Promise<ApiResponse<InventoryItem>> {
    return apiClient.patch<InventoryItem>(`/inventory/${id}/quantity`, { quantity });
  },

  /**
   * Delete an inventory item
   * @param id Inventory item ID
   * @returns Success response
   */
  async deleteInventoryItem(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(`/inventory/${id}`);
  },

  /**
   * Get low stock inventory items
   * @returns List of low stock items
   */
  async getLowStockItems(): Promise<ApiResponse<InventoryItem[]>> {
    return apiClient.get<InventoryItem[]>('/inventory/low-stock');
  },

  /**
   * Get inventory items by category
   * @param category Category name
   * @returns List of inventory items in the category
   */
  async getItemsByCategory(category: string): Promise<ApiResponse<InventoryItem[]>> {
    return apiClient.get<InventoryItem[]>('/inventory/category', { category });
  }
}; 