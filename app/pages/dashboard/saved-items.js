import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SavedItems() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedItems, setSavedItems] = useState([]);

  // Mock saved items data - in a real app, this would come from API
  const mockSavedItems = [
    {
      id: 1,
      name: 'Tailored Suit',
      price: 299.99,
      image: 'https://via.placeholder.com/150',
      seller: 'Premium Tailors',
      sellerId: 'premium-tailors'
    },
    {
      id: 2,
      name: 'Evening Dress',
      price: 189.99,
      image: 'https://via.placeholder.com/150',
      seller: 'Fashion Studio',
      sellerId: 'fashion-studio'
    },
    {
      id: 3,
      name: 'Casual Shirt',
      price: 59.99,
      image: 'https://via.placeholder.com/150',
      seller: 'Urban Threads',
      sellerId: 'urban-threads'
    },
    {
      id: 4,
      name: 'Formal Dress',
      price: 249.99,
      image: 'https://via.placeholder.com/150',
      seller: 'Premium Tailors',
      sellerId: 'premium-tailors'
    },
    {
      id: 5,
      name: 'Designer Pants',
      price: 129.99,
      image: 'https://via.placeholder.com/150',
      seller: 'Elite Tailors',
      sellerId: 'elite-tailors'
    },
    {
      id: 6,
      name: 'Winter Coat',
      price: 249.99,
      image: 'https://via.placeholder.com/150',
      seller: 'Seasonal Wear',
      sellerId: 'seasonal-wear'
    }
  ];

  useEffect(() => {
    // Check if user is logged in
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
        setSavedItems(mockSavedItems); // In a real app, fetch from API
        setLoading(false);
      } else {
        // Redirect to login page if not authenticated
        router.push('/login?redirect=/dashboard/saved-items');
      }
    } catch (err) {
      console.error('Error parsing user data:', err);
      router.push('/login?redirect=/dashboard/saved-items');
    }
  }, [router]);

  // Handle navigation with hard redirects
  const handleNavigation = (path) => {
    // Use window.location.href for a full page reload/navigation
    window.location.href = path;
  };

  const handleRemoveItem = (itemId) => {
    setSavedItems(savedItems.filter(item => item.id !== itemId));
    // In a real app, you would make an API call to remove from the database
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Saved Items</h1>
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              handleNavigation('/dashboard');
            }}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Back to Dashboard
          </a>
        </div>

        {savedItems.length > 0 ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Your Saved Items ({savedItems.length})
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Items you've saved for later consideration
              </p>
            </div>

            <ul className="divide-y divide-gray-200">
              {savedItems.map((item) => (
                <li key={item.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <img 
                        className="h-16 w-16 rounded object-cover" 
                        src={item.image} 
                        alt={item.name} 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.seller}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavigation(`/products/${item.id}`);
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        View
                      </a>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No saved items</h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't saved any items yet.
            </p>
            <div className="mt-6">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation('/products');
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Browse Products
              </a>
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-6 grid-cols-1 md:grid-cols-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recently Viewed</h3>
            {mockSavedItems.slice(0, 3).map((item) => (
              <div key={`recent-${item.id}`} className="flex items-center py-2 border-t border-gray-200">
                <div className="flex-shrink-0">
                  <img 
                    className="h-10 w-10 rounded object-cover" 
                    src={item.image} 
                    alt={item.name} 
                  />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                </div>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation(`/products/${item.id}`);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  View
                </a>
              </div>
            ))}
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recommended For You</h3>
            {mockSavedItems.slice(3, 6).map((item) => (
              <div key={`recommended-${item.id}`} className="flex items-center py-2 border-t border-gray-200">
                <div className="flex-shrink-0">
                  <img 
                    className="h-10 w-10 rounded object-cover" 
                    src={item.image} 
                    alt={item.name} 
                  />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                </div>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation(`/products/${item.id}`);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 