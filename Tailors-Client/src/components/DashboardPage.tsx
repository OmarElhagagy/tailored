import React, { useState, useEffect } from 'react';

interface OrderData {
  id: string;
  customer: string;
  date: string;
  status: string;
  total: number;
}

interface StatCard {
  title: string;
  value: number;
  change: number;
  icon: string;
}

interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

interface InvoiceData {
  id: string;
  orderId: string;
  customer: string;
  date: string;
  description: string;
  total: number;
  isPaid: boolean;
}

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<StatCard[]>([
    { title: 'Total Products', value: 12, change: 8.5, icon: 'box' },
    { title: 'Orders', value: 5, change: 12.3, icon: 'shopping-bag' },
    { title: 'Completed', value: 3, change: -2.4, icon: 'check-circle' },
    { title: 'Revenue', value: 530, change: 15.8, icon: 'dollar-sign' }
  ]);
  
  const [recentOrders, setRecentOrders] = useState<OrderData[]>([
    { id: '#O-12345', customer: 'John Doe', date: 'June 15, 2023', status: 'Completed', total: 120.00 },
    { id: '#O-12346', customer: 'Jane Smith', date: 'June 16, 2023', status: 'Processing', total: 85.50 },
    { id: '#O-12347', customer: 'Robert Johnson', date: 'June 17, 2023', status: 'Cancelled', total: 220.75 },
    { id: '#O-12348', customer: 'Mary Williams', date: 'June 18, 2023', status: 'Pending', total: 150.25 },
    { id: '#O-12349', customer: 'David Brown', date: 'June 19, 2023', status: 'Completed', total: 95.00 },
  ]);
  
  // New states for managing created items
  const [products, setProducts] = useState<ProductItem[]>([
    { id: '#P-001', name: 'Tailored Suit', category: 'Men\'s Wear', price: 299.99, stock: 15 },
    { id: '#P-002', name: 'Evening Dress', category: 'Women\'s Wear', price: 189.99, stock: 8 },
  ]);
  
  const [invoices, setInvoices] = useState<InvoiceData[]>([
    { id: '#INV-001', orderId: '#O-12345', customer: 'John Doe', date: 'June 15, 2023', description: 'Custom suit tailoring', total: 350.00, isPaid: true },
  ]);
  
  const [timeRange, setTimeRange] = useState('week');
  const [isLoading, setIsLoading] = useState(false);
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  
  // Add these new states
  const [showInvoiceAlert, setShowInvoiceAlert] = useState(false);
  const [lastCreatedInvoice, setLastCreatedInvoice] = useState<InvoiceData | null>(null);
  
  // Add this new state
  const [activeTab, setActiveTab] = useState('orders');
  
  // New invoice form state
  const [newInvoice, setNewInvoice] = useState({
    customer: '',
    description: '',
    total: ''
  });
  
  // Add state for order selection
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState('');
  
  // Add custom date range state
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  
  // Add a state to show/hide the date range picker
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  
  // Update isDateInRange to handle custom date ranges
  const isDateInRange = (dateStr: string, range: string): boolean => {
    // Parse the date from format like "June 15, 2023"
    const parts = dateStr.split(' ');
    if (parts.length < 3) return false;
    
    const month = parts[0];
    const day = parseInt(parts[1].replace(',', ''));
    const year = parseInt(parts[2]);
    
    const months: Record<string, number> = {
      'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
      'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
    };
    
    if (!(month in months) || isNaN(day) || isNaN(year)) return false;
    
    const date = new Date(year, months[month], day);
    const today = new Date();
    
    if (range === 'custom' && customDateRange.startDate && customDateRange.endDate) {
      // Custom date range
      const startDate = new Date(customDateRange.startDate);
      const endDate = new Date(customDateRange.endDate);
      // Set the end date to the end of the day
      endDate.setHours(23, 59, 59, 999);
      return date >= startDate && date <= endDate;
    } else if (range === 'day') {
      // Same day
      return date.getDate() === today.getDate() && 
             date.getMonth() === today.getMonth() && 
             date.getFullYear() === today.getFullYear();
    } else if (range === 'week') {
      // Last 7 days
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 7);
      return date >= weekAgo && date <= today;
    } else { // month
      // Last 30 days
      const monthAgo = new Date();
      monthAgo.setDate(today.getDate() - 30);
      return date >= monthAgo && date <= today;
    }
  };
  
  // Update calculateRevenue to filter based on timeRange
  const calculateRevenue = () => {
    // Calculate current revenue from paid invoices for completed orders in selected time range
    const currentRevenue = invoices
      .filter(invoice => {
        // Check if within selected time range
        if (!isDateInRange(invoice.date, timeRange)) return false;
        
        // Find the associated order
        const order = recentOrders.find(order => order.id === invoice.orderId);
        // Only include invoices for completed orders that are paid
        return order?.status === 'Completed' && invoice.isPaid;
      })
      .reduce((total, invoice) => total + invoice.total, 0);
    
    // Calculate total revenue (including unpaid invoices) for context in selected time range
    const totalInvoicedRevenue = invoices
      .filter(invoice => isDateInRange(invoice.date, timeRange))
      .reduce((total, invoice) => total + invoice.total, 0);
    
    // Calculate potential revenue from completed orders not yet invoiced in selected time range
    const potentialAdditionalRevenue = recentOrders
      .filter(order => 
        isDateInRange(order.date, timeRange) &&
        order.status === 'Completed' && 
        !invoices.some(inv => inv.orderId === order.id)
      )
      .reduce((total, order) => total + order.total, 0);
    
    // Calculate percentage change
    let previousRevenue = 0;
    
    // For simple demo, use different previous period based on time range
    if (timeRange === 'day') {
      previousRevenue = currentRevenue * 0.8; // Yesterday was 80% of today
    } else if (timeRange === 'week') {
      previousRevenue = currentRevenue * 0.85; // Last week was 85% of this week
    } else { // month
      previousRevenue = currentRevenue * 0.9; // Last month was 90% of this month
    }
    
    const changePercentage = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;
    
    return {
      current: currentRevenue,
      total: totalInvoicedRevenue,
      potential: potentialAdditionalRevenue,
      change: parseFloat(changePercentage.toFixed(1))
    };
  };
  
  // Update useEffect to also filter order and completed counts by date
  useEffect(() => {
    if (timeRange) {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const revenueData = calculateRevenue();
        
        // Update stats with accurate revenue data and date filtering
        const updatedStats = stats.map(stat => {
          if (stat.title === 'Revenue') {
            return {
              ...stat,
              value: revenueData.current,
              change: revenueData.change
            };
          } else if (stat.title === 'Orders') {
            // Count orders in the current time range
            const ordersInRange = recentOrders.filter(order => 
              isDateInRange(order.date, timeRange)
            ).length;
            
            return {
              ...stat,
              value: ordersInRange,
              change: 4.4 // Simplified for demo
            };
          } else if (stat.title === 'Completed') {
            // Count completed orders in the current time range
            const completedInRange = recentOrders.filter(order => 
              isDateInRange(order.date, timeRange) && 
              order.status === 'Completed'
            ).length;
            
            return {
              ...stat,
              value: completedInRange,
              change: 11.7 // Simplified for demo
            };
          } else if (stat.title === 'Total Products') {
            return {
              ...stat,
              value: products.length,
              change: 10.2 // Simplified for demo
            };
          } else {
            return stat;
          }
        });
        
        setStats(updatedStats);
        setIsLoading(false);
      }, 800);
    }
  }, [timeRange, invoices, recentOrders, products]);
  
  // Add a function to handle custom date range changes
  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomDateRange({
      ...customDateRange,
      [name]: value
    });
  };
  
  // Add a function to apply the custom date range
  const applyCustomDateRange = () => {
    if (customDateRange.startDate && customDateRange.endDate) {
      setTimeRange('custom');
      setShowDateRangePicker(false);
    } else {
      alert('Please select both start and end dates');
    }
  };
  
  // Update the header to include a custom date range option and date pickers
  <div className="card-header d-flex justify-content-between align-items-center">
    <h3>Dashboard</h3>
    <div className="d-flex align-items-center">
      {showDateRangePicker && (
        <div className="me-3 bg-light p-2 rounded border d-flex align-items-center">
          <div className="input-group input-group-sm me-2" style={{ width: '200px' }}>
            <span className="input-group-text">From</span>
            <input 
              type="date" 
              className="form-control form-control-sm"
              name="startDate"
              value={customDateRange.startDate}
              onChange={handleDateRangeChange}
            />
          </div>
          <div className="input-group input-group-sm me-2" style={{ width: '200px' }}>
            <span className="input-group-text">To</span>
            <input 
              type="date" 
              className="form-control form-control-sm"
              name="endDate"
              value={customDateRange.endDate}
              onChange={handleDateRangeChange}
            />
          </div>
          <button 
            className="btn btn-sm btn-primary"
            onClick={applyCustomDateRange}
          >
            Apply
          </button>
          <button 
            className="btn btn-sm btn-outline-secondary ms-1"
            onClick={() => setShowDateRangePicker(false)}
          >
            Cancel
          </button>
        </div>
      )}
      <div className="btn-group">
        <button 
          className={`btn btn-sm ${timeRange === 'day' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => handleRangeChange('day')}
        >
          Day
        </button>
        <button 
          className={`btn btn-sm ${timeRange === 'week' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => handleRangeChange('week')}
        >
          Week
        </button>
        <button 
          className={`btn btn-sm ${timeRange === 'month' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => handleRangeChange('month')}
        >
          Month
        </button>
        <button 
          className={`btn btn-sm ${timeRange === 'custom' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setShowDateRangePicker(true)}
        >
          Custom Range
        </button>
      </div>
    </div>
  </div>
  
  // Update the handleRangeChange function to handle the custom date range
  const handleRangeChange = (range: string) => {
    setTimeRange(range);
    // If switching to a preset range, hide the date picker
    if (range !== 'custom') {
      setShowDateRangePicker(false);
    }
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-success';
      case 'Processing': return 'bg-warning text-dark';
      case 'Pending': return 'bg-info text-dark';
      case 'Cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };
  
  const handleViewAllOrders = () => {
    setShowAllOrders(!showAllOrders);
    
    // If we're showing all orders, generate more random orders
    if (!showAllOrders) {
      const additionalOrders: OrderData[] = [];
      const statusOptions = ['Completed', 'Processing', 'Pending', 'Cancelled'];
      const nameOptions = ['Michael Lee', 'Sarah Jones', 'Tom Wilson', 'Emily Davis', 'James Miller'];
      
      for (let i = 0; i < 5; i++) {
        const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
        const randomName = nameOptions[Math.floor(Math.random() * nameOptions.length)];
        const randomTotal = Math.round(Math.random() * 300 * 100) / 100;
        
        additionalOrders.push({
          id: `#O-${12350 + i}`,
          customer: randomName,
          date: 'June 20, 2023',
          status: randomStatus,
          total: randomTotal
        });
      }
      
      setRecentOrders([...recentOrders, ...additionalOrders]);
    } else {
      // Reset to original 5 orders
      setRecentOrders(recentOrders.slice(0, 5));
    }
  };
  
  const handleQuickAction = (action: string) => {
    setActiveQuickAction(action);
    setIsModalOpen(true);
    setModalContent(action);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setActiveQuickAction(null);
    setModalContent('');
  };
  
  // New Product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Men\'s Wear',
    price: '',
    stock: ''
  });
  
  const handleProductInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: value
    });
  };
  
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate new product ID
    const productId = `#P-${(1000 + products.length).toString().padStart(3, '0')}`;
    
    // Create new product object
    const newProductItem: ProductItem = {
      id: productId,
      name: newProduct.name,
      category: newProduct.category,
      price: parseFloat(newProduct.price) || 0,
      stock: parseInt(newProduct.stock) || 0
    };
    
    // Add to products list
    setProducts([...products, newProductItem]);
    
    // Update total products stat
    const updatedStats = stats.map(stat => 
      stat.title === 'Total Products' 
        ? { ...stat, value: stat.value + 1 } 
        : stat
    );
    setStats(updatedStats);
    
    // Show success message
    alert(`Product "${newProduct.name}" added successfully!`);
    
    // Close modal and reset form
    closeModal();
    setNewProduct({
      name: '',
      category: 'Men\'s Wear',
      price: '',
      stock: ''
    });
  };
  
  const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewInvoice({
      ...newInvoice,
      [name]: value
    });
  };
  
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get the selected order
    const selectedOrder = recentOrders.find(order => order.id === selectedOrderForInvoice);
    
    if (!selectedOrder) {
      alert("Please select an order to invoice.");
      return;
    }
    
    // Check if this order already has an invoice
    const existingInvoice = invoices.find(inv => inv.orderId === selectedOrderForInvoice);
    if (existingInvoice) {
      alert("This order already has an invoice created.");
      return;
    }
    
    // Create a simple invoice linked to the order
    const invoice: InvoiceData = {
      id: `#INV-${(1000 + invoices.length).toString().padStart(3, '0')}`,
      orderId: selectedOrderForInvoice,
      customer: selectedOrder.customer,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      description: `Services for order ${selectedOrderForInvoice}`,
      total: selectedOrder.total,
      isPaid: false
    };
    
    // Set last created invoice for the alert
    setLastCreatedInvoice(invoice);
    
    // Add to invoices
    setInvoices([...invoices, invoice]);
    
    // Reset and close
    setNewInvoice({ customer: '', description: '', total: '' });
    setSelectedOrderForInvoice('');
    closeModal();
    
    // Switch to invoices tab
    setActiveTab('invoices');
    
    // Show success message
    setShowInvoiceAlert(true);
    setTimeout(() => {
      setShowInvoiceAlert(false);
    }, 3000);
  };
  
  const renderModalContent = () => {
    switch (modalContent) {
      case 'create-invoice':
        // Get orders that don't have invoices yet and are completed
        const invoiceableOrders = recentOrders.filter(order => 
          order.status === 'Completed' && 
          !invoices.some(inv => inv.orderId === order.id)
        );
        
        return (
          <>
            <div className="modal-header">
              <h5 className="modal-title">Create Invoice</h5>
              <button type="button" className="btn-close" onClick={closeModal}></button>
            </div>
            
            {invoiceableOrders.length === 0 ? (
              <div className="modal-body">
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  No completed orders are available for invoicing. Complete an order first.
                </div>
                <div className="text-end mt-3">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateInvoice}>
                <div className="modal-body">
                  <div className="alert alert-info mb-3">
                    <i className="bi bi-info-circle me-2"></i>
                    Create an invoice for a completed order to bill the customer.
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Select Completed Order</label>
                    <select 
                      className="form-select"
                      value={selectedOrderForInvoice}
                      onChange={(e) => setSelectedOrderForInvoice(e.target.value)}
                      required
                    >
                      <option value="">-- Select an Order --</option>
                      {invoiceableOrders.map(order => (
                        <option key={order.id} value={order.id}>
                          {order.id} - {order.customer} (${order.total.toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedOrderForInvoice && (
                    <div className="card bg-light p-3 mb-3">
                      <h6>Order Details</h6>
                      {(() => {
                        const order = recentOrders.find(o => o.id === selectedOrderForInvoice);
                        return order ? (
                          <div>
                            <p className="mb-1"><strong>Customer:</strong> {order.customer}</p>
                            <p className="mb-1"><strong>Date:</strong> {order.date}</p>
                            <p className="mb-1"><strong>Status:</strong> {order.status}</p>
                            <p className="mb-0"><strong>Total:</strong> ${order.total.toFixed(2)}</p>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Invoice</button>
                </div>
              </form>
            )}
          </>
        );
        
      default:
        return null;
    }
  };
  
  // Add a togglePaid function to mark invoices as paid/unpaid
  const toggleInvoicePaid = (invoiceId: string) => {
    setInvoices(invoices.map(invoice => 
      invoice.id === invoiceId 
        ? { ...invoice, isPaid: !invoice.isPaid } 
        : invoice
    ));
  };
  
  // Fix the markOrderComplete function to update UI and ensure invoice creation buttons appear
  const markOrderComplete = (orderId: string) => {
    setRecentOrders(recentOrders.map(order => 
      order.id === orderId 
        ? { ...order, status: 'Completed' } 
        : order
    ));
    
    // Force rerender to update the action buttons
    setTimeout(() => {
      setActiveTab('orders');
    }, 10);
  };
  
  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h3>Dashboard</h3>
        <div className="d-flex align-items-center">
          {showDateRangePicker && (
            <div className="me-3 bg-light p-2 rounded border d-flex align-items-center">
              <div className="input-group input-group-sm me-2" style={{ width: '200px' }}>
                <span className="input-group-text">From</span>
                <input 
                  type="date" 
                  className="form-control form-control-sm"
                  name="startDate"
                  value={customDateRange.startDate}
                  onChange={handleDateRangeChange}
                />
              </div>
              <div className="input-group input-group-sm me-2" style={{ width: '200px' }}>
                <span className="input-group-text">To</span>
                <input 
                  type="date" 
                  className="form-control form-control-sm"
                  name="endDate"
                  value={customDateRange.endDate}
                  onChange={handleDateRangeChange}
                />
              </div>
              <button 
                className="btn btn-sm btn-primary"
                onClick={applyCustomDateRange}
              >
                Apply
              </button>
              <button 
                className="btn btn-sm btn-outline-secondary ms-1"
                onClick={() => setShowDateRangePicker(false)}
              >
                Cancel
              </button>
            </div>
          )}
          <div className="btn-group">
            <button 
              className={`btn btn-sm ${timeRange === 'day' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleRangeChange('day')}
            >
              Day
            </button>
            <button 
              className={`btn btn-sm ${timeRange === 'week' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleRangeChange('week')}
            >
              Week
            </button>
            <button 
              className={`btn btn-sm ${timeRange === 'month' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleRangeChange('month')}
            >
              Month
            </button>
            <button 
              className={`btn btn-sm ${timeRange === 'custom' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setShowDateRangePicker(true)}
            >
              Custom Range
            </button>
          </div>
        </div>
      </div>
      <div className="card-body">
        {/* Invoice and Report Alerts */}
        {showInvoiceAlert && lastCreatedInvoice && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <strong>Invoice Created!</strong> Invoice {lastCreatedInvoice.id} for {lastCreatedInvoice.customer} has been generated with a total of ${lastCreatedInvoice.total.toFixed(2)}.
            <button type="button" className="btn-close" onClick={() => setShowInvoiceAlert(false)}></button>
          </div>
        )}
        
        {isLoading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading dashboard data...</p>
          </div>
        ) : (
          <>
            <div className="row">
              {stats.map((stat, index) => (
                <div className="col-md-3 mb-4" key={index}>
                  <div className="card h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="text-muted mb-0">{stat.title}</h6>
                        <div className={`rounded-circle p-2 bg-light text-${stat.change >= 0 ? 'success' : 'danger'}`}>
                          <i className={`bi bi-${stat.icon}`}></i>
                        </div>
                      </div>
                      <h3 className="mb-0">{stat.title === 'Revenue' ? `$${stat.value.toFixed(2)}` : stat.value}</h3>
                      <div className={`small mt-2 ${stat.change >= 0 ? 'text-success' : 'text-danger'}`}>
                        <i className={`bi bi-arrow-${stat.change >= 0 ? 'up' : 'down'}`}></i> {Math.abs(stat.change)}% 
                        <span className="text-muted ms-1">
                          {timeRange === 'custom' 
                            ? `from ${new Date(customDateRange.startDate).toLocaleDateString()} to ${new Date(customDateRange.endDate).toLocaleDateString()}`
                            : `from previous ${timeRange}`
                          }
                        </span>
                      </div>
                      {stat.title === 'Revenue' && (
                        <div className="mt-2 small">
                          <div className="text-muted d-flex justify-content-between">
                            <span>Unpaid invoices:</span>
                            <span>${(calculateRevenue().total - calculateRevenue().current).toFixed(2)}</span>
                          </div>
                          <div className="text-muted d-flex justify-content-between">
                            <span>Uninvoiced orders:</span>
                            <span>${calculateRevenue().potential.toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="row mt-2">
              <div className="col-md-8">
                <ul className="nav nav-tabs mb-3">
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`} 
                      onClick={() => setActiveTab('orders')}
                    >
                      Orders
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'invoices' ? 'active' : ''}`} 
                      onClick={() => setActiveTab('invoices')}
                    >
                      Invoices
                    </button>
                  </li>
                </ul>
                
                {activeTab === 'orders' && (
                  <>
                    <h4>Recent Orders</h4>
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Total</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentOrders.map(order => {
                            // Check if this order already has an invoice (using strict equality)
                            const hasInvoice = invoices.some(inv => inv.orderId === order.id);
                            
                            return (
                              <tr key={order.id} className="cursor-pointer">
                                <td>{order.id}</td>
                                <td>{order.customer}</td>
                                <td>{order.date}</td>
                                <td>
                                  <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                                    {order.status}
                                  </span>
                                </td>
                                <td>${order.total.toFixed(2)}</td>
                                <td>
                                  {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                                    <button 
                                      className="btn btn-sm btn-outline-success"
                                      onClick={() => markOrderComplete(order.id)}
                                    >
                                      Mark Complete
                                    </button>
                                  )}
                                  {order.status === 'Completed' && !hasInvoice && (
                                    <button 
                                      className="btn btn-sm btn-outline-primary"
                                      onClick={() => {
                                        setSelectedOrderForInvoice(order.id);
                                        handleQuickAction('create-invoice');
                                      }}
                                    >
                                      Create Invoice
                                    </button>
                                  )}
                                  {order.status === 'Completed' && hasInvoice && (
                                    <span className="badge bg-light text-dark border">
                                      Invoiced
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="text-end">
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={handleViewAllOrders}
                      >
                        {showAllOrders ? "Show Less" : "View All Orders"}
                      </button>
                    </div>
                  </>
                )}
                
                {activeTab === 'invoices' && (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h4>Invoices</h4>
                      <button 
                        className="btn btn-sm btn-outline-success"
                        onClick={() => handleQuickAction('create-invoice')}
                      >
                        Create Invoice
                      </button>
                    </div>
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Invoice ID</th>
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoices.map(invoice => (
                            <tr key={invoice.id}>
                              <td>{invoice.id}</td>
                              <td>{invoice.orderId}</td>
                              <td>{invoice.customer}</td>
                              <td>{invoice.date}</td>
                              <td>${invoice.total.toFixed(2)}</td>
                              <td>
                                <div className="form-check form-switch">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={invoice.isPaid}
                                    onChange={() => toggleInvoicePaid(invoice.id)}
                                    id={`paid-toggle-${invoice.id}`}
                                  />
                                  <label className="form-check-label" htmlFor={`paid-toggle-${invoice.id}`}>
                                    {invoice.isPaid ? 'Paid' : 'Unpaid'}
                                  </label>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {invoices.length === 0 && (
                            <tr>
                              <td colSpan={6} className="text-center py-3">
                                No invoices created yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
              
              <div className="col-md-4">
                <h4>Status Overview</h4>
                <div className="card">
                  <div className="card-body">
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span>Completed</span>
                        <span>60%</span>
                      </div>
                      <div className="progress" style={{ height: '6px' }}>
                        <div 
                          className="progress-bar bg-success" 
                          role="progressbar" 
                          style={{ width: '60%' }} 
                          aria-valuenow={60} 
                          aria-valuemin={0} 
                          aria-valuemax={100}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span>Processing</span>
                        <span>20%</span>
                      </div>
                      <div className="progress" style={{ height: '6px' }}>
                        <div 
                          className="progress-bar bg-warning" 
                          role="progressbar" 
                          style={{ width: '20%' }} 
                          aria-valuenow={20} 
                          aria-valuemin={0} 
                          aria-valuemax={100}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span>Pending</span>
                        <span>15%</span>
                      </div>
                      <div className="progress" style={{ height: '6px' }}>
                        <div 
                          className="progress-bar bg-info" 
                          role="progressbar" 
                          style={{ width: '15%' }} 
                          aria-valuenow={15} 
                          aria-valuemin={0} 
                          aria-valuemax={100}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="d-flex justify-content-between mb-1">
                        <span>Cancelled</span>
                        <span>5%</span>
                      </div>
                      <div className="progress" style={{ height: '6px' }}>
                        <div 
                          className="progress-bar bg-danger" 
                          role="progressbar" 
                          style={{ width: '5%' }} 
                          aria-valuenow={5} 
                          aria-valuemin={0} 
                          aria-valuemax={100}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="card mt-3">
                  <div className="card-body">
                    <h5 className="card-title">Quick Actions</h5>
                    <div className="d-grid gap-2">
                      <button 
                        className="btn btn-outline-success"
                        onClick={() => {
                          handleQuickAction('create-invoice');
                          setActiveTab('invoices');
                        }}
                      >
                        Create Invoice
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Modal for Quick Actions */}
      {isModalOpen && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              {renderModalContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage; 