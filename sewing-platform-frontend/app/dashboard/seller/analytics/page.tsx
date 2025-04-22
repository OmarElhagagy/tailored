'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// Mock component for chart - in a real implementation, you would use a library like Chart.js or Recharts
const SalesChart = ({ data }: { data: any[] }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Monthly Sales</h3>
      <div className="h-64 bg-gray-100 rounded flex items-end justify-between p-4">
        {data.map((month, i) => (
          <div key={i} className="flex flex-col items-center">
            <div 
              className="w-8 bg-blue-500 rounded-t" 
              style={{ height: `${Math.max((month.sales / 1000) * 50, 10)}px` }}
            ></div>
            <span className="text-xs mt-1">{month._id.split('-')[1]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function SellerAnalytics() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState<any>(null);
  const [popularListings, setPopularListings] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          router.push('/login');
          return;
        }
        
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/seller/summary`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setSummary(response.data.data.summary);
        setPopularListings(response.data.data.popularListings);
        setMonthlyData(response.data.data.monthlyData);
        
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load analytics data');
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Seller Dashboard</h1>
      
      {/* Dashboard Navigation */}
      <div className="mb-8 border-b">
        <nav className="flex space-x-8">
          <button
            className={`pb-4 px-1 ${activeTab === 'overview' ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`pb-4 px-1 ${activeTab === 'sales' ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('sales')}
          >
            Sales Analytics
          </button>
          <button
            className={`pb-4 px-1 ${activeTab === 'customers' ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('customers')}
          >
            Customer Insights
          </button>
          <button
            className={`pb-4 px-1 ${activeTab === 'inventory' ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('inventory')}
          >
            Inventory Performance
          </button>
        </nav>
      </div>
      
      {activeTab === 'overview' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm font-medium mb-1">Total Sales</h3>
              <div className="flex items-center">
                <span className="text-2xl font-bold">${summary?.totalSales.toFixed(2) || '0.00'}</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm font-medium mb-1">Total Orders</h3>
              <div className="flex items-center">
                <span className="text-2xl font-bold">{summary?.orderCount || 0}</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm font-medium mb-1">Average Rating</h3>
              <div className="flex items-center">
                <span className="text-2xl font-bold">{summary?.averageRating.toFixed(1) || '0.0'}</span>
                <div className="ml-2 flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className={`w-4 h-4 ${star <= Math.round(summary?.averageRating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-1 text-sm text-gray-500">({summary?.reviewCount || 0})</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm font-medium mb-1">Conversion Rate</h3>
              <div className="flex items-center">
                <span className="text-2xl font-bold">
                  {summary?.orderCount && summary?.pageViews 
                    ? ((summary.orderCount / summary.pageViews) * 100).toFixed(1) 
                    : '0.0'}%
                </span>
              </div>
            </div>
          </div>
          
          {/* Charts and Popular Listings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SalesChart data={monthlyData || []} />
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold mb-4">Popular Listings</h3>
              
              {popularListings.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {popularListings.map((listing) => (
                    <li key={listing.listingId} className="py-3">
                      <Link href={`/listings/${listing.listingId}`} className="flex items-center">
                        <div className="h-10 w-10 relative mr-3">
                          <Image
                            src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${listing.mainPhoto}`}
                            alt={listing.title}
                            fill
                            className="rounded object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{listing.title}</p>
                          <p className="text-sm text-gray-500">{listing.totalOrders} orders</p>
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          ${listing.totalRevenue.toFixed(2)}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-4">No orders yet</p>
              )}
              
              <div className="mt-4">
                <Link href="/listings" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  View all listings →
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
      
      {activeTab === 'sales' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Sales Analytics</h2>
          <p className="text-gray-500">Visit the Sales Analytics tab for detailed reports.</p>
          
          {/* Here you would implement the sales analytics components */}
          <div className="mt-4">
            <Link 
              href="/dashboard/seller/sales" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Detailed Sales Report
            </Link>
          </div>
        </div>
      )}
      
      {activeTab === 'customers' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Customer Insights</h2>
          <p className="text-gray-500">View customer demographics and behavior data.</p>
          
          {/* Here you would implement the customer insights components */}
          <div className="mt-4">
            <Link 
              href="/dashboard/seller/customers" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              View Customer Details
            </Link>
          </div>
        </div>
      )}
      
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Inventory Management</h2>
          <p className="text-gray-500">Monitor your inventory performance and stock levels.</p>
          
          {/* Here you would implement the inventory performance components */}
          <div className="mt-4">
            <Link 
              href="/inventory" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Manage Inventory
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 