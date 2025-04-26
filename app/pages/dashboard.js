import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function BuyerDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();
  
  // Mock orders data
  const [orders, setOrders] = useState([
    { 
      id: 'ORD-001', 
      date: '2023-08-15', 
      status: 'Delivered', 
      seller: 'Premium Tailors', 
      total: 299.99,
      product: 'Tailored Suit',
      paymentMethod: 'Credit Card',
      deliveryAddress: '123 Main St, New York, NY 10001'
    },
    { 
      id: 'ORD-002', 
      date: '2023-08-10', 
      status: 'Processing', 
      seller: 'Fashion Studio', 
      total: 189.99,
      product: 'Evening Dress',
      paymentMethod: 'PayPal',
      deliveryAddress: '123 Main St, New York, NY 10001'
    },
    { 
      id: 'ORD-003', 
      date: '2023-07-25', 
      status: 'Cancelled', 
      seller: 'Premium Tailors', 
      total: 79.99,
      product: 'Business Shirt',
      paymentMethod: 'Credit Card',
      deliveryAddress: '123 Main St, New York, NY 10001'
    }
  ]);
  
  // Mock saved items
  const [savedItems, setSavedItems] = useState([
    { id: 3, name: 'Casual Shirt', price: 59.99, image: 'https://via.placeholder.com/100x100', seller: 'Urban Threads' },
    { id: 5, name: 'Summer Dress', price: 129.99, image: 'https://via.placeholder.com/100x100', seller: 'Summer Collections' }
  ]);
  
  // Check if user is logged in
  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!token || !storedUser) {
      // User is not logged in, redirect to login
      router.push('/login');
      return;
    }
    
    try {
      const userObj = JSON.parse(storedUser);
      
      // Check if this is a buyer account
      if (userObj.role !== 'buyer') {
        // Redirect seller to seller dashboard
        router.push('/admin');
        return;
      }
      
      setUser(userObj);
      setLoading(false);
    } catch (err) {
      console.error('Error parsing user data:', err);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      router.push('/login');
    }
  }, [router]);
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/">
            <a className="text-2xl font-bold text-gray-900">Tailors Platform</a>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/products">
              <a className="px-4 py-2 text-gray-700 font-medium hover:underline">Shop</a>
            </Link>
            <div className="relative">
              <button className="px-4 py-2 text-gray-700 font-medium hover:underline flex items-center">
                <span>Cart</span>
                <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  2
                </span>
              </button>
            </div>
            <div className="ml-3 relative">
              <div>
                <button 
                  className="max-w-xs flex items-center text-sm rounded-full text-white focus:outline-none"
                >
                  <span className="inline-flex h-8 w-8 rounded-full bg-gray-500 items-center justify-center">
                    <span className="text-sm font-medium leading-none text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </span>
                  <span className="ml-2 text-gray-700">{user.name}</span>
                </button>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Welcome back, {user.name}
            </h2>
          </div>
        </div>
        
        <div className="mt-8">
          <div className="flex border-b border-gray-200">
            <button
              className={`py-4 px-6 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('orders')}
            >
              My Orders
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm ${
                activeTab === 'saved'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('saved')}
            >
              Saved Items
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
          </div>
          
          <div className="mt-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Total Orders
                            </dt>
                            <dd>
                              <div className="text-lg font-medium text-gray-900">
                                {orders.length}
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                      <div className="text-sm">
                        <Link href="#">
                          <a className="font-medium text-blue-600 hover:text-blue-500">
                            View all
                          </a>
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Saved Items
                            </dt>
                            <dd>
                              <div className="text-lg font-medium text-gray-900">
                                {savedItems.length}
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                      <div className="text-sm">
                        <Link href="#">
                          <a className="font-medium text-blue-600 hover:text-blue-500">
                            View all
                          </a>
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Membership Since
                            </dt>
                            <dd>
                              <div className="text-lg font-medium text-gray-900">
                                August 2023
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                      <div className="text-sm">
                        <Link href="#">
                          <a className="font-medium text-blue-600 hover:text-blue-500">
                            View profile
                          </a>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                
                <h3 className="mt-10 text-lg font-medium text-gray-900">Recent Orders</h3>
                
                <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {orders.slice(0, 3).map(order => (
                      <li key={order.id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-blue-600 truncate">
                              {order.product}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                order.status === 'Delivered' 
                                  ? 'bg-green-100 text-green-800' 
                                  : order.status === 'Processing'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {order.status}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                {order.seller}
                              </p>
                              <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                ${order.total.toFixed(2)}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <p>
                                Order placed on {order.date}
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-6">
                  <Link href="/products">
                    <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      Browse More Products
                    </a>
                  </Link>
                </div>
              </div>
            )}
            
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900">Your Orders</h3>
                
                <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
                  {orders.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {orders.map(order => (
                        <li key={order.id}>
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-blue-600 truncate">
                                Order #{order.id}
                              </p>
                              <div className="ml-2 flex-shrink-0 flex">
                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  order.status === 'Delivered' 
                                    ? 'bg-green-100 text-green-800' 
                                    : order.status === 'Processing'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {order.status}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <p className="flex items-center text-sm text-gray-500">
                                  {order.product}
                                </p>
                                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                  Seller: {order.seller}
                                </p>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                <p>
                                  <span className="font-medium text-gray-900">${order.total.toFixed(2)}</span>
                                  {' '}&bull;{' '}
                                  {order.date}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2">
                              <Link href={`/orders/${order.id}`}>
                                <a className="text-sm font-medium text-blue-600 hover:text-blue-500">
                                  View Order Details
                                </a>
                              </Link>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        You haven't placed any orders yet.
                      </p>
                      <div className="mt-6">
                        <Link href="/products">
                          <a className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Browse Products
                          </a>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Saved Items Tab */}
            {activeTab === 'saved' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900">Saved Items</h3>
                
                <div className="mt-4">
                  {savedItems.length > 0 ? (
                    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {savedItems.map(item => (
                        <li key={item.id} className="col-span-1 bg-white rounded-lg shadow divide-y divide-gray-200">
                          <div className="w-full flex items-center justify-between p-6 space-x-6">
                            <div className="flex-1 truncate">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                              </div>
                              <p className="mt-1 text-sm text-gray-500 truncate">By {item.seller}</p>
                              <p className="mt-1 text-sm font-medium text-gray-900">${item.price}</p>
                            </div>
                            <img className="w-10 h-10 bg-gray-300 rounded-md flex-shrink-0" src={item.image} alt={item.name} />
                          </div>
                          <div>
                            <div className="-mt-px flex divide-x divide-gray-200">
                              <div className="w-0 flex-1 flex">
                                <Link href={`/products/${item.id}`}>
                                  <a className="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500">
                                    <span className="ml-3">View</span>
                                  </a>
                                </Link>
                              </div>
                              <div className="-ml-px w-0 flex-1 flex">
                                <button className="relative w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-red-700 font-medium border border-transparent rounded-br-lg hover:text-red-500">
                                  <span className="ml-3">Remove</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No saved items</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        You haven't saved any items yet.
                      </p>
                      <div className="mt-6">
                        <Link href="/products">
                          <a className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Browse Products
                          </a>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Your Profile
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Personal information and preferences.
                    </p>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Full name
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {user.name}
                        </dd>
                      </div>
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Email address
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {user.email}
                        </dd>
                      </div>
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Phone number
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {user.phone || 'Not provided'}
                        </dd>
                      </div>
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Account type
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          Buyer
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Link href="/profile/edit">
                    <a className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      Edit Profile
                    </a>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="mt-8 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Tailors Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 