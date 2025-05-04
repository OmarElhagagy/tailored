import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [sellerView, setSellerView] = useState('dashboard');
  const [inventoryThreshold, setInventoryThreshold] = useState(5); // Default low inventory threshold
  const [filterOrderStatus, setFilterOrderStatus] = useState('all');
  const [activeProducts, setActiveProducts] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [salesData, setSalesData] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [percentageChange, setPercentageChange] = useState(8.5); // Default percentage change for revenue
  
  // Mock orders data with additional fields 
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
  
  // Mock product inventory data
  const [inventory, setInventory] = useState([
    {
      id: 1,
      name: 'Tailored Suit',
      category: 'Men\'s Suits',
      price: 299.99,
      stock: 15,
      threshold: 5,
      sku: 'TS-001',
      image: 'https://via.placeholder.com/150',
      salesCount: 42,
      views: 230
    },
    {
      id: 2,
      name: 'Evening Dress',
      category: 'Women\'s Dresses',
      price: 189.99,
      stock: 8,
      threshold: 5,
      sku: 'ED-002',
      image: 'https://via.placeholder.com/150',
      salesCount: 36,
      views: 285
    },
    {
      id: 3,
      name: 'Casual Shirt',
      category: 'Men\'s Shirts',
      price: 59.99,
      stock: 25,
      threshold: 10,
      sku: 'CS-003',
      image: 'https://via.placeholder.com/150',
      salesCount: 67,
      views: 190
    },
    {
      id: 4,
      name: 'Formal Dress',
      category: 'Women\'s Dresses',
      price: 249.99,
      stock: 3,
      threshold: 5,
      sku: 'FD-004',
      image: 'https://via.placeholder.com/150',
      salesCount: 18,
      views: 125
    },
    {
      id: 5,
      name: 'Winter Jacket',
      category: 'Outerwear',
      price: 179.99,
      stock: 12,
      threshold: 7,
      sku: 'WJ-005',
      image: 'https://via.placeholder.com/150',
      salesCount: 24,
      views: 110
    },
    {
      id: 6,
      name: 'Business Pants',
      category: 'Men\'s Pants',
      price: 89.99,
      stock: 2,
      threshold: 8,
      sku: 'BP-006',
      image: 'https://via.placeholder.com/150',
      salesCount: 31,
      views: 150
    }
  ]);
  
  // Mock saved items
  const savedItems = [
    {
      id: 5,
      name: 'Designer Pants',
      price: 129.99,
      image: 'https://via.placeholder.com/100x100',
      seller: 'Elite Tailors'
    },
    {
      id: 6,
      name: 'Winter Coat',
      price: 249.99,
      image: 'https://via.placeholder.com/100x100',
      seller: 'Seasonal Wear'
    }
  ];
  
  // Mock stats for the dashboard
  const stats = {
    revenue: 1250.75,
    orders: 28,
    visitors: 1452,
    conversion: 3.2
  };
  
  // Mock recent orders
  const recentOrders = [
    {
      id: 'ORD-1238',
      date: '2023-06-17',
      customer: 'Alex Thompson',
      product: 'Winter Jacket',
      status: 'Cancelled',
      total: 179.99
    },
    {
      id: 'ORD-1237',
      date: '2023-06-18',
      customer: 'Emily Davis',
      product: 'Formal Dress',
      status: 'Pending',
      total: 249.99
    },
    {
      id: 'ORD-1234',
      date: '2023-06-15',
      customer: 'John Smith',
      product: 'Tailored Suit',
      status: 'Delivered',
      total: 299.99
    }
  ];
  
  // Mock low stock alerts
  const lowStockItems = [
    { id: 4, name: 'Formal Dress', stock: 3, threshold: 5 },
    { id: 2, name: 'Evening Dress', stock: 8, threshold: 10 }
  ];
  
  // Handler for updating order status
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    // In a real app, this would make an API call
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        return { ...order, status: newStatus };
      }
      return order;
    });
    
    // For demo purposes, we'll just show a toast
    setToastMessage(`Order ${orderId} status updated to ${newStatus}`);
    setToastType('success');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  
  // Handler for updating inventory
  const handleUpdateInventory = (productId, newStock) => {
    setInventory(prevInventory => 
      prevInventory.map(product => 
        product.id === productId ? { ...product, stock: newStock } : product
      )
    );
    
    setToastMessage(`Inventory updated for product #${productId}`);
    setToastType('success');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  
  // Handler for updating threshold
  const handleUpdateThreshold = (productId, newThreshold) => {
    setInventory(prevInventory => 
      prevInventory.map(product => 
        product.id === productId ? { ...product, threshold: newThreshold } : product
      )
    );
    
    setToastMessage(`Threshold updated for product #${productId}`);
    setToastType('success');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  
  // Handler for setting global threshold
  const handleSetGlobalThreshold = (threshold) => {
    setInventoryThreshold(threshold);
    setInventory(prevInventory => 
      prevInventory.map(product => ({ ...product, threshold }))
    );
    
    setToastMessage(`Global inventory threshold set to ${threshold}`);
    setToastType('success');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Get low stock items
  const getLowStockItems = () => {
    return inventory.filter(product => product.stock <= product.threshold);
  };
  
  // Get orders by status
  const getOrdersByStatus = (status) => {
    if (status === 'all') return orders;
    return orders.filter(order => order.status === status);
  };
  
  // Calculate sales metrics
  useEffect(() => {
    // In a real app, this would be an API call or calculated server-side
    const totalSales = orders.reduce((total, order) => total + order.total, 0);
    const pendingOrders = orders.filter(order => order.status === 'Processing' || order.status === 'Pending').length;
    const totalProducts = inventory.length;
    const lowStockCount = getLowStockItems().length;
    
    // Calculate revenue percentage change
    const currentMonthRevenue = 1250.75; // Mock value for current month
    const previousMonthRevenue = 1150.25; // Mock value for previous month
    const calculatedPercentageChange = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(1);
    setPercentageChange(calculatedPercentageChange);
    
    setSalesData({
      totalSales,
      pendingOrders,
      totalProducts,
      lowStockCount
    });
    
    // Set active products 
    setActiveProducts(inventory);
    
    // Get unique categories and counts
    const categories = {};
    inventory.forEach(product => {
      if (categories[product.category]) {
        categories[product.category]++;
      } else {
        categories[product.category] = 1;
      }
    });
    
    setProductCategories(Object.entries(categories).map(([name, count]) => ({ name, count })));
    
  }, [inventory, orders]);
  
  useEffect(() => {
    // Check if user is logged in
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
        setLoading(false);
      } else {
        // Redirect to login page if not authenticated
        router.push('/login?redirect=/dashboard');
      }
    } catch (err) {
      console.error('Error parsing user data:', err);
      router.push('/login?redirect=/dashboard');
    }
  }, [router]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  const renderDashboardContent = () => {
    if (user.role === 'seller') {
      return (
        <div>
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Seller Dashboard</h2>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-medium text-gray-900">Welcome back, {user.name || user.email?.split('@')[0]}</h3>
                <p className="mt-1 text-sm text-gray-500">Manage your products, orders, and seller profile</p>
              </div>
              <div className="mt-4 md:mt-0">
                <Link
                  href={`/sellers/${user.sellerId || 'premium-tailors'}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
                  </svg>
                  View Your Public Profile
                </Link>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Performance Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Sales This Month
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          $12,890
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link href="/dashboard/sales" className="font-medium text-blue-600 hover:text-blue-500">
                    View sales report
                  </Link>
                </div>
              </div>
            </div>

            {/* Orders Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Pending Orders
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          8
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link href="/dashboard/orders" className="font-medium text-blue-600 hover:text-blue-500">
                    Manage orders
                  </Link>
                </div>
              </div>
            </div>

            {/* Products Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Products
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          25
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link href="/dashboard/products" className="font-medium text-blue-600 hover:text-blue-500">
                    Manage products
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Orders Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
              <Link href="/dashboard/orders" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                View all
              </Link>
            </div>
            
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {orders.slice(0, 3).map((order) => (
                  <li key={order.id}>
                    <Link href={`/dashboard/orders/${order.id}`} className="block hover:bg-gray-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-blue-600 truncate">
                              Order #{order.id}
                            </p>
                            <div className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                              order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {order.status}
                            </div>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="text-sm text-gray-500">
                              {order.date}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              {order.product}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>
                              ${order.total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Product Management Section */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Product Management</h3>
              <Link href="/dashboard/products" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                View all products
              </Link>
            </div>
            
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h4 className="text-base font-medium text-gray-900">Add New Products</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Expand your catalog by adding new products or services
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Link 
                    href="/dashboard/products/new" 
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add New Product
                  </Link>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="border border-gray-300 rounded-lg p-5 bg-gray-50">
                  <h5 className="text-sm font-medium text-gray-900">Quick Tips</h5>
                  <ul className="mt-2 space-y-2 text-xs text-gray-700">
                    <li className="flex items-start">
                      <svg className="h-4 w-4 text-green-500 mr-1.5 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Use high-quality images for your products
                    </li>
                    <li className="flex items-start">
                      <svg className="h-4 w-4 text-green-500 mr-1.5 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Provide detailed descriptions and measurements
                    </li>
                    <li className="flex items-start">
                      <svg className="h-4 w-4 text-green-500 mr-1.5 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Set competitive prices
                    </li>
                    <li className="flex items-start">
                      <svg className="h-4 w-4 text-green-500 mr-1.5 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Include customization options
                    </li>
                  </ul>
                </div>
                
                <div className="border border-gray-300 rounded-lg p-5 bg-gray-50">
                  <h5 className="text-sm font-medium text-gray-900">Product Categories</h5>
                  <div className="mt-2 space-y-1 text-xs text-gray-700">
                    <div className="flex items-center justify-between">
                      <span>Men's Suits</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Women's Dresses</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">8</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Formal Wear</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">5</span>
                    </div>
                    <div className="mt-3">
                      <Link href="/dashboard/products/categories" className="text-xs font-medium text-blue-600 hover:text-blue-500">
                        Manage Categories
                      </Link>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-300 rounded-lg p-5 bg-gray-50">
                  <h5 className="text-sm font-medium text-gray-900">Performance</h5>
                  <div className="mt-2 space-y-2 text-xs text-gray-700">
                    <div className="flex items-center justify-between">
                      <span>Top Selling Product</span>
                      <span className="font-medium">Tailored Suit</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Most Viewed</span>
                      <span className="font-medium">Evening Dress</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Conversion Rate</span>
                      <span className="font-medium">4.2%</span>
                    </div>
                    <div className="mt-3">
                      <Link href="/dashboard/analytics" className="text-xs font-medium text-blue-600 hover:text-blue-500">
                        View Analytics
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Buyer Dashboard
      return (
        <div>
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Dashboard</h2>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-medium text-gray-900">Welcome back, {user.name || user.email?.split('@')[0]}</h3>
                <p className="mt-1 text-sm text-gray-500">Manage your orders and profile information</p>
              </div>
              <div className="mt-4 md:mt-0">
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 100-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`${
                    activeTab === 'orders'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
                >
                  My Orders
                </button>
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`${
                    activeTab === 'saved'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
                >
                  Saved Items
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`${
                    activeTab === 'profile'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
                >
                  Profile
                </button>
              </nav>
            </div>
            
            <div className="p-6">
              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Your Orders</h3>
                  
                  {orders.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {orders.map(order => (
                        <li key={order.id} className="py-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-blue-600 truncate">
                                Order #{order.id}
                              </p>
                              <div className="mt-1 flex">
                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                                  order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {order.status}
                                </p>
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
                                <Link href={`/orders/${order.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-500">
                                  View Order Details
                                </Link>
                              </div>
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
                        <Link href="/products" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          Browse Products
                        </Link>
                      </div>
                    </div>
                  )}
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
                                  <Link href={`/products/${item.id}`} className="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500">
                                    <span className="ml-3">View</span>
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
                          <Link href="/products" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Browse Products
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
                    <Link href="/profile/edit" className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      Edit Profile
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
  };
  
  // Products Management View
  const renderProductsManagement = () => {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Product Management</h3>
            <button
              onClick={() => router.push('/dashboard/products/new')}
              className="mt-3 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New Product
            </button>
          </div>
          
          <div className="mb-6">
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div>
                <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                  <option value="">All Categories</option>
                  {productCategories.map((category, index) => (
                    <option key={index} value={category.name}>
                      {category.name} ({category.count})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popularity">Popularity</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-md" src={product.image} alt={product.name} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-sm ${
                          product.stock <= 0 ? 'text-red-600' : 
                          product.stock <= product.threshold ? 'text-yellow-600' : 
                          'text-green-600'
                        }`}>
                          {product.stock}
                        </span>
                        <span className="ml-1 text-xs text-gray-500">
                          /{product.stock <= product.threshold ? ' Low' : ' In Stock'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.salesCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.views}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => router.push(`/dashboard/products/${product.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setSellerView('inventory')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Inventory
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{inventory.length}</span> of <span className="font-medium">{inventory.length}</span> products
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 bg-white text-sm text-gray-500 rounded-md hover:bg-gray-50 disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-3 py-1 border border-gray-300 bg-white text-sm text-gray-500 rounded-md hover:bg-gray-50 disabled:opacity-50" disabled>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Analytics View
  const renderAnalytics = () => {
    // Mock analytics data
    const monthlyRevenue = [
      { month: 'Jan', revenue: 5400 },
      { month: 'Feb', revenue: 6100 },
      { month: 'Mar', revenue: 8200 },
      { month: 'Apr', revenue: 7600 },
      { month: 'May', revenue: 9100 },
      { month: 'Jun', revenue: 12890 }
    ];
    
    // Calculate trend percentages
    const thisMonth = monthlyRevenue[monthlyRevenue.length - 1].revenue;
    const lastMonth = monthlyRevenue[monthlyRevenue.length - 2].revenue;
    const analyticPercentageChange = ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1);
    
    return (
      <div className="space-y-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Sales Overview</h3>
            
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden border border-gray-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Revenue (Month)
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-lg font-medium text-gray-900">
                          ${thisMonth.toFixed(2)}
                        </div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${analyticPercentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {analyticPercentageChange >= 0 ? (
                            <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          <span>{Math.abs(analyticPercentageChange)}%</span>
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden border border-gray-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Orders (Month)
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-lg font-medium text-gray-900">
                          48
                        </div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                          <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>12%</span>
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden border border-gray-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Avg. Order Value
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-lg font-medium text-gray-900">
                          $268.54
                        </div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                          <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>5.4%</span>
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden border border-gray-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Conversion Rate
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-lg font-medium text-gray-900">
                          4.2%
                        </div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-red-600">
                          <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>0.8%</span>
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-base font-medium text-gray-900 mb-4">Monthly Revenue</h4>
              <div className="h-64 bg-gray-50 rounded-lg p-4 flex justify-around items-end">
                {monthlyRevenue.map((data, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div 
                      className="w-12 bg-blue-500 rounded-t" 
                      style={{ 
                        height: `${(data.revenue / 15000) * 180}px`,
                        backgroundColor: idx === monthlyRevenue.length - 1 ? '#3B82F6' : '#93C5FD'
                      }}
                    ></div>
                    <div className="text-xs text-gray-600 mt-2">{data.month}</div>
                    <div className="text-xs font-medium">${data.revenue}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Top Performing Products</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Units Sold
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conversion Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventory
                    .sort((a, b) => b.salesCount - a.salesCount)
                    .slice(0, 5)
                    .map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-md" src={product.image} alt={product.name} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.salesCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${(product.salesCount * product.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {((product.salesCount / product.views) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg lg:w-1/2">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Insights</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Repeat Customers</span>
                  <span className="text-sm font-medium text-gray-900">68%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '68%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">New Customers</span>
                  <span className="text-sm font-medium text-gray-900">32%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '32%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Customer Satisfaction</span>
                  <span className="text-sm font-medium text-gray-900">4.8/5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '96%' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg lg:w-1/2">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sales by Category</h3>
              <div className="space-y-4">
                {productCategories.map((category, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{category.name}</span>
                      <span className="text-sm font-medium text-gray-900">{((category.count / inventory.length) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="h-2.5 rounded-full" 
                        style={{ 
                          width: `${(category.count / inventory.length) * 100}%`,
                          backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899'][idx % 5]
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back, {user?.name || 'User'}! Here's what's happening with your account.
            </p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Revenue (30 days)
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                ${stats.revenue.toFixed(2)}
              </dd>
              <div className="mt-2 flex items-center text-sm text-green-600">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span>{parseFloat(percentageChange) > 0 ? `+${percentageChange}%` : `${percentageChange}%`}</span>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6">
              <div className="text-sm">
                <Link href="/dashboard/sales" className="font-medium text-blue-600 hover:text-blue-500">
                  View sales details
                </Link>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Orders (30 days)
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {stats.orders}
              </dd>
              <div className="mt-2 flex items-center text-sm text-green-600">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span>12%</span>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6">
              <div className="text-sm">
                <Link href="/dashboard/orders" className="font-medium text-blue-600 hover:text-blue-500">
                  View all orders
                </Link>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Visitors (30 days)
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {stats.visitors}
              </dd>
              <div className="mt-2 flex items-center text-sm text-green-600">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span>15.3% from last month</span>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6">
              <div className="text-sm">
                <Link href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  View analytics
                </Link>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Conversion Rate
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {stats.conversion}%
              </dd>
              <div className="mt-2 flex items-center text-sm text-red-600">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>0.8%</span>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6">
              <div className="text-sm">
                <Link href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  View conversion details
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Quick Actions
              </h3>
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                {user?.role === 'seller' && (
                  <>
                    <div>
                      <Link href="/dashboard/products/new" className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Add New Product
                      </Link>
                    </div>
                    <div>
                      <Link href="/dashboard/products" className="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Manage Products
                      </Link>
                    </div>
                    <div>
                      <Link href="/dashboard/orders" className="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        View Orders
                      </Link>
                    </div>
                    <div>
                      <Link href="/dashboard/sales" className="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Sales Reports
                      </Link>
                    </div>
                  </>
                )}
                {user?.role === 'buyer' && (
                  <>
                    <div>
                      <Link href="/products" className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Shop Now
                      </Link>
                    </div>
                    <div>
                      <Link href="/dashboard/orders" className="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        My Orders
                      </Link>
                    </div>
                    <div>
                      <Link href="/sellers" className="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Browse Tailors
                      </Link>
                    </div>
                    <div>
                      <Link href="/dashboard/profile" className="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Edit Profile
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Activity
              </h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                {recentOrders.map((order, idx) => (
                  <div key={order.id} className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      {order.date}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <div className="flex justify-between">
                        <span>
                          Order <Link href={`/dashboard/orders/${order.id}`} className="text-blue-600 hover:text-blue-500">{order.id}</Link> - {order.product}
                        </span>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                            order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'}`}>
                          {order.status}
                        </span>
                      </div>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
              <Link href="/dashboard/orders" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                View all
              </Link>
            </div>
          </div>
          
          {/* Low Stock Alerts - Only show if user is a seller */}
          {user?.role === 'seller' && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Low Stock Alerts
                </h3>
              </div>
              {lowStockItems.length > 0 ? (
                <div className="border-t border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {lowStockItems.map(item => (
                      <li key={item.id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {item.stock} left
                          </div>
                        </div>
                        <div className="mt-2">
                          <Link href={`/dashboard/products/${item.id}`} className="text-sm text-blue-600 hover:text-blue-500">
                            Update stock
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6 text-center">
                  <p className="text-sm text-gray-500">No low stock items at the moment.</p>
                </div>
              )}
            </div>
          )}
          
          {/* Profile Overview */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Account Information
              </h3>
              <Link href="/dashboard/profile" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Edit
              </Link>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Full name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user?.name || 'Not provided'}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Email address</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user?.email || 'Not provided'}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Phone number</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user?.phone || 'Not provided'}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Account type</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user?.role === 'seller' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user?.role === 'seller' ? 'Seller Account' : 'Buyer Account'}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>
      
      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed bottom-5 right-5 p-4 rounded-md shadow-lg ${
          toastType === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          toastType === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          <div className="flex items-center">
            {toastType === 'success' && (
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            {toastType === 'error' && (
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293-1.293a1 1 0 00-1.414-1.414L10 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}