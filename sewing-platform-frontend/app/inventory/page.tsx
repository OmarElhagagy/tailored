'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
// Remove or mock navigation/link imports based on other pages
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
import { Button, Input, Select } from '../../components/FormElements';

// Mock router for now to avoid import errors
const useRouter = () => {
  return {
    push: (path: string) => console.log(`Would navigate to: ${path}`)
  };
};

// Mock inventory data
const MOCK_INVENTORY = [
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

// Define categories for filtering
const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'fabric', label: 'Fabrics' },
  { value: 'notions', label: 'Notions & Accessories' },
  { value: 'equipment', label: 'Equipment' }
];

export default function InventoryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [inventory, setInventory] = useState(MOCK_INVENTORY);
  const [filteredInventory, setFilteredInventory] = useState(MOCK_INVENTORY);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  
  // New item form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'fabric',
    quantity: 0,
    unit: 'yards',
    minStock: 0,
    price: 0,
    supplier: ''
  });
  
  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          router.push('/login');
          return;
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/login');
      }
    };
    
    checkAuth();
  }, [router]);
  
  // Apply filters when search term or category changes
  useEffect(() => {
    let results = [...inventory];
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (categoryFilter) {
      results = results.filter(item => item.category === categoryFilter);
    }
    
    // Apply low stock filter
    if (showLowStockOnly) {
      results = results.filter(item => item.quantity < item.minStock);
    }
    
    setFilteredInventory(results);
  }, [searchTerm, categoryFilter, showLowStockOnly, inventory]);
  
  // Handle adding new inventory item
  const handleAddItem = () => {
    if (!newItem.name || newItem.quantity < 0 || newItem.price < 0) {
      alert('Please fill in all required fields correctly');
      return;
    }
    
    const today = new Date().toISOString().slice(0, 10);
    const newItemWithId = {
      ...newItem,
      id: `item-${inventory.length + 1}`,
      lastRestocked: today,
      lowStock: newItem.quantity < newItem.minStock
    };
    
    const updatedInventory = [...inventory, newItemWithId];
    setInventory(updatedInventory);
    setFilteredInventory(updatedInventory);
    
    // Reset form
    setNewItem({
      name: '',
      category: 'fabric',
      quantity: 0,
      unit: 'yards',
      minStock: 0,
      price: 0,
      supplier: ''
    });
    setShowAddForm(false);
  };
  
  // Handle updating inventory quantity
  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    
    const updatedInventory = inventory.map(item => {
      if (item.id === id) {
        return {
          ...item,
          quantity: newQuantity,
          lowStock: newQuantity < item.minStock
        };
      }
      return item;
    });
    
    setInventory(updatedInventory);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Inventory Management
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Track and manage your materials, supplies, and equipment
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button 
                variant="primary"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                {showAddForm ? 'Cancel' : 'Add New Item'}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Add new item form */}
        {showAddForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Add New Inventory Item
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                id="item-name"
                label="Item Name"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                required
              />
              
              <Select
                id="item-category"
                label="Category"
                value={newItem.category}
                onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                options={CATEGORIES.filter(cat => cat.value !== '')}
                required
              />
              
              <div className="flex gap-4">
                <Input
                  id="item-quantity"
                  label="Quantity"
                  type="number"
                  value={newItem.quantity.toString()}
                  onChange={(e) => setNewItem({...newItem, quantity: parseFloat(e.target.value) || 0})}
                  required
                  className="flex-1"
                />
                
                <Input
                  id="item-unit"
                  label="Unit"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                  required
                  className="flex-1"
                />
              </div>
              
              <Input
                id="item-min-stock"
                label="Minimum Stock Level"
                type="number"
                value={newItem.minStock.toString()}
                onChange={(e) => setNewItem({...newItem, minStock: parseFloat(e.target.value) || 0})}
                required
                helpText="You'll be alerted when stock falls below this level"
              />
              
              <Input
                id="item-price"
                label="Price per Unit ($)"
                type="number"
                value={newItem.price.toString()}
                onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value) || 0})}
                required
              />
              
              <Input
                id="item-supplier"
                label="Supplier"
                value={newItem.supplier}
                onChange={(e) => setNewItem({...newItem, supplier: e.target.value})}
              />
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button 
                variant="secondary" 
                onClick={() => setShowAddForm(false)}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleAddItem}
              >
                Add to Inventory
              </Button>
            </div>
          </div>
        )}
        
        {/* Search and filter controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/3">
              <Input
                id="search"
                label="Search Inventory"
                type="text"
                placeholder="Search by name or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="w-full md:w-1/3">
              <Select
                id="category-filter"
                label="Filter by Category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                options={CATEGORIES}
              />
            </div>
            
            <div className="w-full md:w-1/3 flex items-end">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={showLowStockOnly}
                  onChange={() => setShowLowStockOnly(!showLowStockOnly)}
                />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ms-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show Low Stock Only
                </span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Inventory table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Restocked
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No inventory items found. {searchTerm || categoryFilter || showLowStockOnly ? 'Try adjusting your filters.' : ''}
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => (
                    <tr key={item.id} className={item.lowStock ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {item.name}
                        {item.lowStock && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            Low Stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <button
                            className="p-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <span className="mx-2 w-12 text-center">
                            {item.quantity} {item.unit}
                          </span>
                          <button
                            className="p-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {item.lastRestocked}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {item.supplier}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <Button size="sm" variant="outline">Edit</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Total Items
            </h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {inventory.length}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Low Stock Items
            </h3>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {inventory.filter(item => item.quantity < item.minStock).length}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Inventory Value
            </h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              ${inventory.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
