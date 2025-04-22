'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function InventoryManagement() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inventory, setInventory] = useState<any[]>([]);
  const [stockSummary, setStockSummary] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 1
  });
  
  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [lowStock, setLowStock] = useState(false);
  
  useEffect(() => {
    fetchInventory();
  }, [pagination.page, search, category, sortBy, sortDir, lowStock]);
  
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortDir
      });
      
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (lowStock) params.append('lowStock', 'true');
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/inventory?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setInventory(response.data.data.items);
      setPagination(response.data.data.pagination);
      setCategories(response.data.data.categories);
      setStockSummary(response.data.data.stockSummary);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load inventory data');
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAdjustStock = async (id: string, action: string, quantity: number) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/inventory/${id}/adjust`,
        { action, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the inventory data after adjustment
      fetchInventory();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to adjust stock');
      console.error('Error adjusting stock:', err);
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset to first page when searching
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/inventory/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update inventory after deletion
      fetchInventory();
    } catch (err: any) {
      // Handle case where item is used in listings
      if (err.response?.data?.errors?.[0]?.listings) {
        const listings = err.response.data.errors[0].listings;
        const listingNames = listings.map((l: any) => l.title).join(', ');
        setError(`Cannot delete this item as it is used in the following listings: ${listingNames}`);
      } else {
        setError(err.response?.data?.message || 'Failed to delete item');
      }
      console.error('Error deleting item:', err);
    }
  };
  
  if (loading && inventory.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <Link 
          href="/inventory/add" 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New Item
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {/* Inventory Summary Cards */}
      {stockSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Items</h3>
            <p className="text-2xl font-bold">{stockSummary.totalItems}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Value</h3>
            <p className="text-2xl font-bold">${stockSummary.totalValue.toFixed(2)}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-gray-500 text-sm font-medium">Low Stock Items</h3>
            <p className="text-2xl font-bold text-amber-500">{stockSummary.lowStockItems}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-gray-500 text-sm font-medium">Out of Stock</h3>
            <p className="text-2xl font-bold text-red-500">{stockSummary.outOfStockItems}</p>
          </div>
        </div>
      )}
      
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded w-full py-2 px-3"
              placeholder="Search items..."
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border rounded w-full py-2 px-3"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat._id} ({cat.count})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <div className="flex space-x-2">
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded flex-grow py-2 px-3"
              >
                <option value="createdAt">Date Added</option>
                <option value="name">Name</option>
                <option value="stock">Stock Level</option>
                <option value="price">Price</option>
              </select>
              <button
                type="button"
                onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
                className="border rounded p-2"
                title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
              >
                {sortDir === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
          
          <div className="flex items-end">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="lowStock"
                checked={lowStock}
                onChange={(e) => setLowStock(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="lowStock" className="text-sm font-medium text-gray-700">
                Show Low Stock Only
              </label>
            </div>
            
            <button
              type="submit"
              className="ml-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Filter
            </button>
          </div>
        </form>
      </div>
      
      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {inventory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.map((item) => (
                  <tr key={item._id} className={item.stock <= item.reorderPoint ? 'bg-amber-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.photo && (
                          <div className="h-10 w-10 flex-shrink-0 mr-3">
                            <img 
                              src={`${process.env.NEXT_PUBLIC_API_URL}/${item.photo}`} 
                              alt={item.name} 
                              className="h-10 w-10 rounded object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.sku || 'No SKU'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        item.stock === 0 ? 'text-red-600' : 
                        item.stock <= item.reorderPoint ? 'text-amber-600' : 
                        'text-gray-900'
                      }`}>
                        {item.stock} {item.unit}
                      </div>
                      {item.stock <= item.reorderPoint && (
                        <div className="text-xs text-amber-600">
                          Low stock alert
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${item.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleAdjustStock(item._id, 'add', 1)}
                          className="text-green-600 hover:text-green-900"
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleAdjustStock(item._id, 'remove', 1)}
                          className="text-red-600 hover:text-red-900"
                          disabled={item.stock <= 0}
                        >
                          -
                        </button>
                        <Link
                          href={`/inventory/${item._id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                        <Link
                          href={`/inventory/${item._id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No inventory items found</p>
            <Link
              href="/inventory/add"
              className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add your first item
            </Link>
          </div>
        )}
        
        {/* Pagination */}
        {inventory.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                      pagination.page === 1 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    } text-sm font-medium`}
                  >
                    Previous
                  </button>
                  
                  {/* Page buttons - simplified version */}
                  {Array.from({ length: Math.min(pagination.pages, 5) }).map((_, i) => {
                    const pageNum = pagination.page <= 3 
                      ? i + 1 
                      : pagination.page + i - 2;
                      
                    if (pageNum > pagination.pages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pagination.page === pageNum
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                      pagination.page === pagination.pages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    } text-sm font-medium`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
