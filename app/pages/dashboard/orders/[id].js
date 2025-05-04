import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function OrderDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState('');
  
  // Mock orders data
  const ordersData = [
    {
      id: 'ORD-1234',
      date: '2023-06-15',
      status: 'Delivered',
      product: 'Tailored Suit',
      customer: 'John Smith',
      customerEmail: 'john.smith@example.com',
      customerPhone: '+1 555-123-4567',
      seller: 'Premium Tailors',
      total: 299.99,
      paymentMethod: 'Credit Card',
      paymentId: 'PAY-9876543',
      shippingAddress: '123 Main St, New York, NY',
      items: [
        { id: 1, name: 'Tailored Suit', quantity: 1, price: 299.99 }
      ],
      timeline: [
        { date: '2023-06-10', status: 'Order Placed', note: 'Order #ORD-1234 was placed' },
        { date: '2023-06-11', status: 'Processing', note: 'Payment confirmed and order processed' },
        { date: '2023-06-12', status: 'In Production', note: 'Started working on the custom suit' },
        { date: '2023-06-14', status: 'Shipped', note: 'Order shipped via Express Delivery (Tracking: TRK12345)' },
        { date: '2023-06-15', status: 'Delivered', note: 'Order delivered and signed for by J. Smith' }
      ]
    },
    {
      id: 'ORD-1235',
      date: '2023-06-10',
      status: 'Processing',
      product: 'Evening Dress',
      customer: 'Sarah Johnson',
      customerEmail: 'sarah.j@example.com',
      customerPhone: '+1 555-987-6543',
      seller: 'Fashion Studio',
      total: 189.99,
      paymentMethod: 'PayPal',
      paymentId: 'PAY-1234567',
      shippingAddress: '456 Park Ave, Boston, MA',
      items: [
        { id: 2, name: 'Evening Dress', quantity: 1, price: 189.99 }
      ],
      timeline: [
        { date: '2023-06-10', status: 'Order Placed', note: 'Order #ORD-1235 was placed' },
        { date: '2023-06-10', status: 'Processing', note: 'Payment confirmed via PayPal' }
      ]
    },
    {
      id: 'ORD-1236',
      date: '2023-05-28',
      status: 'Delivered',
      product: 'Casual Shirt (x2)',
      customer: 'Mike Williams',
      customerEmail: 'mike.w@example.com',
      customerPhone: '+1 555-234-5678',
      seller: 'Urban Threads',
      total: 119.98,
      paymentMethod: 'Credit Card',
      paymentId: 'PAY-7654321',
      shippingAddress: '789 Broadway, Chicago, IL',
      items: [
        { id: 3, name: 'Casual Shirt', quantity: 2, price: 59.99 }
      ],
      timeline: [
        { date: '2023-05-28', status: 'Order Placed', note: 'Order #ORD-1236 was placed' },
        { date: '2023-05-29', status: 'Processing', note: 'Payment confirmed and order processed' },
        { date: '2023-05-30', status: 'Shipped', note: 'Order shipped via Standard Delivery (Tracking: TRK98765)' },
        { date: '2023-06-03', status: 'Delivered', note: 'Order delivered and signed for by M. Williams' }
      ]
    },
    {
      id: 'ORD-1237',
      date: '2023-06-18',
      status: 'Pending',
      product: 'Formal Dress',
      customer: 'Emily Davis',
      customerEmail: 'emily.d@example.com',
      customerPhone: '+1 555-876-5432',
      seller: 'Premium Tailors',
      total: 249.99,
      paymentMethod: 'Credit Card',
      paymentId: 'PAY-5432167',
      shippingAddress: '321 Oak St, San Francisco, CA',
      items: [
        { id: 4, name: 'Formal Dress', quantity: 1, price: 249.99 }
      ],
      timeline: [
        { date: '2023-06-18', status: 'Order Placed', note: 'Order #ORD-1237 was placed' },
        { date: '2023-06-18', status: 'Pending', note: 'Awaiting payment confirmation' }
      ]
    },
    {
      id: 'ORD-1238',
      date: '2023-06-17',
      status: 'Cancelled',
      product: 'Winter Jacket',
      customer: 'Alex Thompson',
      customerEmail: 'alex.t@example.com',
      customerPhone: '+1 555-345-6789',
      seller: 'Premium Tailors',
      total: 179.99,
      paymentMethod: 'PayPal',
      paymentId: 'PAY-3456789',
      shippingAddress: '654 Pine St, Miami, FL',
      items: [
        { id: 5, name: 'Winter Jacket', quantity: 1, price: 179.99 }
      ],
      timeline: [
        { date: '2023-06-17', status: 'Order Placed', note: 'Order #ORD-1238 was placed' },
        { date: '2023-06-17', status: 'Processing', note: 'Payment confirmed via PayPal' },
        { date: '2023-06-18', status: 'Cancelled', note: 'Order cancelled by customer. Reason: Changed mind about the style.' }
      ]
    }
  ];
  
  useEffect(() => {
    // Check if user is logged in
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        const userObj = JSON.parse(storedUser);
        setUser(userObj);
      } else {
        // Redirect to login page if not authenticated
        router.push('/login?redirect=/dashboard/orders');
        return;
      }
    } catch (err) {
      console.error('Error parsing user data:', err);
      router.push('/login?redirect=/dashboard/orders');
      return;
    }
    
    // Get order data once we have ID
    if (id) {
      // In a real app, this would be an API call
      const foundOrder = ordersData.find(o => o.id === id);
      if (foundOrder) {
        setOrder(foundOrder);
        setOrderStatus(foundOrder.status);
        setLoading(false);
      } else {
        setLoading(false);
      }
    }
  }, [id, router]);
  
  const handleUpdateStatus = () => {
    if (!orderStatus || orderStatus === order.status) return;
    
    // In a real app, this would be an API call to update the order status
    console.log(`Updating order ${order.id} status from ${order.status} to ${orderStatus}`);
    
    // For demo purposes, just update the local state
    const updatedOrder = {
      ...order,
      status: orderStatus,
      timeline: [
        ...order.timeline,
        {
          date: new Date().toISOString().split('T')[0],
          status: orderStatus,
          note: `Status updated to ${orderStatus}`
        }
      ]
    };
    
    setOrder(updatedOrder);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Handle 404 for non-existent order
  if (!loading && !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-red-600 mb-2">Order Not Found</h1>
        <p className="text-gray-600 mb-6">The order you are looking for does not exist or has been removed.</p>
        <Link href="/dashboard/orders" className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
          Back to Orders
        </Link>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                Dashboard
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link href="/dashboard/orders" className="text-gray-500 hover:text-gray-700">
                Orders
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-900">{order.id}</span>
            </li>
          </ol>
        </nav>
        
        <div className="mb-6 md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Order Details: {order.id}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Placed on {order.date}
            </p>
          </div>
          
          {/* Status Update section - only for sellers */}
          {user?.role === 'seller' && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center md:mt-0 md:ml-4">
              <div className="flex items-center">
                <select
                  className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm mr-2"
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="In Production">In Production</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={!orderStatus || orderStatus === order.status}
                  className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    !orderStatus || orderStatus === order.status 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                >
                  Update Status
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 flex justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Order Summary</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Order details and status information.</p>
            </div>
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
              ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                order.status === 'Processing' || order.status === 'In Production' ? 'bg-blue-100 text-blue-800' :
                order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                'bg-red-100 text-red-800'}`}>
              {order.status}
            </span>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Customer</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{order.customer}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Contact</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {order.customerEmail} • {order.customerPhone}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Shipping Address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{order.shippingAddress}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {order.paymentMethod} (ID: {order.paymentId})
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900 sm:mt-0 sm:col-span-2">${order.total.toFixed(2)}</dd>
              </div>
            </dl>
          </div>
        </div>
        
        {/* Order Items */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Order Items</h3>
          </div>
          <div className="border-t border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${item.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${(item.quantity * item.price).toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td colSpan="3" className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                    Total:
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${order.total.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Order Timeline */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Order Timeline</h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {order.timeline.map((event, idx) => (
                <li key={idx} className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center
                        ${event.status === 'Delivered' ? 'bg-green-100' : 
                          event.status === 'Processing' || event.status === 'In Production' ? 'bg-blue-100' :
                          event.status === 'Pending' ? 'bg-yellow-100' :
                          event.status === 'Shipped' ? 'bg-purple-100' :
                          event.status === 'Cancelled' ? 'bg-red-100' : 'bg-gray-100'}`}>
                        <svg className={`h-5 w-5
                          ${event.status === 'Delivered' ? 'text-green-600' : 
                            event.status === 'Processing' || event.status === 'In Production' ? 'text-blue-600' :
                            event.status === 'Pending' ? 'text-yellow-600' :
                            event.status === 'Shipped' ? 'text-purple-600' :
                            event.status === 'Cancelled' ? 'text-red-600' : 'text-gray-600'}`} 
                          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          {event.status === 'Delivered' ? (
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          ) : event.status === 'Cancelled' ? (
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          )}
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{event.status}</p>
                        <p className="text-sm text-gray-500">{event.note}</p>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className="text-sm text-gray-500">{event.date}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mt-6">
          <Link href="/dashboard/orders" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            ← Back to Orders
          </Link>
        </div>
      </main>
    </div>
  );
} 