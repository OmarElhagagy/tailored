'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/FormElements';

// Mock data
const MOCK_ORDERS = [
  {
    id: 'order-1',
    title: 'Custom Suit',
    seller: 'James Thompson',
    status: 'in_progress',
    dateCreated: '2023-05-15',
    price: '$349.99',
    deliveryEstimate: '2023-06-01'
  },
  {
    id: 'order-2',
    title: 'Wedding Dress Alterations',
    seller: 'Emma Davis',
    status: 'pending',
    dateCreated: '2023-05-20',
    price: '$175.00',
    deliveryEstimate: '2023-05-30'
  }
];

const MOCK_MESSAGES = [
  {
    id: 'msg-1',
    from: 'James Thompson',
    subject: 'Your Custom Suit Order',
    preview: 'Thank you for your order. I wanted to confirm a few measurements...',
    date: '2023-05-16',
    unread: false
  },
  {
    id: 'msg-2',
    from: 'Emma Davis',
    subject: 'Wedding Dress Appointment',
    preview: 'I'm available for an in-person fitting next Tuesday at 2pm. Does that work for you?',
    date: '2023-05-21',
    unread: true
  }
];

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userType, setUserType] = useState('customer');
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  
  // Check authentication and load user data
  useEffect(() => {
    // This would be an API call in a real app
    const checkAuth = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get token from local storage
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          // Redirect to login if not authenticated
          router.push('/login');
          return;
        }
        
        // For demo purposes, mock the user data
        setUserName('John Smith');
        setUserType('customer');
        
        setIsLoading(false);
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/login');
      }
    };
    
    checkAuth();
  }, [router]);
  
  // Format status for display
  const formatStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Pending Confirmation', color: 'bg-yellow-100 text-yellow-800' };
      case 'in_progress':
        return { label: 'In Progress', color: 'bg-blue-100 text-blue-800' };
      case 'shipped':
        return { label: 'Shipped', color: 'bg-purple-100 text-purple-800' };
      case 'delivered':
        return { label: 'Delivered', color: 'bg-green-100 text-green-800' };
      case 'completed':
        return { label: 'Completed', color: 'bg-green-100 text-green-800' };
      case 'cancelled':
        return { label: 'Cancelled', color: 'bg-red-100 text-red-800' };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back, {userName}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Here's an overview of your recent activity
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              {userType === 'seller' && (
                <Link href="/add-listing">
                  <Button variant="primary">
                    Add New Listing
                  </Button>
                </Link>
              )}
              <Link href="/profile">
                <Button variant="outline">
                  View Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Dashboard Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Recent Orders
                  </h2>
                  <Link
                    href="/orders"
                    className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    View All
                  </Link>
                </div>
              </div>
              
              {orders.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    You don't have any orders yet.
                  </p>
                  <Link href="/listings" className="mt-4 inline-block">
                    <Button variant="primary">
                      Browse Listings
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {orders.map((order) => {
                    const status = formatStatus(order.status);
                    return (
                      <div key={order.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                              {order.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Seller: {order.seller}
                            </p>
                          </div>
                          <div className="mt-2 md:mt-0">
                            <span className={`inline-flex text-xs px-2.5 py-0.5 rounded-full ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Order Date</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{order.dateCreated}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{order.price}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Estimated Delivery</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{order.deliveryEstimate}</p>
                          </div>
                          <div className="flex items-end">
                            <Link href={`/orders/${order.id}`}>
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          {/* Recent Messages */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Recent Messages
                  </h2>
                  <Link
                    href="/messages"
                    className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    View All
                  </Link>
                </div>
              </div>
              
              {messages.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    You don't have any messages yet.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {messages.map((message) => (
                    <Link 
                      key={message.id}
                      href={`/messages/${message.id}`}
                      className="block p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className={`text-base font-medium ${
                          message.unread 
                            ? 'text-gray-900 dark:text-white font-semibold' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {message.subject}
                          {message.unread && (
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              New
                            </span>
                          )}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {message.date}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        From: {message.from}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                        {message.preview}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mt-8">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Quick Actions
                </h2>
              </div>
              <div className="p-6 grid grid-cols-1 gap-4">
                <Link href="/listings">
                  <Button variant="outline" fullWidth>
                    Find Tailors
                  </Button>
                </Link>
                {userType === 'customer' && (
                  <Link href="/orders/new">
                    <Button variant="outline" fullWidth>
                      Place New Order
                    </Button>
                  </Link>
                )}
                {userType === 'seller' && (
                  <Link href="/inventory">
                    <Button variant="outline" fullWidth>
                      Manage Inventory
                    </Button>
                  </Link>
                )}
                <Link href="/settings">
                  <Button variant="outline" fullWidth>
                    Account Settings
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
