import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Cart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Mock cart items
  const mockCartItems = [
    {
      id: 1,
      productId: 1,
      name: 'Tailored Suit',
      price: 299.99,
      quantity: 1,
      image: 'https://via.placeholder.com/100x100',
      seller: 'Premium Tailors'
    },
    {
      id: 2,
      productId: 3,
      name: 'Casual Shirt',
      price: 59.99,
      quantity: 2,
      image: 'https://via.placeholder.com/100x100',
      seller: 'Urban Threads'
    }
  ];
  
  useEffect(() => {
    // In a real app, fetch cart items from API or localStorage
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!token || !storedUser) {
      router.push('/login?redirect=/cart');
      return;
    }
    
    try {
      const userObj = JSON.parse(storedUser);
      setUser(userObj);
      
      // For demo purposes, we're using mock data
      // In a real app, you would fetch the user's cart from an API
      setCartItems(mockCartItems);
      setLoading(false);
    } catch (err) {
      console.error('Error parsing user data:', err);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      router.push('/login?redirect=/cart');
    }
  }, [router]);
  
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(cartItems.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };
  
  const removeItem = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };
  
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const handleCheckout = () => {
    // In a real app, you would process the checkout here
    router.push('/checkout');
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>
        
        {cartItems.length > 0 ? (
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
            <div className="lg:col-span-8">
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <li key={item.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-center object-cover"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                <Link href={`/products/${item.productId}`} className="hover:underline">
                                  {item.name}
                                </Link>
                              </h3>
                              <p className="text-sm text-gray-500">Seller: {item.seller}</p>
                            </div>
                            <div className="text-lg font-medium text-gray-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center border border-gray-300 rounded">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                              >
                                -
                              </button>
                              <span className="px-3 py-1 border-l border-r border-gray-300">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-sm text-red-600 hover:text-red-500"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-8 lg:mt-0 lg:col-span-4">
              <div className="bg-white shadow overflow-hidden sm:rounded-md p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                <div className="flow-root">
                  <dl className="-my-4 text-sm">
                    <div className="py-4 flex items-center justify-between">
                      <dt className="text-gray-600">Subtotal</dt>
                      <dd className="font-medium text-gray-900">${calculateSubtotal().toFixed(2)}</dd>
                    </div>
                    <div className="py-4 flex items-center justify-between border-t border-gray-200">
                      <dt className="text-gray-600">Shipping</dt>
                      <dd className="font-medium text-gray-900">$10.00</dd>
                    </div>
                    <div className="py-4 flex items-center justify-between border-t border-gray-200">
                      <dt className="text-base font-medium text-gray-900">Order total</dt>
                      <dd className="text-base font-medium text-gray-900">${(calculateSubtotal() + 10).toFixed(2)}</dd>
                    </div>
                  </dl>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-blue-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Proceed to Checkout
                  </button>
                </div>
                <div className="mt-4">
                  <Link href="/products" className="text-sm text-blue-600 hover:text-blue-500 flex items-center justify-center">
                    <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h2 className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h2>
            <p className="mt-2 text-sm text-gray-500">Looks like you haven't added any items to your cart yet.</p>
            <div className="mt-6">
              <Link href="/products" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                Browse Products
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 