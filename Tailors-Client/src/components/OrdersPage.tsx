import React, { useState } from 'react';

interface Order {
  id: string;
  customer: string;
  date: string;
  status: 'Completed' | 'Processing' | 'Pending' | 'Cancelled';
  total: number;
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([
    { id: '#O-12345', customer: 'John Doe', date: 'June 15, 2023', status: 'Completed', total: 120.00 },
    { id: '#O-12346', customer: 'Jane Smith', date: 'June 16, 2023', status: 'Processing', total: 85.50 },
    { id: '#O-12347', customer: 'Robert Johnson', date: 'June 17, 2023', status: 'Cancelled', total: 220.75 },
    { id: '#O-12348', customer: 'Mary Williams', date: 'June 18, 2023', status: 'Pending', total: 150.25 },
  ]);
  
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [editingStatus, setEditingStatus] = useState<Order | null>(null);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
  };
  
  const handleViewOrder = (order: Order) => {
    setViewingOrder(order);
    setEditingStatus(null);
  };
  
  const handleUpdateStatus = (order: Order) => {
    setEditingStatus(order);
    setViewingOrder(null);
  };
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (editingStatus) {
      const newStatus = e.target.value as Order['status'];
      setEditingStatus({
        ...editingStatus,
        status: newStatus
      });
    }
  };
  
  const saveStatusUpdate = () => {
    if (editingStatus) {
      setOrders(orders.map(order => 
        order.id === editingStatus.id ? { ...order, status: editingStatus.status } : order
      ));
      setEditingStatus(null);
    }
  };
  
  const closeModal = () => {
    setViewingOrder(null);
    setEditingStatus(null);
  };
  
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });
  
  const getStatusBadgeClass = (status: Order['status']) => {
    switch (status) {
      case 'Completed': return 'bg-success';
      case 'Processing': return 'bg-warning text-dark';
      case 'Pending': return 'bg-info text-dark';
      case 'Cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };
  
  return (
    <div className="card">
      <div className="card-header">
        <h3>Orders Management</h3>
      </div>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <select 
              className="form-select" 
              value={filterStatus}
              onChange={handleFilterChange}
            >
              <option value="All">All Orders</option>
              <option value="Completed">Completed</option>
              <option value="Processing">Processing</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search orders..." 
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>
        
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id}>
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
                  <button 
                    className="btn btn-sm btn-primary me-2"
                    onClick={() => handleViewOrder(order)}
                  >
                    View
                  </button>
                  <button 
                    className="btn btn-sm btn-warning"
                    onClick={() => handleUpdateStatus(order)}
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center">No orders found</td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* View Order Modal */}
        {viewingOrder && (
          <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Order Details: {viewingOrder.id}</h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <p><strong>Customer:</strong> {viewingOrder.customer}</p>
                      <p><strong>Order Date:</strong> {viewingOrder.date}</p>
                      <p>
                        <strong>Status:</strong> 
                        <span className={`ms-2 badge ${getStatusBadgeClass(viewingOrder.status)}`}>
                          {viewingOrder.status}
                        </span>
                      </p>
                    </div>
                    <div className="col-md-6 text-md-end">
                      <p><strong>Total:</strong> ${viewingOrder.total.toFixed(2)}</p>
                      <p><strong>Payment Method:</strong> Credit Card</p>
                    </div>
                  </div>
                  
                  <h6>Order Items</h6>
                  <table className="table table-bordered table-sm">
                    <thead className="table-light">
                      <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Custom Tailored Shirt</td>
                        <td>1</td>
                        <td>$65.00</td>
                        <td>$65.00</td>
                      </tr>
                      <tr>
                        <td>Alteration Service</td>
                        <td>1</td>
                        <td>$35.00</td>
                        <td>$35.00</td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="text-end"><strong>Subtotal</strong></td>
                        <td>$100.00</td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="text-end"><strong>Tax</strong></td>
                        <td>$10.00</td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="text-end"><strong>Shipping</strong></td>
                        <td>$10.00</td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="text-end"><strong>Total</strong></td>
                        <td><strong>${viewingOrder.total.toFixed(2)}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <h6>Shipping Address</h6>
                  <p>
                    123 Main Street<br />
                    Apt 4B<br />
                    New York, NY 10001<br />
                    United States
                  </p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
                  <button type="button" className="btn btn-primary">Print Invoice</button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Update Status Modal */}
        {editingStatus && (
          <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Update Order Status</h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <p>Order ID: {editingStatus.id}</p>
                  <p>Customer: {editingStatus.customer}</p>
                  
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select 
                      className="form-select" 
                      value={editingStatus.status}
                      onChange={handleStatusChange}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                  <button type="button" className="btn btn-primary" onClick={saveStatusUpdate}>Save Changes</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage; 