// Export API client
export { apiClient } from './apiClient';

// Export API types
export * from './types';

// Export services
import { authService } from './services/authService';
import { inventoryService } from './services/inventoryService';

// Export services as an API object
export const api = {
  auth: authService,
  inventory: inventoryService,
};

// Default export for easy importing
export default api; 