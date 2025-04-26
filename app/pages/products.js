import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Products() {
  const [products, setProducts] = useState([
    { id: 1, name: 'Tailored Suit', price: 299.99, image: 'https://via.placeholder.com/300x400', seller: 'Premium Tailors', category: "Men's Suits" },
    { id: 2, name: 'Evening Dress', price: 189.99, image: 'https://via.placeholder.com/300x400', seller: 'Fashion Studio', category: "Women's Dresses" },
    { id: 3, name: 'Casual Shirt', price: 59.99, image: 'https://via.placeholder.com/300x400', seller: 'Urban Threads', category: "Men's Shirts" },
    { id: 4, name: 'Designer Jacket', price: 159.99, image: 'https://via.placeholder.com/300x400', seller: 'Elite Tailors', category: "Outerwear" },
    { id: 5, name: 'Summer Dress', price: 129.99, image: 'https://via.placeholder.com/300x400', seller: 'Summer Collections', category: "Women's Dresses" },
    { id: 6, name: 'Business Shirt', price: 79.99, image: 'https://via.placeholder.com/300x400', seller: 'Corporate Wear', category: "Men's Shirts" },
    { id: 7, name: 'Wedding Dress', price: 599.99, image: 'https://via.placeholder.com/300x400', seller: 'Bridal Elegance', category: "Wedding Attire" },
    { id: 8, name: 'Winter Coat', price: 249.99, image: 'https://via.placeholder.com/300x400', seller: 'Seasonal Wear', category: "Outerwear" },
  ]);
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const categories = [...new Set(products.map(product => product.category))];
  
  const filteredProducts = products.filter(product => {
    if (selectedCategory && product.category !== selectedCategory) return false;
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-center">
          <div className="w-full max-w-lg">
            <div className="flex">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                className="rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-4 text-gray-600 hover:bg-gray-100"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/4 pr-8">
            <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <button
                  className={`${!selectedCategory ? 'font-medium text-blue-600' : 'text-gray-600'}`}
                  onClick={() => setSelectedCategory('')}
                >
                  All Categories
                </button>
              </div>
              {categories.map(category => (
                <div key={category} className="flex items-center">
                  <button
                    className={`${selectedCategory === category ? 'font-medium text-blue-600' : 'text-gray-600'}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="md:w-3/4 mt-6 md:mt-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategory || 'All Products'}
              </h2>
              <span className="text-gray-500">Showing {filteredProducts.length} results</span>
            </div>
            
            <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3">
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
                        <Link href={`/products/${product.id}`} className="absolute inset-0">
                          {product.name}
                        </Link>
                      </h3>
                      <Link href={`/sellers/${product.seller.replace(' ', '-').toLowerCase()}`} className="mt-1 text-sm text-blue-500 hover:underline">
                        By {product.seller}
                      </Link>
                    </div>
                    <p className="text-sm font-medium text-gray-900">${product.price}</p>
                  </div>
                  <div className="mt-2">
                    <Link href={`/products/${product.id}`} className="text-sm text-blue-600 hover:text-blue-800">
                      View details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 