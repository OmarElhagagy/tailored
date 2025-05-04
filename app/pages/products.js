import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Products() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Mock products data (with seller information)
  const productsData = [
    { 
      id: 1, 
      name: 'Tailored Suit', 
      price: 299.99, 
      image: 'https://via.placeholder.com/300x400', 
      seller: 'Premium Tailors', 
      sellerId: 'premium-tailors',
      category: "Men's Suits" 
    },
    { 
      id: 2, 
      name: 'Evening Dress', 
      price: 189.99, 
      image: 'https://via.placeholder.com/300x400', 
      seller: 'Fashion Studio', 
      sellerId: 'fashion-studio',
      category: "Women's Dresses" 
    },
    { 
      id: 3, 
      name: 'Casual Shirt', 
      price: 59.99, 
      image: 'https://via.placeholder.com/300x400', 
      seller: 'Urban Threads', 
      sellerId: 'urban-threads',
      category: "Men's Shirts" 
    },
    { 
      id: 4, 
      name: 'Designer Jacket', 
      price: 159.99, 
      image: 'https://via.placeholder.com/300x400', 
      seller: 'Elite Tailors', 
      sellerId: 'elite-tailors',
      category: "Outerwear" 
    },
    { 
      id: 7, 
      name: 'Wedding Dress', 
      price: 599.99, 
      image: 'https://via.placeholder.com/300x400', 
      seller: 'Bridal Elegance', 
      sellerId: 'bridal-elegance',
      category: "Wedding Attire" 
    },
    { 
      id: 9, 
      name: 'Business Suit', 
      price: 349.99, 
      image: 'https://via.placeholder.com/300x400', 
      seller: 'Premium Tailors', 
      sellerId: 'premium-tailors',
      category: "Men's Suits" 
    }
  ];
  
  useEffect(() => {
    // In a real app, fetch products from an API
    setProducts(productsData);
    setLoading(false);
  }, []);
  
  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    return [...new Set(productsData.map(p => p.category))];
  }, []);
  
  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter ? product.category === categoryFilter : true;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900">Browse Products</h1>
          <p className="mt-2 text-lg text-gray-500">
            Find custom-made clothing from our skilled tailors.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row">
            <div className="flex-1 min-w-0 mb-4 sm:mb-0 sm:mr-4">
              <label htmlFor="search" className="sr-only">Search products</label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="sm:w-64">
              <label htmlFor="category" className="sr-only">Filter by category</label>
              <select
                id="category"
                name="category"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map(product => (
            <div key={product.id} className="group relative">
              <div className="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-center object-cover"
                />
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm text-gray-700">
                    <Link href={`/sellers/${product.sellerId}/product/${product.id}`} legacyBehavior>
                      <a className="absolute inset-0">{product.name}</a>
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                  <p className="mt-1 text-sm text-blue-500">{product.seller}</p>
                </div>
                <p className="text-sm font-medium text-gray-900">${product.price}</p>
              </div>
              <div className="mt-2">
                <Link href={`/sellers/${product.sellerId}/product/${product.id}`} className="text-sm text-blue-600 hover:text-blue-800">
                  View details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 