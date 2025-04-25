import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Row, Col, Card, Table, Button, Spinner, Alert, Tabs, Tab
} from 'react-bootstrap';
import { 
  FaChartLine, FaChartBar, FaChartPie, FaUsers, 
  FaBoxOpen, FaMoneyBillWave, FaCalendarAlt
} from 'react-icons/fa';
import { API_URL } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';

interface SalesSummary {
  totalSales: number;
  orderCount: number;
  averageOrderValue: number;
  pendingAmount: number;
  averageRating: number;
  reviewCount: number;
}

interface MonthlyData {
  _id: string;
  sales: number;
  orders: number;
}

interface PopularProduct {
  listingId: string;
  title: string;
  mainPhoto: string;
  totalOrders: number;
  totalRevenue: number;
}

interface CustomerAnalytics {
  topCustomers: {
    buyerId: string;
    name: string;
    email: string;
    orderCount: number;
    totalSpent: number;
    firstOrder: string;
    lastOrder: string;
    daysSinceLastOrder: number;
  }[];
  retention: {
    totalCustomers: number;
    repeatCustomers: number;
    repeatCustomerPercentage: number;
  };
}

interface PerformanceMetrics {
  orderMetrics: {
    totalOrders: number;
    totalRevenue: number;
    completionRate: number;
    cancellationRate: number;
    ordersByStatus: { _id: string; count: number; revenue: number }[];
  };
  processingTime: {
    average: number;
    min: number;
    max: number;
  };
  ratingMetrics: {
    average: number;
    count: number;
    aspectAverages: {
      quality: number;
      communication: number;
      delivery: number;
      valueForMoney: number;
    };
  };
  categoryPerformance: {
    _id: string;
    revenue: number;
    orders: number;
    averageOrderValue: number;
  }[];
}

