import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Row, Col, Card, Badge, Button, Table,
  ProgressBar, Spinner, Alert, Tab, Tabs, Form, Modal
} from 'react-bootstrap';
import { FaBox, FaChartLine, FaClipboardList, FaUsers, FaStar, FaStore, FaPlus, FaBoxOpen, FaTags, FaExclamationTriangle, FaWrench } from 'react-icons/fa';
import { MdDashboard, MdInventory, MdNotificationsActive } from 'react-icons/md';
import { format } from 'date-fns';
import { API_URL } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';
import './Dashboard.css';
import SellerNavbar from '../../components/SellerNavbar';
import SellerSidebar from '../../components/SellerSidebar';

interface DashboardStats {
  totalSales: number;
  pendingOrders: number;
  activeListings: number;
  totalCustomers: number;
  sellerRating: number;
  monthlyRevenue: {
    month: string;
    revenue: number;
  }[];
  recentOrders: {
    _id: string;
    product: {
      _id: string;
      title: string;
    };
    buyer: {
      _id: string;
      name: string;
    };
    status: string;
    totalAmount: number;
    createdAt: string;
  }[];
  topProducts: {
    _id: string;
    title: string;
    price: number;
    salesCount: number;
    thumbnail: string;
  }[];
  inventory: {
    _id: string;
    product: {
      _id: string;
      title: string;
      thumbnail: string;
    };
    quantity: number;
    lowStockThreshold: number;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  }[];
  ordersByStatus: {
    status: string;
    count: number;
  }[];
  thresholds: {
    lowStockThreshold: number;
    reorderThreshold: number;
    targetProfitMargin: number;
    minimumOrderValue: number;
  };
}

