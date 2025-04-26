import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [featuredProducts, setFeaturedProducts] = useState([
    { id: 1, name: 'Tailored Suit', price: 299.99, image: 'https://via.placeholder.com/200x250', seller: 'Premium Tailors' },
    { id: 2, name: 'Evening Dress', price: 189.99, image: 'https://via.placeholder.com/200x250', seller: 'Fashion Studio' },
    { id: 3, name: 'Casual Shirt', price: 59.99, image: 'https://via.placeholder.com/200x250', seller: 'Urban Threads' },
    { id: 4, name: 'Designer Jacket', price: 159.99, image: 'https://via.placeholder.com/200x250', seller: 'Elite Tailors' }
  ]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Connect with Skilled Tailors
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Find the perfect tailor for your needs, browse products, and get custom-tailored clothing.
            </p>
          </div>
          
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Products</h2>
            <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-4">
              {featuredProducts.map(product => (
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
                      <p className="mt-1 text-sm text-gray-500">By {product.seller}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">${product.price}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/products" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                View All Products
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 