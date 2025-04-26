import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function OrderConfirmation() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Mock order details
  const orderDetails = {
    orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    date: new Date().toISOString().split('T')[0],
    items: [
      {
        id: 1,
        name: 'Tailored Suit',
        price: 299.99,
        quantity: 1,
        image: 'https://via.placeholder.com/100x100',
        seller: 'Premium Tailors'
      },
      {
        id: 2,
        name: 'Casual Shirt',
        price: 59.99,
        quantity: 2,
        image: 'https://via.placeholder.com/100x100',
        seller: 'Urban Threads'
      }
    ],
    subtotal: 419.97,
    shipping: 10.00,
    tax: 41.99,
    total: 471.96,
    shippingAddress: {
      name: 'John Doe',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States'
    },
    paymentMethod: 'Credit Card',
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };
  
  useEffect(() => {
    // In a real app, check if user is logged in and get order details from the API
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!token || !storedUser) {
      router.push('/login');
      return;
    }
    
    try {
      const userObj = JSON.parse(storedUser);
      setUser(userObj);
      setLoading(false);
    } catch (err) {
      console.error('Error parsing user data:', err);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      router.push('/login');
    }
  }, [router]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Thank you for your order!</h1>
          <p className="mt-2 text-lg text-gray-600">
            Your order has been placed successfully. We have sent a confirmation to your email.
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
            <div className="mt-2 flex justify-between text-sm text-gray-500">
              <p>Order ID: {orderDetails.orderId}</p>
              <p>Order Date: {orderDetails.date}</p>
            </div>
          </div>
          
          <div className="px-6 py-4">
            <h3 className="text-base font-medium text-gray-900 mb-4">Items</h3>
            <ul className="divide-y divide-gray-200">
              {orderDetails.items.map((item) => (
                <li key={item.id} className="py-4 flex">
                  <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-center object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-1 flex flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h4>{item.name}</h4>
                        <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{item.seller}</p>
                    </div>
                    <div className="flex-1 flex items-end justify-between text-sm">
                      <p className="text-gray-500">Qty {item.quantity}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-between text-sm mb-2">
              <p className="text-gray-600">Subtotal</p>
              <p className="font-medium text-gray-900">${orderDetails.subtotal.toFixed(2)}</p>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <p className="text-gray-600">Shipping</p>
              <p className="font-medium text-gray-900">${orderDetails.shipping.toFixed(2)}</p>
            </div>
            <div className="flex justify-between text-sm mb-4">
              <p className="text-gray-600">Tax</p>
              <p className="font-medium text-gray-900">${orderDetails.tax.toFixed(2)}</p>
            </div>
            <div className="flex justify-between text-base font-medium text-gray-900 border-t border-gray-200 pt-4">
              <p>Total</p>
              <p>${orderDetails.total.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 border-t border-gray-200">
            <div className="border-r border-gray-200 px-6 py-4">
              <h3 className="text-base font-medium text-gray-900 mb-2">Shipping Information</h3>
              <address className="not-italic text-sm text-gray-500">
                <p>{orderDetails.shippingAddress.name}</p>
                <p>{orderDetails.shippingAddress.address}</p>
                <p>{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.zipCode}</p>
                <p>{orderDetails.shippingAddress.country}</p>
              </address>
              <p className="mt-2 text-sm text-gray-500">
                <span className="font-medium">Estimated Delivery:</span> {orderDetails.estimatedDelivery}
              </p>
            </div>
            
            <div className="px-6 py-4">
              <h3 className="text-base font-medium text-gray-900 mb-2">Payment Information</h3>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Payment Method:</span> {orderDetails.paymentMethod}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                <span className="font-medium">Billing Address:</span> Same as shipping address
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            View Order History
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    </div>
  );
} 