const SellerDashboard: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [profileCompletionPercent, setProfileCompletionPercent] = useState<number>(0);
  
  // New state variables
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [showThresholdModal, setShowThresholdModal] = useState<boolean>(false);
  const [showInventoryModal, setShowInventoryModal] = useState<boolean>(false);
  const [showOrderModal, setShowOrderModal] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [thresholdSettings, setThresholdSettings] = useState({
    lowStockThreshold: 5,
    reorderThreshold: 3,
    targetProfitMargin: 30,
    minimumOrderValue: 50
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Check if we have a token (even if user data is not fully loaded yet)
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }
        
        const response = await axios.get(`${API_URL}/api/sellers/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setStats(response.data.data);
          
          // Set threshold settings if available from the API
          if (response.data.data.thresholds) {
            setThresholdSettings(response.data.data.thresholds);
          }
          
          // Calculate profile completion if user data is available
          if (user) {
            let completedFields = 0;
            let totalFields = 6; // Total number of seller profile fields

            if (user.businessName) completedFields++;
            if (user.businessDescription) completedFields++;
            if (user.businessWebsite) completedFields++;
            if (user.businessEstablishedYear) completedFields++;
            if (user.businessAddress?.city && user.businessAddress?.country) completedFields++;
            if (user.sellerProfile?.specialties && user.sellerProfile.specialties.length > 0) completedFields++;

            setProfileCompletionPercent(Math.round((completedFields / totalFields) * 100));
          }
        }
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    // Check if we have a token in local storage regardless of authentication state
    const token = localStorage.getItem('token');
    if (token) {
      fetchDashboardData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, user, authLoading]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const getBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="star-rating">
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} color={i < Math.round(rating) ? '#ffc107' : '#e4e5e9'} />
        ))}
        <span className="ms-2">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // New utility functions
  const handleUpdateInventory = async (productId: string, newQuantity: number) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(`${API_URL}/api/sellers/inventory/${productId}`, 
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success && stats) {
        // Refresh dashboard data
        const updatedStats = { ...stats } as DashboardStats;
        if (updatedStats.inventory) {
          const productIndex = updatedStats.inventory.findIndex(item => item.product._id === productId);
          if (productIndex !== -1) {
            updatedStats.inventory[productIndex].quantity = newQuantity;
            
            // Update status based on threshold
            if (newQuantity <= 0) {
              updatedStats.inventory[productIndex].status = 'Out of Stock';
            } else if (newQuantity <= thresholdSettings.lowStockThreshold) {
              updatedStats.inventory[productIndex].status = 'Low Stock';
            } else {
              updatedStats.inventory[productIndex].status = 'In Stock';
            }
            
            setStats(updatedStats);
          }
        }
        setShowInventoryModal(false);
      }
    } catch (err) {
      console.error('Error updating inventory:', err);
    }
  };
  
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(`${API_URL}/api/sellers/orders/${orderId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success && stats) {
        // Refresh dashboard data
        const updatedStats = { ...stats } as DashboardStats;
        if (updatedStats.recentOrders) {
          const orderIndex = updatedStats.recentOrders.findIndex(order => order._id === orderId);
          if (orderIndex !== -1) {
            updatedStats.recentOrders[orderIndex].status = newStatus;
            setStats(updatedStats);
          }
        }
        setShowOrderModal(false);
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };
  
  const handleSaveThresholds = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(`${API_URL}/api/sellers/settings/thresholds`, 
        thresholdSettings,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setShowThresholdModal(false);
      }
    } catch (err) {
      console.error('Error saving threshold settings:', err);
    }
  };
  
  const getInventoryStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in stock': return 'success';
      case 'low stock': return 'warning';
      case 'out of stock': return 'danger';
      default: return 'secondary';
    }
  };

  // Redirect if user is not authenticated or not a seller
  if (authLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading your dashboard...</p>
      </Container>
    );
  }

  // Only redirect if we're sure authentication has completed and user is not authenticated
  if (!authLoading && !isAuthenticated && !localStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  }

  // Only check user role if user object exists
  if (!authLoading && isAuthenticated && user && user.role !== 'seller') {
    return <Navigate to="/" replace />;
  }

  return (
    <Container fluid className="seller-dashboard py-4">
      <SellerNavbar />
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center">
            <MdDashboard size={30} className="text-primary me-2" />
            <h1 className="mb-0">Seller Dashboard</h1>
          </div>
          <p className="text-muted">Welcome back, {user?.businessName || user?.name || 'Seller'}</p>
        </Col>
        <Col xs="auto">
          <Link to="/seller/products/new" className="me-2">
            <Button variant="primary">
              <FaPlus className="me-2" /> Add New Product
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline-secondary">
              Back to Website
            </Button>
          </Link>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading your dashboard data...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          <Row>
            <Col md={3} lg={2}>
              <SellerSidebar />
            </Col>
            <Col md={9} lg={10}>
              {/* Tab Navigation */}
              <Tabs
                id="seller-dashboard-tabs"
                activeKey={activeTab}
                onSelect={(k) => k && setActiveTab(k)}
                className="mb-4"
              >
                {/* Dashboard Tab */}
                <Tab eventKey="dashboard" title={
                  <Link to="/seller/dashboard" className="text-decoration-none text-reset">Dashboard</Link>
                }>
                  {!loading && !error && stats && (
                    <>
                      {/* Profile Completion Card */}
                      <Card className="mb-4 border-0 shadow-sm">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h5 className="mb-0">Profile Completion</h5>
                            <Link to="/seller/profile">Complete Profile</Link>
                          </div>
                          <ProgressBar 
                            now={profileCompletionPercent} 
                            label={`${profileCompletionPercent}%`} 
                            variant={profileCompletionPercent < 50 ? "warning" : profileCompletionPercent < 100 ? "info" : "success"} 
                          />
                          {profileCompletionPercent < 100 && (
                            <p className="text-muted mt-2 small">
                              Complete your profile to increase visibility and trust with buyers
                            </p>
                          )}
                        </Card.Body>
                      </Card>

                      {/* Stats Cards */}
                      <Row className="mb-4">
                        <Col md={3} sm={6} className="mb-3 mb-md-0">
                          <Card className="h-100 border-0 shadow-sm">
                            <Card.Body className="d-flex align-items-center">
                              <div className="stat-icon bg-primary-light text-primary">
                                <FaChartLine size={24} />
                              </div>
                              <div className="ms-3">
                                <h6 className="mb-0 text-muted">Total Sales</h6>
                                <h3 className="mb-0">${stats?.totalSales.toFixed(2) || '0.00'}</h3>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col md={3} sm={6} className="mb-3 mb-md-0">
                          <Card className="h-100 border-0 shadow-sm">
                            <Card.Body className="d-flex align-items-center">
                              <div className="stat-icon bg-warning-light text-warning">
                                <FaClipboardList size={24} />
                              </div>
                              <div className="ms-3">
                                <h6 className="mb-0 text-muted">Pending Orders</h6>
                                <h3 className="mb-0">{stats?.pendingOrders || 0}</h3>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col md={3} sm={6} className="mb-3 mb-md-0">
                          <Card className="h-100 border-0 shadow-sm">
                            <Card.Body className="d-flex align-items-center">
                              <div className="stat-icon bg-success-light text-success">
                                <FaBox size={24} />
                              </div>
                              <div className="ms-3">
                                <h6 className="mb-0 text-muted">Active Listings</h6>
                                <h3 className="mb-0">{stats?.activeListings || 0}</h3>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col md={3} sm={6}>
                          <Card className="h-100 border-0 shadow-sm">
                            <Card.Body className="d-flex align-items-center">
                              <div className="stat-icon bg-info-light text-info">
                                <FaUsers size={24} />
                              </div>
                              <div className="ms-3">
                                <h6 className="mb-0 text-muted">Total Customers</h6>
                                <h3 className="mb-0">{stats?.totalCustomers || 0}</h3>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>

                      {/* Recent Orders */}
                      <Row className="mb-4">
                        <Col lg={8} className="mb-4 mb-lg-0">
                          <Card className="h-100 border-0 shadow-sm">
                            <Card.Header className="bg-white border-0 py-3">
                              <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Recent Orders</h5>
                                <Link to="/seller/orders">View All</Link>
                              </div>
                            </Card.Header>
                            <Card.Body className="p-0">
                              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                                <Table responsive hover className="mb-0">
                                  <thead>
                                    <tr>
                                      <th>Order ID</th>
                                      <th>Product</th>
                                      <th>Customer</th>
                                      <th>Amount</th>
                                      <th>Status</th>
                                      <th>Date</th>
                                      <th>Action</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {stats.recentOrders.map(order => (
                                      <tr key={order._id}>
                                        <td>
                                          <Link to={`/seller/orders/${order._id}`}>
                                            #{order._id.substring(0, 8)}
                                          </Link>
                                        </td>
                                        <td>{order.product.title}</td>
                                        <td>{order.buyer.name}</td>
                                        <td>${order.totalAmount.toFixed(2)}</td>
                                        <td>
                                          <Badge bg={getBadgeColor(order.status)}>
                                            {order.status}
                                          </Badge>
                                        </td>
                                        <td>{formatDate(order.createdAt)}</td>
                                        <td>
                                          <Button 
                                            variant="outline-primary" 
                                            size="sm"
                                            onClick={() => {
                                              setSelectedOrder(order);
                                              setShowOrderModal(true);
                                            }}
                                          >
                                            Update
                                          </Button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </Table>
                              ) : (
                                <div className="text-center py-4">
                                  <p className="mb-0">No recent orders found</p>
                                </div>
                              )}
                            </Card.Body>
                          </Card>
                        </Col>

                        {/* Top Products */}
                        <Col lg={4}>
                          <Card className="h-100 border-0 shadow-sm">
                            <Card.Header className="bg-white border-0 py-3">
                              <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Top Products</h5>
                                <Link to="/seller/products">View All</Link>
                              </div>
                            </Card.Header>
                            <Card.Body className="p-0">
                              {stats?.topProducts && stats.topProducts.length > 0 ? (
                                <div className="product-list">
                                  {stats.topProducts.map(product => (
                                    <div key={product._id} className="product-item d-flex align-items-center p-3 border-bottom">
                                      <img 
                                        src={product.thumbnail || '/placeholder-product.png'} 
                                        alt={product.title} 
                                        className="product-thumbnail" 
                                      />
                                      <div className="ms-3 flex-grow-1">
                                        <h6 className="mb-0">
                                          <Link to={`/seller/products/${product._id}`}>
                                            {product.title}
                                          </Link>
                                        </h6>
                                        <div className="d-flex justify-content-between mt-1">
                                          <span className="text-muted small">${product.price.toFixed(2)}</span>
                                          <span className="text-success small">{product.salesCount} sales</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-4">
                                  <p className="mb-0">No products found</p>
                                </div>
                              )}
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>

                      {/* Monthly Revenue Chart */}
                      <Row className="mb-4">
                        <Col>
                          <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-white border-0 py-3">
                              <h5 className="mb-0">Monthly Revenue</h5>
                            </Card.Header>
                            <Card.Body>
                              {stats?.monthlyRevenue && stats.monthlyRevenue.length > 0 ? (
                                <div className="chart-container">
                                  {/* Simplified chart visualization using bars */}
                                  <div className="d-flex align-items-end" style={{ height: '200px' }}>
                                    {stats.monthlyRevenue.map((item, index) => {
                                      const maxRevenue = Math.max(...stats.monthlyRevenue.map(i => i.revenue));
                                      const height = (item.revenue / maxRevenue) * 100;
                                      
                                      return (
                                        <div key={index} className="bar-chart-column">
                                          <div 
                                            className="bg-primary" 
                                            style={{ 
                                              height: `${Math.max(height, 5)}%`,
                                              width: '30px',
                                              margin: '0 10px'
                                            }}
                                          ></div>
                                          <div className="text-center mt-2 small">
                                            <div>{item.month}</div>
                                            <div>${item.revenue.toFixed(0)}</div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-4">
                                  <p className="mb-0">No revenue data available</p>
                                </div>
                              )}
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>

                      {/* Quick Actions */}
                      <Row>
                        <Col>
                          <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-white border-0 py-3">
                              <h5 className="mb-0">Quick Actions</h5>
                            </Card.Header>
                            <Card.Body>
                              <div className="d-flex flex-wrap">
                                <Link to="/seller/products/new" className="quick-action-link">
                                  <div className="quick-action-item text-center p-3">
                                    <div className="quick-action-icon bg-primary-light text-primary mb-2">
                                      <FaPlus />
                                    </div>
                                    <div>Add Product</div>
                                  </div>
                                </Link>
                                
                                <Link to="/seller/orders" className="quick-action-link">
                                  <div className="quick-action-item text-center p-3">
                                    <div className="quick-action-icon bg-warning-light text-warning mb-2">
                                      <FaClipboardList />
                                    </div>
                                    <div>Manage Orders</div>
                                  </div>
                                </Link>
                                
                                <Link to="/seller/profile" className="quick-action-link">
                                  <div className="quick-action-item text-center p-3">
                                    <div className="quick-action-icon bg-info-light text-info mb-2">
                                      <FaStore />
                                    </div>
                                    <div>Edit Profile</div>
                                  </div>
                                </Link>
                                
                                <div 
                                  onClick={() => setShowThresholdModal(true)} 
                                  className="quick-action-link"
                                  style={{ cursor: 'pointer' }}
                                >
                                  <div className="quick-action-item text-center p-3">
                                    <div className="quick-action-icon bg-success-light text-success mb-2">
                                      <FaWrench />
                                    </div>
                                    <div>Threshold Settings</div>
                                  </div>
                                </div>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                    </>
                  )}
                </Tab>
                
                {/* Inventory Tab */}
                <Tab eventKey="inventory" title={
                  <Link to="/seller/inventory" className="text-decoration-none text-reset">Inventory Management</Link>
                }>
                  <Row className="mb-4">
                    <Col>
                      <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-0 py-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Inventory Overview</h5>
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => setShowThresholdModal(true)}
                            >
                              <FaWrench className="me-1" /> Configure Thresholds
                            </Button>
                          </div>
                        </Card.Header>
                        <Card.Body>
                          <Row className="mb-4">
                            <Col md={4}>
                              <Card className="border-0 bg-light h-100">
                                <Card.Body className="text-center">
                                  <FaBoxOpen size={30} className="text-success mb-3" />
                                  <h4>{stats?.inventory?.filter(i => i.status === 'In Stock').length || 0}</h4>
                                  <p className="mb-0">In Stock Products</p>
                                </Card.Body>
                              </Card>
                            </Col>
                            <Col md={4}>
                              <Card className="border-0 bg-light h-100">
                                <Card.Body className="text-center">
                                  <FaExclamationTriangle size={30} className="text-warning mb-3" />
                                  <h4>{stats?.inventory?.filter(i => i.status === 'Low Stock').length || 0}</h4>
                                  <p className="mb-0">Low Stock Products</p>
                                </Card.Body>
                              </Card>
                            </Col>
                            <Col md={4}>
                              <Card className="border-0 bg-light h-100">
                                <Card.Body className="text-center">
                                  <MdNotificationsActive size={30} className="text-danger mb-3" />
                                  <h4>{stats?.inventory?.filter(i => i.status === 'Out of Stock').length || 0}</h4>
                                  <p className="mb-0">Out of Stock Products</p>
                                </Card.Body>
                              </Card>
                            </Col>
                          </Row>
                          
                          <div className="mb-3">
                            <strong>Current Thresholds:</strong>
                            <ul className="mt-2">
                              <li>Low Stock Alert: Below {thresholdSettings.lowStockThreshold} units</li>
                              <li>Reorder Point: Below {thresholdSettings.reorderThreshold} units</li>
                              <li>Target Profit Margin: {thresholdSettings.targetProfitMargin}%</li>
                              <li>Minimum Order Value: ${thresholdSettings.minimumOrderValue}</li>
                            </ul>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col>
                      <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-0 py-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Product Inventory</h5>
                            <Link to="/seller/products/new">
                              <Button variant="primary" size="sm">
                                <FaPlus className="me-1" /> Add New Product
                              </Button>
                            </Link>
                          </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                          {stats?.inventory && stats.inventory.length > 0 ? (
                            <Table responsive hover className="mb-0">
                              <thead>
                                <tr>
                                  <th>Product</th>
                                  <th>Stock Quantity</th>
                                  <th>Status</th>
                                  <th>Low Stock Threshold</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {stats.inventory.map(item => (
                                  <tr key={item._id}>
                                    <td>
                                      <div className="d-flex align-items-center">
                                        <img 
                                          src={item.product.thumbnail || '/placeholder-product.png'} 
                                          alt={item.product.title} 
                                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                          className="me-2"
                                        />
                                        <div>
                                          <Link to={`/seller/products/${item.product._id}`}>
                                            {item.product.title}
                                          </Link>
                                        </div>
                                      </div>
                                    </td>
                                    <td>{item.quantity}</td>
                                    <td>
                                      <Badge bg={getInventoryStatusColor(item.status)}>
                                        {item.status}
                                      </Badge>
                                    </td>
                                    <td>{item.lowStockThreshold || thresholdSettings.lowStockThreshold}</td>
                                    <td>
                                      <Button 
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedProduct(item);
                                          setShowInventoryModal(true);
                                        }}
                                      >
                                        Update Stock
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          ) : (
                            <div className="text-center py-4">
                              <p className="mb-0">No inventory data available</p>
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Tab>
                
                {/* Orders Tab */}
                <Tab eventKey="orders" title={
                  <Link to="/seller/orders" className="text-decoration-none text-reset">Order Management</Link>
                }>
                  {!loading && !error && stats && (
                    <>
                      <Row className="mb-4">
                        <Col>
                          <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-white border-0 py-3">
                              <h5 className="mb-0">Order Status Overview</h5>
                            </Card.Header>
                            <Card.Body>
                              <Row>
                                {stats.ordersByStatus?.map((statusItem, index) => (
                                  <Col md={2} sm={4} xs={6} key={index} className="mb-3">
                                    <Card className="border-0 bg-light h-100">
                                      <Card.Body className="text-center">
                                        <Badge 
                                          bg={getBadgeColor(statusItem.status)}
                                          className="p-2 mb-2"
                                          style={{ fontSize: '1rem' }}
                                        >
                                          {statusItem.status}
                                        </Badge>
                                        <h3>{statusItem.count}</h3>
                                        <p className="mb-0 small">Orders</p>
                                      </Card.Body>
                                    </Card>
                                  </Col>
                                )) || [
                                  { status: 'Pending', count: 0 },
                                  { status: 'Processing', count: 0 },
                                  { status: 'Shipped', count: 0 },
                                  { status: 'Delivered', count: 0 },
                                  { status: 'Cancelled', count: 0 }
                                ].map((statusItem, index) => (
                                  <Col md={2} sm={4} xs={6} key={index} className="mb-3">
                                    <Card className="border-0 bg-light h-100">
                                      <Card.Body className="text-center">
                                        <Badge 
                                          bg={getBadgeColor(statusItem.status)}
                                          className="p-2 mb-2"
                                          style={{ fontSize: '1rem' }}
                                        >
                                          {statusItem.status}
                                        </Badge>
                                        <h3>{statusItem.count}</h3>
                                        <p className="mb-0 small">Orders</p>
                                      </Card.Body>
                                    </Card>
                                  </Col>
                                ))}
                              </Row>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                      
                      <Row className="mb-4">
                        <Col>
                          <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-white border-0 py-3">
                              <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Recent Orders</h5>
                                <div>
                                  <Form.Select className="d-inline-block me-2" style={{ width: 'auto' }}>
                                    <option value="all">All Orders</option>
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                  </Form.Select>
                                  <Link to="/seller/orders">
                                    <Button variant="outline-primary" size="sm">
                                      View All Orders
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </Card.Header>
                            <Card.Body className="p-0">
                              <Table responsive hover className="mb-0">
                                <thead>
                                  <tr>
                                    <th>Order ID</th>
                                    <th>Date</th>
                                    <th>Product</th>
                                    <th>Customer</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {stats.recentOrders && stats.recentOrders.length > 0 ? (
                                    stats.recentOrders.map(order => (
                                      <tr key={order._id}>
                                        <td>
                                          <Link to={`/seller/orders/${order._id}`}>
                                            #{order._id.substring(0, 8)}
                                          </Link>
                                        </td>
                                        <td>{formatDate(order.createdAt)}</td>
                                        <td>{order.product.title}</td>
                                        <td>{order.buyer.name}</td>
                                        <td>${order.totalAmount.toFixed(2)}</td>
                                        <td>
                                          <Badge bg={getBadgeColor(order.status)}>
                                            {order.status}
                                          </Badge>
                                        </td>
                                        <td>
                                          <div className="d-flex gap-2">
                                            <Button 
                                              variant="outline-primary" 
                                              size="sm"
                                              onClick={() => {
                                                setSelectedOrder(order);
                                                setShowOrderModal(true);
                                              }}
                                            >
                                              Update
                                            </Button>
                                            <Link to={`/seller/orders/${order._id}`}>
                                              <Button variant="outline-secondary" size="sm">
                                                Details
                                              </Button>
                                            </Link>
                                          </div>
                                        </td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan={7} className="text-center py-4">
                                        No orders found
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </Table>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                      
                      <Row>
                        <Col>
                          <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-white border-0 py-3">
                              <h5 className="mb-0">Order Processing Tips</h5>
                            </Card.Header>
                            <Card.Body>
                              <Row>
                                <Col md={4} className="mb-3 mb-md-0">
                                  <Card className="border-0 bg-light h-100">
                                    <Card.Body>
                                      <h5 className="card-title">Order Fulfillment</h5>
                                      <ul className="ps-3">
                                        <li>Process orders within 24 hours of receipt</li>
                                        <li>Update order status promptly</li>
                                        <li>Communicate with customers about delays</li>
                                        <li>Provide tracking information when available</li>
                                      </ul>
                                    </Card.Body>
                                  </Card>
                                </Col>
                                <Col md={4} className="mb-3 mb-md-0">
                                  <Card className="border-0 bg-light h-100">
                                    <Card.Body>
                                      <h5 className="card-title">Quality Control</h5>
                                      <ul className="ps-3">
                                        <li>Double-check measurements before production</li>
                                        <li>Inspect all items before shipping</li>
                                        <li>Include detailed care instructions</li>
                                        <li>Pack items securely to prevent damage</li>
                                      </ul>
                                    </Card.Body>
                                  </Card>
                                </Col>
                                <Col md={4}>
                                  <Card className="border-0 bg-light h-100">
                                    <Card.Body>
                                      <h5 className="card-title">Customer Satisfaction</h5>
                                      <ul className="ps-3">
                                        <li>Follow up after delivery</li>
                                        <li>Address concerns immediately</li>
                                        <li>Offer fair return and exchange policies</li>
                                        <li>Request reviews from satisfied customers</li>
                                      </ul>
                                    </Card.Body>
                                  </Card>
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                    </>
                  )}
                </Tab>
                
                {/* Settings Tab */}
                <Tab eventKey="settings" title={
                  <Link to="/seller/settings" className="text-decoration-none text-reset">Business Settings</Link>
                }>
                  {!loading && !error && stats && (
                    <>
                      <Row className="mb-4">
                        <Col lg={6} className="mb-4 mb-lg-0">
                          <Card className="border-0 shadow-sm h-100">
                            <Card.Header className="bg-white border-0 py-3">
                              <h5 className="mb-0">Threshold Settings</h5>
                            </Card.Header>
                            <Card.Body>
                              <div className="mb-4">
                                <h6 className="mb-3">Current Thresholds</h6>
                                <Table className="border">
                                  <tbody>
                                    <tr>
                                      <th className="bg-light">Low Stock Alert</th>
                                      <td>{thresholdSettings.lowStockThreshold} units</td>
                                    </tr>
                                    <tr>
                                      <th className="bg-light">Reorder Point</th>
                                      <td>{thresholdSettings.reorderThreshold} units</td>
                                    </tr>
                                    <tr>
                                      <th className="bg-light">Target Profit Margin</th>
                                      <td>{thresholdSettings.targetProfitMargin}%</td>
                                    </tr>
                                    <tr>
                                      <th className="bg-light">Minimum Order Value</th>
                                      <td>${thresholdSettings.minimumOrderValue}</td>
                                    </tr>
                                  </tbody>
                                </Table>
                              </div>
                              
                              <Button 
                                variant="primary" 
                                onClick={() => setShowThresholdModal(true)}
                              >
                                <FaWrench className="me-2" /> Customize Thresholds
                              </Button>
                            </Card.Body>
                          </Card>
                        </Col>
                        
                        <Col lg={6}>
                          <Card className="border-0 shadow-sm h-100">
                            <Card.Header className="bg-white border-0 py-3">
                              <h5 className="mb-0">Business Profile</h5>
                            </Card.Header>
                            <Card.Body>
                              <div className="d-flex align-items-center mb-4">
                                <div className="profile-avatar me-3">
                                  <div 
                                    className="rounded-circle bg-primary d-flex align-items-center justify-content-center"
                                    style={{ width: '60px', height: '60px', color: 'white' }}
                                  >
                                    <FaStore size={24} />
                                  </div>
                                </div>
                                <div>
                                  <h5 className="mb-1">{user?.businessName || user?.name}</h5>
                                  <div className="mb-2 text-muted small">
                                    Seller Profile
                                  </div>
                                  <div>
                                    {renderStarRating(stats?.sellerRating || 0)}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mb-4">
                                <h6 className="mb-2">Profile Completion</h6>
                                <ProgressBar 
                                  now={profileCompletionPercent} 
                                  label={`${profileCompletionPercent}%`} 
                                  variant={profileCompletionPercent < 50 ? "warning" : profileCompletionPercent < 100 ? "info" : "success"} 
                                />
                              </div>
                              
                              <Link to="/seller/profile">
                                <Button variant="outline-primary">
                                  <FaStore className="me-2" /> Edit Business Profile
                                </Button>
                              </Link>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                    </>
                  )}
                </Tab>
              </Tabs>

              {/* Inventory Modal */}
              <Modal show={showInventoryModal} onHide={() => setShowInventoryModal(false)}>
                <Modal.Header closeButton>
                  <Modal.Title>Update Inventory</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {selectedProduct && (
                    <div>
                      <div className="d-flex align-items-center mb-3">
                        <img 
                          src={selectedProduct.product?.thumbnail || '/placeholder-product.png'} 
                          alt={selectedProduct.product?.title} 
                          className="product-thumbnail me-3" 
                          style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                        />
                        <h5 className="mb-0">{selectedProduct.product?.title}</h5>
                      </div>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Current Quantity</Form.Label>
                        <Form.Control 
                          type="number" 
                          min="0"
                          value={selectedProduct.quantity} 
                          onChange={(e) => setSelectedProduct({
                            ...selectedProduct,
                            quantity: parseInt(e.target.value)
                          })}
                        />
                      </Form.Group>
                      
                      <div className="mb-3">
                        <strong>Low Stock Threshold:</strong> {thresholdSettings.lowStockThreshold} units
                      </div>
                      
                      <div className="mb-3">
                        <strong>Status:</strong>{' '}
                        <Badge bg={getInventoryStatusColor(selectedProduct.status)}>
                          {selectedProduct.status}
                        </Badge>
                      </div>
                    </div>
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowInventoryModal(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={() => selectedProduct && 
                      handleUpdateInventory(selectedProduct.product._id, selectedProduct.quantity)}
                  >
                    Update Inventory
                  </Button>
                </Modal.Footer>
              </Modal>
              
              {/* Order Status Modal */}
              <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)}>
                <Modal.Header closeButton>
                  <Modal.Title>Update Order Status</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {selectedOrder && (
                    <div>
                      <div className="mb-3">
                        <strong>Order ID:</strong> #{selectedOrder._id.substring(0, 8)}
                      </div>
                      <div className="mb-3">
                        <strong>Product:</strong> {selectedOrder.product?.title}
                      </div>
                      <div className="mb-3">
                        <strong>Customer:</strong> {selectedOrder.buyer?.name}
                      </div>
                      <div className="mb-3">
                        <strong>Amount:</strong> ${selectedOrder.totalAmount?.toFixed(2)}
                      </div>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Order Status</Form.Label>
                        <Form.Select 
                          value={selectedOrder.status} 
                          onChange={(e) => setSelectedOrder({
                            ...selectedOrder,
                            status: e.target.value
                          })}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </Form.Select>
                      </Form.Group>
                    </div>
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowOrderModal(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={() => selectedOrder && 
                      handleUpdateOrderStatus(selectedOrder._id, selectedOrder.status)}
                  >
                    Update Status
                  </Button>
                </Modal.Footer>
              </Modal>
              
              {/* Threshold Settings Modal */}
              <Modal show={showThresholdModal} onHide={() => setShowThresholdModal(false)}>
                <Modal.Header closeButton>
                  <Modal.Title>Threshold Settings</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Low Stock Threshold</Form.Label>
                      <Form.Control 
                        type="number" 
                        min="1"
                        value={thresholdSettings.lowStockThreshold} 
                        onChange={(e) => setThresholdSettings({
                          ...thresholdSettings,
                          lowStockThreshold: parseInt(e.target.value)
                        })}
                      />
                      <Form.Text className="text-muted">
                        Products with inventory below this value will be marked as "Low Stock"
                      </Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Reorder Threshold</Form.Label>
                      <Form.Control 
                        type="number" 
                        min="1"
                        value={thresholdSettings.reorderThreshold} 
                        onChange={(e) => setThresholdSettings({
                          ...thresholdSettings,
                          reorderThreshold: parseInt(e.target.value)
                        })}
                      />
                      <Form.Text className="text-muted">
                        You'll receive alerts when inventory reaches this threshold
                      </Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Target Profit Margin (%)</Form.Label>
                      <Form.Control 
                        type="number" 
                        min="1" 
                        max="100"
                        value={thresholdSettings.targetProfitMargin} 
                        onChange={(e) => setThresholdSettings({
                          ...thresholdSettings,
                          targetProfitMargin: parseInt(e.target.value)
                        })}
                      />
                      <Form.Text className="text-muted">
                        Your target profit margin percentage for products
                      </Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Minimum Order Value ($)</Form.Label>
                      <Form.Control 
                        type="number" 
                        min="0"
                        value={thresholdSettings.minimumOrderValue} 
                        onChange={(e) => setThresholdSettings({
                          ...thresholdSettings,
                          minimumOrderValue: parseInt(e.target.value)
                        })}
                      />
                      <Form.Text className="text-muted">
                        Minimum total order value to meet your profitability goals
                      </Form.Text>
                    </Form.Group>
                  </Form>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowThresholdModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleSaveThresholds}>
                    Save Settings
                  </Button>
                </Modal.Footer>
              </Modal>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default SellerDashboard; 