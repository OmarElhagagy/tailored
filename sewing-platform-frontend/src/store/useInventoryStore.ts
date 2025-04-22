import { create } from 'zustand';

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
}

interface InventoryState {
  items: InventoryItem[];
  isLoading: boolean;
  error: string | null;
  
  // Filters
  searchTerm: string;
  categoryFilter: string;
  showLowStockOnly: boolean;
  
  // Actions
  fetchInventory: () => Promise<void>;
  addItem: (item: Omit<InventoryItem, 'id' | 'lastRestocked' | 'lowStock'>) => Promise<void>;
  updateQuantity: (id: string, newQuantity: number) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  
  // Filter actions
  setSearchTerm: (term: string) => void;
  setCategoryFilter: (category: string) => void;
  setShowLowStockOnly: (show: boolean) => void;
  resetFilters: () => void;
}

export const useInventoryStore = create<InventoryState>()((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  
  // Filter states
  searchTerm: '',
  categoryFilter: '',
  showLowStockOnly: false,
  
  // Actions
  fetchInventory: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock inventory data
      const mockInventory: InventoryItem[] = [
        {
          id: 'item-1',
          name: 'Italian Wool Fabric - Navy',
          category: 'fabric',
          quantity: 24,
          unit: 'yards',
          minStock: 10,
          price: 45.99,
          supplier: 'Premium Fabrics Ltd.',
          lastRestocked: '2023-04-15'
        },
        {
          id: 'item-2',
          name: 'Cotton Blend - White',
          category: 'fabric',
          quantity: 56,
          unit: 'yards',
          minStock: 20,
          price: 12.50,
          supplier: 'Textile Imports Inc.',
          lastRestocked: '2023-05-02'
        },
        {
          id: 'item-3',
          name: 'Metal Buttons - Gold',
          category: 'notions',
          quantity: 183,
          unit: 'pieces',
          minStock: 50,
          price: 0.75,
          supplier: 'Fashion Accessories Co.',
          lastRestocked: '2023-04-28'
        },
        {
          id: 'item-4',
          name: 'Silk Thread - Assorted Colors',
          category: 'notions',
          quantity: 42,
          unit: 'spools',
          minStock: 15,
          price: 3.99,
          supplier: 'Sewing Supplies Direct',
          lastRestocked: '2023-05-10'
        },
        {
          id: 'item-5',
          name: 'Premium Suit Form - Size 42',
          category: 'equipment',
          quantity: 3,
          unit: 'pieces',
          minStock: 1,
          price: 299.99,
          supplier: 'Tailor Equipment Ltd.',
          lastRestocked: '2023-03-05'
        },
        {
          id: 'item-6',
          name: 'Linen Fabric - Beige',
          category: 'fabric',
          quantity: 8,
          unit: 'yards',
          minStock: 15,
          price: 22.99,
          supplier: 'Premium Fabrics Ltd.',
          lastRestocked: '2023-04-15',
          lowStock: true
        },
      ];
      
      // Update low stock flags
      const processedInventory = mockInventory.map(item => ({
        ...item,
        lowStock: item.quantity < item.minStock
      }));
      
      set({ items: processedInventory, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch inventory',
        isLoading: false
      });
    }
  },
  
  addItem: async (newItemData) => {
    try {
      set({ isLoading: true, error: null });
      
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const today = new Date().toISOString().slice(0, 10);
      const { items } = get();
      
      const newItem: InventoryItem = {
        ...newItemData,
        id: `item-${items.length + 1}`,
        lastRestocked: today,
        lowStock: newItemData.quantity < newItemData.minStock
      };
      
      set({
        items: [...items, newItem],
        isLoading: false
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add item',
        isLoading: false
      });
    }
  },
  
  updateQuantity: (id, newQuantity) => {
    if (newQuantity < 0) return;
    
    const { items } = get();
    
    const updatedItems = items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          quantity: newQuantity,
          lowStock: newQuantity < item.minStock
        };
      }
      return item;
    });
    
    set({ items: updatedItems });
  },
  
  updateItem: async (id, updates) => {
    try {
      set({ isLoading: true, error: null });
      
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { items } = get();
      
      const updatedItems = items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, ...updates };
          // Recalculate lowStock if quantity or minStock changed
          if ('quantity' in updates || 'minStock' in updates) {
            updatedItem.lowStock = updatedItem.quantity < updatedItem.minStock;
          }
          return updatedItem;
        }
        return item;
      });
      
      set({ items: updatedItems, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update item',
        isLoading: false
      });
    }
  },
  
  deleteItem: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { items } = get();
      const filteredItems = items.filter(item => item.id !== id);
      
      set({ items: filteredItems, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete item',
        isLoading: false
      });
    }
  },
  
  // Filter actions
  setSearchTerm: (term) => set({ searchTerm: term }),
  setCategoryFilter: (category) => set({ categoryFilter: category }),
  setShowLowStockOnly: (show) => set({ showLowStockOnly: show }),
  resetFilters: () => set({
    searchTerm: '',
    categoryFilter: '',
    showLowStockOnly: false
  })
})); 