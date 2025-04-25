import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Row, Col, Card, Table, Button, Form, 
  InputGroup, Badge, Spinner, Alert, Pagination, Modal, Tabs, Tab
} from 'react-bootstrap';
import { 
  FaSearch, FaEye, FaBoxOpen, FaTruck, FaCheckCircle, 
  FaTimesCircle, FaSortAmountDown, FaSortAmountUp, FaShoppingBag
} from 'react-icons/fa';
import { API_URL } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';

interface Order {
  _id: string;
  orderNumber: string;
  buyer: {
    _id: string;
    name: string;
    email: string;
  };
  product: {
    _id: string;
    title: string;
    mainPhoto: string;
  };
  price: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'canceled' | 'refunded';
  shippingAddress: {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  customizations?: Record<string, string>;
  shippingMethod: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderStatusUpdate {
  status: 'processing' | 'shipped' | 'delivered' | 'completed' | 'canceled';
  trackingNumber?: string;
  notes?: string;
}

const OrderManager: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // State for orders and pagination
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // State for order counts
  const [orderCounts, setOrderCounts] = useState({
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    completed: 0,
    canceled: 0,
    all: 0
  });
  
  // State for filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // State for order details and status update
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState<OrderStatusUpdate>({
    status: 'processing',
    trackingNumber: '',
    notes: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  
  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', itemsPerPage.toString());
      queryParams.append('sortBy', sortField);
      queryParams.append('sortDir', sortDirection);
      
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      
      if (selectedStatus && selectedStatus !== 'all') {
        queryParams.append('status', selectedStatus);
      }
      
      if (dateRange.startDate && dateRange.endDate) {
        queryParams.append('startDate', dateRange.startDate);
        queryParams.append('endDate', dateRange.endDate);
      }
      
      const response = await axios.get(`${API_URL}/api/orders/seller?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setOrders(response.data.data.orders);
        setTotalPages(response.data.data.pagination.pages);
        setOrderCounts(response.data.data.counts || {
          pending: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          completed: 0,
          canceled: 0,
          all: 0
        });
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || 'An error occurred while fetching orders');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    if (isAuthenticated && user?.role === 'seller') {
      fetchOrders();
    } else if (isAuthenticated && user?.role !== 'seller') {
      navigate('/unauthorized');
    }
  }, [isAuthenticated, user, navigate]);
  
  // Refetch when filters, sorting, or pagination changes
  useEffect(() => {
    if (isAuthenticated && user?.role === 'seller') {
      fetchOrders();
    }
  }, [page, sortField, sortDirection, selectedStatus, searchTerm]);
  
  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
  };
  
  // Handle filter by date
  const handleDateFilter = () => {
    setPage(1);
    fetchOrders();
  };
  
  // Handle sort column click
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Handle pagination click
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };
  
  // Open order details modal
  const openDetailsModal = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };
  
  // Open status update modal
  const openUpdateModal = (order: Order) => {
    setSelectedOrder(order);
    setStatusUpdate({
      status: getNextStatus(order.status),
      trackingNumber: order.trackingNumber || '',
      notes: ''
    });
    setShowUpdateModal(true);
  };
  
  // Get next logical status based on current status
  const getNextStatus = (currentStatus: string): OrderStatusUpdate['status'] => {
    switch (currentStatus) {
      case 'pending':
        return 'processing';
      case 'processing':
        return 'shipped';
      case 'shipped':
        return 'delivered';
      case 'delivered':
        return 'completed';
      default:
        return 'processing';
    }
  };
  
  // Handle order status update
  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;
    
    try {
      setUpdateLoading(true);
      setError(null);
      
      const response = await axios.patch(
        `${API_URL}/api/orders/${selectedOrder._id}/status`,
        statusUpdate,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        // Update the order in the list
        setOrders(orders.map(order => 
          order._id === selectedOrder._id 
            ? { ...order, 
                status: statusUpdate.status, 
                trackingNumber: statusUpdate.trackingNumber || order.trackingNumber,
                updatedAt: new Date().toISOString()
              } 
            : order
        ));
        
        // Update order counts
        if (selectedStatus === 'all' || selectedStatus === selectedOrder.status) {
          setOrderCounts({
            ...orderCounts,
            [selectedOrder.status]: orderCounts[selectedOrder.status as keyof typeof orderCounts] - 1,
            [statusUpdate.status]: orderCounts[statusUpdate.status as keyof typeof orderCounts] + 1
          });
        }
        
        setShowUpdateModal(false);
      } else {
        setError('Failed to update order status');
      }
    } catch (err: any) {
      console.error('Error updating order status:', err);
      setError(err.response?.data?.message || 'An error occurred while updating the order status');
    } finally {
      setUpdateLoading(false);
    }
  };
  
  // Handle tab selection (order status filter)
  const handleTabSelect = (eventKey: string | null) => {
    if (eventKey) {
      setSelectedStatus(eventKey);
      setPage(1);
    }
  };
  
  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'processing':
        return <Badge bg="info">Processing</Badge>;
      case 'shipped':
        return <Badge bg="primary">Shipped</Badge>;
      case 'delivered':
        return <Badge bg="success">Delivered</Badge>;
      case 'completed':
        return <Badge bg="success">Completed</Badge>;
      case 'canceled':
        return <Badge bg="danger">Canceled</Badge>;
      case 'refunded':
        return <Badge bg="danger">Refunded</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Generate pagination items
  const paginationItems = [];
  for (let number = 1; number <= totalPages; number++) {
    paginationItems.push(
      <Pagination.Item 
        key={number} 
        active={number === page}
        onClick={() => handlePageChange(number)}
      >
        {number}
      </Pagination.Item>
    );
  }

  return (
    <Container fluid className="py-4">
      <h1 className="mb-4">Order Management</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Order Status Tabs */}
      <Tabs
        activeKey={selectedStatus}
        onSelect={handleTabSelect}
        className="mb-4"
        fill
      >
        <Tab eventKey="all" title={`All (${orderCounts.all})`} />
        <Tab eventKey="pending" title={`Pending (${orderCounts.pending})`} />
        <Tab eventKey="processing" title={`Processing (${orderCounts.processing})`} />
        <Tab eventKey="shipped" title={`Shipped (${orderCounts.shipped})`} />
        <Tab eventKey="delivered" title={`Delivered (${orderCounts.delivered})`} />
        <Tab eventKey="completed" title={`Completed (${orderCounts.completed})`} />
        <Tab eventKey="canceled" title={`Canceled (${orderCounts.canceled})`} />
      </Tabs>
      
      {/* Search and Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={5}>
              <Form onSubmit={handleSearch}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search order #, customer, or product..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button type="submit" variant="primary">
                    <FaSearch /> Search
                  </Button>
                </InputGroup>
              </Form>
            </Col>
            <Col md={7}>
              <Row>
                <Col md={5}>
                  <Form.Group>
                    <Form.Control
                      type="date"
                      placeholder="Start Date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                    />
                  </Form.Group>
                </Col>
                <Col md={5}>
                  <Form.Group>
                    <Form.Control
                      type="date"
                      placeholder="End Date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Button 
                    variant="outline-secondary" 
                    onClick={handleDateFilter}
                    disabled={!dateRange.startDate || !dateRange.endDate}
                  >
                    Filter
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Orders Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-5">
              <FaShoppingBag size={48} className="text-muted mb-3" />
              <h4>No orders found</h4>
              <p className="text-muted">
                {searchTerm || selectedStatus !== 'all' || (dateRange.startDate && dateRange.endDate) ? 
                  'Try adjusting your filters' : 
                  'You have no orders yet'}
              </p>
            </div>
          ) : (
            <>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th onClick={() => handleSort('orderNumber')} style={{ cursor: 'pointer' }}>
                      Order # {sortField === 'orderNumber' && (
                        sortDirection === 'asc' ? <FaSortAmountUp size={14} /> : <FaSortAmountDown size={14} />
                      )}
                    </th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th onClick={() => handleSort('price.total')} style={{ cursor: 'pointer' }}>
                      Total {sortField === 'price.total' && (
                        sortDirection === 'asc' ? <FaSortAmountUp size={14} /> : <FaSortAmountDown size={14} />
                      )}
                    </th>
                    <th>Status</th>
                    <th onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer' }}>
                      Date {sortField === 'createdAt' && (
                        sortDirection === 'asc' ? <FaSortAmountUp size={14} /> : <FaSortAmountDown size={14} />
                      )}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id}>
                      <td>{order.orderNumber}</td>
                      <td>{order.buyer.name}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          {order.product.mainPhoto && (
                            <img
                              src={`${API_URL}/uploads/${order.product.mainPhoto}`}
                              alt={order.product.title}
                              style={{ width: '30px', height: '30px', objectFit: 'cover', marginRight: '10px' }}
                            />
                          )}
                          <div className="text-truncate" style={{ maxWidth: '150px' }}>
                            {order.product.title}
                          </div>
                        </div>
                      </td>
                      <td>${order.price.total.toFixed(2)}</td>
                      <td>{renderStatusBadge(order.status)}</td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
                          onClick={() => openDetailsModal(order)}
                        >
                          <FaEye />
                        </Button>
                        {order.status !== 'completed' && order.status !== 'canceled' && order.status !== 'refunded' && (
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => openUpdateModal(order)}
                          >
                            {order.status === 'pending' ? <FaBoxOpen /> :
                             order.status === 'processing' ? <FaTruck /> :
                             order.status === 'shipped' ? <FaCheckCircle /> :
                             <FaCheckCircle />}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              
              {/* Pagination */}
              <div className="d-flex justify-content-center mt-4">
                <Pagination>
                  <Pagination.Prev 
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  />
                  {paginationItems}
                  <Pagination.Next 
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                  />
                </Pagination>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
      
      {/* Order Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Order Details - {selectedOrder?.orderNumber}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <h5>Customer Information</h5>
                  <p><strong>Name:</strong> {selectedOrder.buyer.name}</p>
                  <p><strong>Email:</strong> {selectedOrder.buyer.email}</p>
                </Col>
                <Col md={6}>
                  <h5>Order Information</h5>
                  <p><strong>Status:</strong> {renderStatusBadge(selectedOrder.status)}</p>
                  <p><strong>Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
                  <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
                  <p>
                    <strong>Payment Status:</strong> {' '}
                    <Badge bg={selectedOrder.paymentStatus === 'paid' ? 'success' : 
                              selectedOrder.paymentStatus === 'pending' ? 'warning' : 'danger'}>
                      {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                    </Badge>
                  </p>
                </Col>
              </Row>
              
              <Row className="mb-4">
                <Col md={6}>
                  <h5>Shipping Address</h5>
                  <p>{selectedOrder.shippingAddress.name}</p>
                  <p>{selectedOrder.shippingAddress.addressLine1}</p>
                  {selectedOrder.shippingAddress.addressLine2 && (
                    <p>{selectedOrder.shippingAddress.addressLine2}</p>
                  )}
                  <p>
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                  </p>
                  <p>{selectedOrder.shippingAddress.country}</p>
                  <p>Phone: {selectedOrder.shippingAddress.phone}</p>
                </Col>
                <Col md={6}>
                  <h5>Shipping Information</h5>
                  <p><strong>Method:</strong> {selectedOrder.shippingMethod}</p>
                  {selectedOrder.trackingNumber && (
                    <p><strong>Tracking Number:</strong> {selectedOrder.trackingNumber}</p>
                  )}
                  {selectedOrder.notes && (
                    <div>
                      <h5>Notes</h5>
                      <p>{selectedOrder.notes}</p>
                    </div>
                  )}
                </Col>
              </Row>
              
              <h5>Product</h5>
              <Table bordered>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="d-flex align-items-center">
                        {selectedOrder.product.mainPhoto && (
                          <img
                            src={`${API_URL}/uploads/${selectedOrder.product.mainPhoto}`}
                            alt={selectedOrder.product.title}
                            style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '15px' }}
                          />
                        )}
                        <div>
                          <div>{selectedOrder.product.title}</div>
                          {selectedOrder.customizations && Object.keys(selectedOrder.customizations).length > 0 && (
                            <small className="text-muted">
                              {Object.entries(selectedOrder.customizations).map(([key, value]) => (
                                <div key={key}>{key}: {value}</div>
                              ))}
                            </small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>${selectedOrder.price.subtotal.toFixed(2)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td className="text-end"><strong>Subtotal:</strong></td>
                    <td>${selectedOrder.price.subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="text-end"><strong>Shipping:</strong></td>
                    <td>${selectedOrder.price.shipping.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="text-end"><strong>Tax:</strong></td>
                    <td>${selectedOrder.price.tax.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="text-end"><strong>Total:</strong></td>
                    <td><strong>${selectedOrder.price.total.toFixed(2)}</strong></td>
                  </tr>
                </tfoot>
              </Table>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
          {selectedOrder && selectedOrder.status !== 'completed' && selectedOrder.status !== 'canceled' && selectedOrder.status !== 'refunded' && (
            <Button variant="primary" onClick={() => {
              setShowDetailsModal(false);
              openUpdateModal(selectedOrder);
            }}>
              Update Status
            </Button>
          )}
        </Modal.Footer>
      </Modal>
      
      {/* Order Status Update Modal */}
      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Order Status - {selectedOrder?.orderNumber}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={statusUpdate.status}
                onChange={(e) => setStatusUpdate({
                  ...statusUpdate,
                  status: e.target.value as OrderStatusUpdate['status']
                })}
              >
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </Form.Select>
            </Form.Group>
            
            {statusUpdate.status === 'shipped' && (
              <Form.Group className="mb-3">
                <Form.Label>Tracking Number</Form.Label>
                <Form.Control
                  type="text"
                  value={statusUpdate.trackingNumber || ''}
                  onChange={(e) => setStatusUpdate({
                    ...statusUpdate,
                    trackingNumber: e.target.value
                  })}
                  placeholder="Enter tracking number"
                />
              </Form.Group>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label>Notes (optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={statusUpdate.notes || ''}
                onChange={(e) => setStatusUpdate({
                  ...statusUpdate,
                  notes: e.target.value
                })}
                placeholder="Add any notes about this status update"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary"
            onClick={handleStatusUpdate}
            disabled={updateLoading || (statusUpdate.status === 'shipped' && !statusUpdate.trackingNumber)}
          >
            {updateLoading ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              'Update Status'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default OrderManager; 