import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Row, Col, Card, Badge, Button, Table,
  ProgressBar, Spinner, Alert, Tab, Tabs
} from 'react-bootstrap';
import { FaBox, FaChartLine, FaClipboardList, FaUsers, FaStar, FaStore, FaPlus } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import { format } from 'date-fns';
import { API_URL } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';
import './Dashboard.css';

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
}

const SellerDashboard: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [profileCompletionPercent, setProfileCompletionPercent] = useState<number>(0);

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
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center">
            <MdDashboard size={30} className="text-primary me-2" />
            <h1 className="mb-0">Seller Dashboard</h1>
          </div>
          <p className="text-muted">Welcome back, {user?.businessName || user?.name || 'Seller'}</p>
        </Col>
        <Col xs="auto">
          <Link to="/seller/products/new">
            <Button variant="primary">
              <FaPlus className="me-2" /> Add New Product
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
                    <Link to="/seller/products" className="quick-action-link">
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
                    
                    <Link to="/seller/analytics" className="quick-action-link">
                      <div className="quick-action-item text-center p-3">
                        <div className="quick-action-icon bg-success-light text-success mb-2">
                          <FaChartLine />
                        </div>
                        <div>View Analytics</div>
                      </div>
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default SellerDashboard; 