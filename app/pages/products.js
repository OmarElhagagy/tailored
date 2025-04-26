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
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/">
            <a className="text-2xl font-bold text-gray-900">Tailors Platform</a>
          </Link>
          <div className="flex space-x-4">
            <Link href="/products">
              <a className="px-4 py-2 text-gray-700 font-medium hover:underline">Products</a>
            </Link>
            <Link href="/sellers">
              <a className="px-4 py-2 text-gray-700 font-medium hover:underline">Find Tailors</a>
            </Link>
            <Link href="/login">
              <a className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">Sign In</a>
            </Link>
            <Link href="/register">
              <a className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700">Register</a>
            </Link>
          </div>
        </div>
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
      </header>
      
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
                        <Link href={`/products/${product.id}`}>
                          <a>
                            <span aria-hidden="true" className="absolute inset-0" />
                            {product.name}
                          </a>
                        </Link>
                      </h3>
                      <Link href={`/sellers/${product.seller.replace(' ', '-').toLowerCase()}`}>
                        <a className="mt-1 text-sm text-blue-500 hover:underline">By {product.seller}</a>
                      </Link>
                    </div>
                    <p className="text-sm font-medium text-gray-900">${product.price}</p>
                  </div>
                  <div className="mt-2">
                    <Link href={`/products/${product.id}`}>
                      <a className="text-sm text-blue-600 hover:text-blue-800">View details</a>
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
      
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="md:flex md:justify-between">
            <div className="mb-8 md:mb-0">
              <h3 className="text-xl font-bold">Tailors Platform</h3>
              <p className="mt-2 text-gray-400">Connecting tailors and clients seamlessly.</p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Support</h3>
                <ul className="mt-4 space-y-2">
                  <li><a href="#" className="text-gray-300 hover:text-white">Help Center</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white">Contact Us</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Legal</h3>
                <ul className="mt-4 space-y-2">
                  <li><a href="#" className="text-gray-300 hover:text-white">Privacy Policy</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white">Terms of Service</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Tailors Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 