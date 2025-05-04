import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function DashboardSales() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('week');
  
  // Mock sales data
  const salesData = {
    weekly: [
      { date: 'Mon', revenue: 120 },
      { date: 'Tue', revenue: 180 },
      { date: 'Wed', revenue: 150 },
      { date: 'Thu', revenue: 220 },
      { date: 'Fri', revenue: 290 },
      { date: 'Sat', revenue: 350 },
      { date: 'Sun', revenue: 210 }
    ],
    monthly: [
      { date: 'Week 1', revenue: 1200 },
      { date: 'Week 2', revenue: 1450 },
      { date: 'Week 3', revenue: 1320 },
      { date: 'Week 4', revenue: 1680 }
    ],
    yearly: [
      { date: 'Jan', revenue: 4500 },
      { date: 'Feb', revenue: 5200 },
      { date: 'Mar', revenue: 6100 },
      { date: 'Apr', revenue: 5800 },
      { date: 'May', revenue: 6400 },
      { date: 'Jun', revenue: 7200 },
      { date: 'Jul', revenue: 6800 },
      { date: 'Aug', revenue: 7500 },
      { date: 'Sep', revenue: 8100 },
      { date: 'Oct', revenue: 7900 },
      { date: 'Nov', revenue: 8300 },
      { date: 'Dec', revenue: 9500 }
    ]
  };
  
  // Mock top products
  const topProducts = [
    { id: 1, name: 'Tailored Suit', sold: 24, revenue: 7199.76 },
    { id: 2, name: 'Evening Dress', sold: 18, revenue: 3419.82 },
    { id: 3, name: 'Casual Shirt', sold: 42, revenue: 2519.58 },
    { id: 4, name: 'Formal Dress', sold: 12, revenue: 2999.88 },
    { id: 5, name: 'Winter Jacket', sold: 16, revenue: 2879.84 }
  ];
  
  useEffect(() => {
    // Check if user is logged in
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        const userObj = JSON.parse(storedUser);
        setUser(userObj);
        
        // Only allow seller access to this page
        if (userObj.role !== 'seller') {
          router.push('/dashboard');
        }
        
        setLoading(false);
      } else {
        // Redirect to login page if not authenticated
        router.push('/login?redirect=/dashboard/sales');
      }
    } catch (err) {
      console.error('Error parsing user data:', err);
      router.push('/login?redirect=/dashboard/sales');
    }
  }, [router]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Calculate total revenue and orders
  const getTotalRevenue = () => {
    let total = 0;
    if (timeframe === 'week') {
      salesData.weekly.forEach(day => total += day.revenue);
    } else if (timeframe === 'month') {
      salesData.monthly.forEach(week => total += week.revenue);
    } else {
      salesData.yearly.forEach(month => total += month.revenue);
    }
    return total;
  };
  
  const getTotalOrders = () => {
    let count = 0;
    topProducts.forEach(product => count += product.sold);
    return count;
  };
  
  const activeData = timeframe === 'week' ? salesData.weekly : 
                     timeframe === 'month' ? salesData.monthly : 
                     salesData.yearly;
  
  const maxRevenue = Math.max(...activeData.map(item => item.revenue));
  
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Sales Dashboard
            </h1>
          </div>
          
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <div>
              <label htmlFor="timeframe" className="sr-only">Time Period</label>
              <select
                id="timeframe"
                name="timeframe"
                className="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* Revenue Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Revenue
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                ${getTotalRevenue().toLocaleString()}
              </dd>
              <div className="mt-2 flex items-center text-sm text-green-600">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span>12.5% from last {timeframe}</span>
              </div>
            </div>
          </div>
          
          {/* Orders Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Orders
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {getTotalOrders()}
              </dd>
              <div className="mt-2 flex items-center text-sm text-green-600">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span>8.2% from last {timeframe}</span>
              </div>
            </div>
          </div>
          
          {/* Average Order Value Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Average Order Value
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                ${(getTotalRevenue() / getTotalOrders()).toFixed(2)}
              </dd>
              <div className="mt-2 flex items-center text-sm text-green-600">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span>3.4% from last {timeframe}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Revenue Chart */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 mb-8">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Revenue Overview</h3>
          <div className="relative h-60">
            <div className="absolute inset-0 flex items-end">
              {activeData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="bg-blue-500 rounded-t w-full max-w-[40px] mx-auto" 
                    style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                  ></div>
                  <div className="mt-2 text-xs text-gray-500">{item.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Top Products */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Top Selling Products
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sold
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.sold} units
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${product.revenue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/dashboard/products/${product.id}`} className="text-blue-600 hover:text-blue-900">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
} 