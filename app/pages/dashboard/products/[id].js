import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function DashboardProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    stock: 0,
    threshold: 0,
    sku: '',
    category: '',
    description: ''
  });
  
  // Mock inventory data for example
  const mockProducts = [
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
      views: 230,
      description: 'Premium tailored suit made with high-quality wool blend fabric.'
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
      views: 285,
      description: 'Elegant evening dress perfect for formal events and galas.'
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
      views: 190,
      description: 'Comfortable casual shirt for everyday wear.'
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
      views: 125,
      description: 'Formal dress suitable for business meetings and professional events.'
    }
  ];
  
  useEffect(() => {
    // Check if user is logged in
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        const userObj = JSON.parse(storedUser);
        setUser(userObj);
        
        // Only allow seller access to this page
        if (userObj.role !== 'seller') {
          router.push('/dashboard');
          return;
        }
      } else {
        // Redirect to login page if not authenticated
        router.push('/login?redirect=/dashboard/products');
        return;
      }
    } catch (err) {
      console.error('Error parsing user data:', err);
      router.push('/login?redirect=/dashboard/products');
      return;
    }
    
    // Get product data once we have ID
    if (id) {
      // In a real app, this would be an API call
      const foundProduct = mockProducts.find(p => p.id === parseInt(id));
      if (foundProduct) {
        setProduct(foundProduct);
        setFormData({
          name: foundProduct.name,
          price: foundProduct.price,
          stock: foundProduct.stock,
          threshold: foundProduct.threshold,
          sku: foundProduct.sku,
          category: foundProduct.category,
          description: foundProduct.description || ''
        });
        setLoading(false);
      } else if (id === 'new') {
        // Handle "new product" case
        setLoading(false);
      } else {
        setLoading(false);
      }
    }
  }, [id, router]);
  
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) : value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would call an API to update the product
    console.log('Saving product:', formData);
    
    // Show success message and redirect back to products list
    setTimeout(() => {
      router.push('/dashboard/products');
    }, 1000);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Handle 404 for non-existent product
  if (!loading && !product && id !== 'new') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-red-600 mb-2">Product Not Found</h1>
        <p className="text-gray-600 mb-6">The product you are trying to edit does not exist or has been removed.</p>
        <Link href="/dashboard/products" className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
          Back to Products
        </Link>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                Dashboard
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link href="/dashboard/products" className="text-gray-500 hover:text-gray-700">
                Products
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-900">{id === 'new' ? 'New Product' : 'Edit Product'}</span>
            </li>
          </ol>
        </nav>
        
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {id === 'new' ? 'Add New Product' : `Edit Product: ${product?.name}`}
            </h1>
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Product Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                    SKU
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="sku"
                      id="sku"
                      required
                      value={formData.sku}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="category"
                      id="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Price ($)
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      step="0.01"
                      name="price"
                      id="price"
                      required
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                    Stock Quantity
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="stock"
                      id="stock"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="threshold" className="block text-sm font-medium text-gray-700">
                    Low Stock Threshold
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="threshold"
                      id="threshold"
                      required
                      min="0"
                      value={formData.threshold}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-6">
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                    Product Image
                  </label>
                  <div className="mt-1 flex items-center">
                    {product && (
                      <div className="mr-4 h-16 w-16 overflow-hidden rounded border bg-gray-100">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Upload New Image
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Link
                  href="/dashboard/products"
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Product
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 