const SellerAnalytics: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // State variables
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Analytics data state
  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [popularProducts, setPopularProducts] = useState<PopularProduct[]>([]);
  const [customerData, setCustomerData] = useState<CustomerAnalytics | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceMetrics | null>(null);
  
  // Fetch dashboard summary data
  const fetchSummaryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/api/analytics/seller/summary`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setSalesSummary(response.data.data.summary);
        setMonthlyData(response.data.data.monthlyData);
        setPopularProducts(response.data.data.popularListings);
      } else {
        setError('Failed to fetch analytics data');
      }
    } catch (err: any) {
      console.error('Error fetching analytics data:', err);
      setError(err.response?.data?.message || 'An error occurred while fetching analytics data');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch customer analytics
  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/api/analytics/seller/customers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setCustomerData(response.data.data);
      } else {
        setError('Failed to fetch customer analytics data');
      }
    } catch (err: any) {
      console.error('Error fetching customer data:', err);
      setError(err.response?.data?.message || 'An error occurred while fetching customer data');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch performance metrics
  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/api/analytics/seller/performance?period=${period}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setPerformanceData(response.data.data);
      } else {
        setError('Failed to fetch performance metrics');
      }
    } catch (err: any) {
      console.error('Error fetching performance data:', err);
      setError(err.response?.data?.message || 'An error occurred while fetching performance data');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    if (isAuthenticated && user?.role === 'seller') {
      fetchSummaryData();
    } else if (isAuthenticated && user?.role !== 'seller') {
      navigate('/unauthorized');
    }
  }, [isAuthenticated, user, navigate]);
  
  // Fetch tab-specific data when tab changes
  useEffect(() => {
    if (isAuthenticated && user?.role === 'seller') {
      if (activeTab === 'customers') {
        fetchCustomerData();
      } else if (activeTab === 'performance') {
        fetchPerformanceData();
      }
    }
  }, [activeTab, isAuthenticated, user]);
  
  // Fetch new performance data when period changes
  useEffect(() => {
    if (isAuthenticated && user?.role === 'seller' && activeTab === 'performance') {
      fetchPerformanceData();
    }
  }, [period, activeTab, isAuthenticated, user]);
  
  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return '$' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Render loading spinner
  if (loading && !salesSummary) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading analytics data...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <h1 className="mb-4">Seller Analytics</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Tab Navigation */}
      <div className="mb-4">
        <Button 
          variant={activeTab === 'overview' ? 'primary' : 'outline-primary'} 
          className="me-2 mb-2"
          onClick={() => handleTabChange('overview')}
        >
          <FaChartLine className="me-2" />
          Overview
        </Button>
        <Button 
          variant={activeTab === 'customers' ? 'primary' : 'outline-primary'} 
          className="me-2 mb-2"
          onClick={() => handleTabChange('customers')}
        >
          <FaUsers className="me-2" />
          Customers
        </Button>
        <Button 
          variant={activeTab === 'performance' ? 'primary' : 'outline-primary'} 
          className="me-2 mb-2"
          onClick={() => handleTabChange('performance')}
        >
          <FaChartBar className="me-2" />
          Performance
        </Button>
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && salesSummary && (
        <>
          {/* Summary Cards */}
          <Row className="mb-4">
            <Col lg={3} md={6} className="mb-3">
              <Card className="h-100">
                <Card.Body className="d-flex align-items-center">
                  <div className="p-3 bg-primary bg-opacity-10 rounded me-3">
                    <FaMoneyBillWave className="text-primary" size={24} />
                  </div>
                  <div>
                    <div className="text-muted small">Total Sales</div>
                    <h3 className="mb-0">{formatCurrency(salesSummary.totalSales)}</h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={3} md={6} className="mb-3">
              <Card className="h-100">
                <Card.Body className="d-flex align-items-center">
                  <div className="p-3 bg-success bg-opacity-10 rounded me-3">
                    <FaBoxOpen className="text-success" size={24} />
                  </div>
                  <div>
                    <div className="text-muted small">Total Orders</div>
                    <h3 className="mb-0">{salesSummary.orderCount}</h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={3} md={6} className="mb-3">
              <Card className="h-100">
                <Card.Body className="d-flex align-items-center">
                  <div className="p-3 bg-info bg-opacity-10 rounded me-3">
                    <FaChartPie className="text-info" size={24} />
                  </div>
                  <div>
                    <div className="text-muted small">Average Order</div>
                    <h3 className="mb-0">{formatCurrency(salesSummary.totalSales / (salesSummary.orderCount || 1))}</h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={3} md={6} className="mb-3">
              <Card className="h-100">
                <Card.Body className="d-flex align-items-center">
                  <div className="p-3 bg-warning bg-opacity-10 rounded me-3">
                    <FaUsers className="text-warning" size={24} />
                  </div>
                  <div>
                    <div className="text-muted small">Seller Rating</div>
                    <h3 className="mb-0">{salesSummary.averageRating.toFixed(1)} ★</h3>
                    <small className="text-muted">({salesSummary.reviewCount} reviews)</small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Popular Products */}
          <Card className="mb-4">
            <Card.Header className="bg-transparent">
              <h5 className="mb-0">Top Selling Products</h5>
            </Card.Header>
            <Card.Body>
              {popularProducts.length === 0 ? (
                <p className="text-center py-4 text-muted">No sales data available yet</p>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Orders</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {popularProducts.map(product => (
                      <tr key={product.listingId}>
                        <td>
                          <div className="d-flex align-items-center">
                            {product.mainPhoto && (
                              <img
                                src={`${API_URL}/uploads/${product.mainPhoto}`}
                                alt={product.title}
                                style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px' }}
                              />
                            )}
                            <div className="text-truncate" style={{ maxWidth: '300px' }}>
                              {product.title}
                            </div>
                          </div>
                        </td>
                        <td>{product.totalOrders}</td>
                        <td>{formatCurrency(product.totalRevenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
          
          {/* Sales Trend */}
          <Card>
            <Card.Header className="bg-transparent">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Monthly Sales Trend</h5>
                <div className="text-muted">
                  <FaCalendarAlt className="me-2" />
                  Last 12 Months
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {monthlyData.length === 0 ? (
                <p className="text-center py-4 text-muted">No sales data available yet</p>
              ) : (
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Orders</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map(month => (
                      <tr key={month._id}>
                        <td>{new Date(month._id + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</td>
                        <td>{month.orders}</td>
                        <td>{formatCurrency(month.sales)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </>
      )}
      
      {/* Customers Tab */}
      {activeTab === 'customers' && customerData && (
        <>
          {/* Customer Retention Card */}
          <Row className="mb-4">
            <Col md={4} className="mb-3 mb-md-0">
              <Card className="h-100">
                <Card.Body className="text-center">
                  <h5>Total Customers</h5>
                  <h2 className="display-4">{customerData.retention.totalCustomers}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-3 mb-md-0">
              <Card className="h-100">
                <Card.Body className="text-center">
                  <h5>Repeat Customers</h5>
                  <h2 className="display-4">{customerData.retention.repeatCustomers}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100">
                <Card.Body className="text-center">
                  <h5>Retention Rate</h5>
                  <h2 className="display-4">{customerData.retention.repeatCustomerPercentage}%</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Top Customers Table */}
          <Card>
            <Card.Header className="bg-transparent">
              <h5 className="mb-0">Top Customers</h5>
            </Card.Header>
            <Card.Body>
              {customerData.topCustomers.length === 0 ? (
                <p className="text-center py-4 text-muted">No customer data available yet</p>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Orders</th>
                      <th>Total Spent</th>
                      <th>First Order</th>
                      <th>Last Order</th>
                      <th>Days Since Last Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerData.topCustomers.map(customer => (
                      <tr key={customer.buyerId}>
                        <td>
                          <div className="d-flex flex-column">
                            <span>{customer.name}</span>
                            <small className="text-muted">{customer.email}</small>
                          </div>
                        </td>
                        <td>{customer.orderCount}</td>
                        <td>{formatCurrency(customer.totalSpent)}</td>
                        <td>{formatDate(customer.firstOrder)}</td>
                        <td>{formatDate(customer.lastOrder)}</td>
                        <td>{customer.daysSinceLastOrder}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </>
      )}
      
      {/* Performance Tab */}
      {activeTab === 'performance' && performanceData && (
        <>
          {/* Time Period Selector */}
          <div className="mb-4">
            <Card>
              <Card.Body>
                <div className="d-flex align-items-center">
                  <span className="me-3">Time Period:</span>
                  <Button 
                    variant={period === '7days' ? 'primary' : 'outline-primary'} 
                    size="sm"
                    className="me-2"
                    onClick={() => setPeriod('7days')}
                  >
                    7 Days
                  </Button>
                  <Button 
                    variant={period === '30days' ? 'primary' : 'outline-primary'} 
                    size="sm"
                    className="me-2"
                    onClick={() => setPeriod('30days')}
                  >
                    30 Days
                  </Button>
                  <Button 
                    variant={period === '90days' ? 'primary' : 'outline-primary'} 
                    size="sm"
                    className="me-2"
                    onClick={() => setPeriod('90days')}
                  >
                    90 Days
                  </Button>
                  <Button 
                    variant={period === '1year' ? 'primary' : 'outline-primary'} 
                    size="sm"
                    className="me-2"
                    onClick={() => setPeriod('1year')}
                  >
                    1 Year
                  </Button>
                  <Button 
                    variant={period === 'all' ? 'primary' : 'outline-primary'} 
                    size="sm"
                    onClick={() => setPeriod('all')}
                  >
                    All Time
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
          
          {/* Performance Metrics */}
          <Row className="mb-4">
            <Col md={3} className="mb-3 mb-md-0">
              <Card className="h-100">
                <Card.Body className="text-center">
                  <h5>Total Revenue</h5>
                  <h2>{formatCurrency(performanceData.orderMetrics.totalRevenue)}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3 mb-md-0">
              <Card className="h-100">
                <Card.Body className="text-center">
                  <h5>Completion Rate</h5>
                  <h2>{performanceData.orderMetrics.completionRate}%</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3 mb-md-0">
              <Card className="h-100">
                <Card.Body className="text-center">
                  <h5>Avg. Processing Time</h5>
                  <h2>{performanceData.processingTime.average} days</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="h-100">
                <Card.Body className="text-center">
                  <h5>Avg. Rating</h5>
                  <h2>{performanceData.ratingMetrics.average.toFixed(1)} ★</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Order Status Breakdown */}
          <Card className="mb-4">
            <Card.Header className="bg-transparent">
              <h5 className="mb-0">Order Status Breakdown</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Count</th>
                    <th>Revenue</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceData.orderMetrics.ordersByStatus.map(status => (
                    <tr key={status._id}>
                      <td>
                        <span className={`badge bg-${
                          status._id === 'completed' ? 'success' :
                          status._id === 'canceled' ? 'danger' :
                          status._id === 'shipped' ? 'primary' :
                          status._id === 'processing' ? 'info' :
                          status._id === 'pending' ? 'warning' : 'secondary'
                        }`}>
                          {status._id.charAt(0).toUpperCase() + status._id.slice(1)}
                        </span>
                      </td>
                      <td>{status.count}</td>
                      <td>{formatCurrency(status.revenue)}</td>
                      <td>
                        {((status.count / performanceData.orderMetrics.totalOrders) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
          
          {/* Category Performance */}
          <Card>
            <Card.Header className="bg-transparent">
              <h5 className="mb-0">Performance by Category</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Orders</th>
                    <th>Revenue</th>
                    <th>Avg. Order Value</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceData.categoryPerformance.map(category => (
                    <tr key={category._id}>
                      <td>{category._id}</td>
                      <td>{category.orders}</td>
                      <td>{formatCurrency(category.revenue)}</td>
                      <td>{formatCurrency(category.averageOrderValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
};

export default SellerAnalytics; 