import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function DashboardProducts() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Mock product inventory data
  const [inventory, setInventory] = useState([
    {
      id: 1,
      name: 'Tailored Suit',
      category: 'Men\'s Suits',
      price: 299.99,
      stock: 15,
      threshold: 5,
      sku: 'TS-001',
      image: 'https://via.placeholder.com/150',
      salesCount: 42,
      views: 230
    },
    {
      id: 2,
      name: 'Evening Dress',
      category: 'Women\'s Dresses',
      price: 189.99,
      stock: 8,
      threshold: 5,
      sku: 'ED-002',
      image: 'https://via.placeholder.com/150',
      salesCount: 36,
      views: 285
    },
    {
      id: 3,
      name: 'Casual Shirt',
      category: 'Men\'s Shirts',
      price: 59.99,
      stock: 25,
      threshold: 10,
      sku: 'CS-003',
      image: 'https://via.placeholder.com/150',
      salesCount: 67,
      views: 190
    },
    {
      id: 4,
      name: 'Formal Dress',
      category: 'Women\'s Dresses',
      price: 249.99,
      stock: 3,
      threshold: 5,
      sku: 'FD-004',
      image: 'https://via.placeholder.com/150',
      salesCount: 18,
      views: 125
    }
  ]);
  
  useEffect(() => {
    // Check if user is logged in
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        const userObj = JSON.parse(storedUser);
        setUser(userObj);
        setLoading(false);
      } else {
        // Redirect to login page if not authenticated
        router.push('/login?redirect=/dashboard/products');
      }
    } catch (err) {
      console.error('Error parsing user data:', err);
      router.push('/login?redirect=/dashboard/products');
    }
    
    // Check for success message in query params (from redirects)
    if (router.query.success) {
      setSuccessMessage(router.query.success);
      
      // Clear the message after 3 seconds
      const timer = setTimeout(() => {
        setSuccessMessage('');
        // Remove the query param
        router.replace('/dashboard/products', undefined, { shallow: true });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [router]);
  
  // Handle stock updates
  const handleUpdateStock = (productId, newStock) => {
    const updatedInventory = inventory.map(product => {
      if (product.id === productId) {
        return { ...product, stock: newStock };
      }
      return product;
    });
    
    setInventory(updatedInventory);
  };
  
  // Handle delete product
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };
  
  const confirmDelete = () => {
    if (!productToDelete) return;
    
    // Filter out the product to delete
    const updatedInventory = inventory.filter(product => product.id !== productToDelete.id);
    setInventory(updatedInventory);
    
    // Close modal and reset product to delete
    setDeleteModalOpen(false);
    setProductToDelete(null);
    
    // Show success message
    setSuccessMessage(`${productToDelete.name} has been deleted.`);
    
    // Clear the message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };
  
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };
  
  // Filter inventory based on search term
  const filteredInventory = inventory.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Ensure that only sellers can access this page
  if (user?.role !== 'seller') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-4">You need a seller account to access this page.</p>
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
          Return to Dashboard
        </Link>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success message toast notification */}
        {successMessage && (
          <div className="fixed inset-x-0 top-4 flex items-center justify-center">
            <div className="bg-green-50 p-4 rounded-md border border-green-200 shadow-lg max-w-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{successMessage}</p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button 
                      onClick={() => setSuccessMessage('')}
                      className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
                    >
                      <span className="sr-only">Dismiss</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Product Management
            </h1>
          </div>
          <div className="mt-4 flex justify-between items-center md:mt-0 md:ml-4">
            <div className="mr-4">
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            <Link 
              href="/dashboard/products/new" 
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add New Product
            </Link>
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {filteredInventory.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {filteredInventory.map(product => (
                <li key={product.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-md overflow-hidden">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="h-full w-full object-center object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm font-medium text-gray-900">${product.price.toFixed(2)}</div>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            value={product.stock}
                            onChange={(e) => handleUpdateStock(product.id, parseInt(e.target.value))}
                            className={`w-16 text-center rounded-md border ${product.stock <= product.threshold ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} text-sm`}
                          />
                          <div className={`absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full ${product.stock <= product.threshold ? 'bg-red-500' : 'bg-green-500'} text-xs text-white`}>
                            {product.stock <= product.threshold ? '!' : '✓'}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">{product.salesCount} sold</div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          className="text-sm text-blue-600 hover:text-blue-800"
                          onClick={() => router.push(`/dashboard/products/${product.id}`)}
                        >
                          Edit
                        </button>
                        <button 
                          className="text-sm text-red-600 hover:text-red-800"
                          onClick={() => handleDeleteClick(product)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? `No products match "${searchTerm}"` : "Get started by creating a new product."}
              </p>
              {searchTerm && (
                <button
                  type="button"
                  className="mt-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => setSearchTerm('')}
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </main>
      
      {/* Delete confirmation modal */}
      {deleteModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            {/* Center modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Product</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete {productToDelete?.name}? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={cancelDelete}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 