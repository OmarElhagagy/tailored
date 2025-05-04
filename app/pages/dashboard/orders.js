import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function DashboardOrders() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterOrderStatus, setFilterOrderStatus] = useState('all');

  // Mock orders data 
  const orders = [
    {
      id: 'ORD-1234',
      date: '2023-06-15',
      status: 'Delivered',
      product: 'Tailored Suit',
      customer: 'John Smith',
      seller: 'Premium Tailors',
      total: 299.99,
      paymentMethod: 'Credit Card',
      shippingAddress: '123 Main St, New York, NY',
      items: [
        { id: 1, name: 'Tailored Suit', quantity: 1, price: 299.99 }
      ]
    },
    {
      id: 'ORD-1235',
      date: '2023-06-10',
      status: 'Processing',
      product: 'Evening Dress',
      customer: 'Sarah Johnson',
      seller: 'Fashion Studio',
      total: 189.99,
      paymentMethod: 'PayPal',
      shippingAddress: '456 Park Ave, Boston, MA',
      items: [
        { id: 2, name: 'Evening Dress', quantity: 1, price: 189.99 }
      ]
    },
    {
      id: 'ORD-1236',
      date: '2023-05-28',
      status: 'Delivered',
      product: 'Casual Shirt (x2)',
      customer: 'Mike Williams',
      seller: 'Urban Threads',
      total: 119.98,
      paymentMethod: 'Credit Card',
      shippingAddress: '789 Broadway, Chicago, IL',
      items: [
        { id: 3, name: 'Casual Shirt', quantity: 2, price: 59.99 }
      ]
    },
    {
      id: 'ORD-1237',
      date: '2023-06-18',
      status: 'Pending',
      product: 'Formal Dress',
      customer: 'Emily Davis',
      seller: 'Premium Tailors',
      total: 249.99,
      paymentMethod: 'Credit Card',
      shippingAddress: '321 Oak St, San Francisco, CA',
      items: [
        { id: 4, name: 'Formal Dress', quantity: 1, price: 249.99 }
      ]
    },
    {
      id: 'ORD-1238',
      date: '2023-06-17',
      status: 'Cancelled',
      product: 'Winter Jacket',
      customer: 'Alex Thompson',
      seller: 'Premium Tailors',
      total: 179.99,
      paymentMethod: 'PayPal',
      shippingAddress: '654 Pine St, Miami, FL',
      items: [
        { id: 5, name: 'Winter Jacket', quantity: 1, price: 179.99 }
      ]
    }
  ];

  // Get orders filtered by status
  const getOrdersByStatus = (status) => {
    if (status === 'all') return orders;
    return orders.filter(order => order.status.toLowerCase() === status.toLowerCase());
  };

  useEffect(() => {
    // Check if user is logged in
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        const userObj = JSON.parse(storedUser);
        setUser(userObj);
        setLoading(false);
      } else {
        // Redirect to login page if not authenticated
        router.push('/login?redirect=/dashboard/orders');
      }
    } catch (err) {
      console.error('Error parsing user data:', err);
      router.push('/login?redirect=/dashboard/orders');
    }
  }, [router]);
  
  // Handler for updating order status
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    // In a real app, this would make an API call
    console.log(`Updating order ${orderId} to status: ${newStatus}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const filteredOrders = getOrdersByStatus(filterOrderStatus);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {user?.role === 'seller' ? 'Manage Orders' : 'My Orders'}
            </h1>
          </div>

          <div className="mt-4 flex md:mt-0 md:ml-4">
            <div>
              <label htmlFor="status" className="sr-only">Filter by Status</label>
              <select
                id="status"
                name="status"
                className="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filterOrderStatus}
                onChange={(e) => setFilterOrderStatus(e.target.value)}
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {filteredOrders.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {user?.role === 'seller' ? 'Customer' : 'Seller'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user?.role === 'seller' ? order.customer : order.seller}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                          order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a href="#" className="text-blue-600 hover:text-blue-900 mr-3" onClick={() => router.push(`/dashboard/orders/${order.id}`)}>
                        View
                      </a>
                      {user?.role === 'seller' && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                        <div className="inline-block relative text-left">
                          <select
                            className="text-sm text-blue-600 border-none bg-transparent cursor-pointer"
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleUpdateOrderStatus(order.id, e.target.value);
                              }
                            }}
                          >
                            <option value="">Update Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No orders found matching the selected filter.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 