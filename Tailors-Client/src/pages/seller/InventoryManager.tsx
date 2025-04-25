import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Row, Col, Card, Table, Button, Form, 
  InputGroup, Badge, Spinner, Alert, Pagination, Modal
} from 'react-bootstrap';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaBoxOpen, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { API_URL } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';

interface InventoryItem {
  _id: string;
  name: string;
  description: string;
  stock: number;
  price: number;
  unit: string;
  category: string;
  material?: string;
  color?: string;
  sku?: string;
  reorderPoint: number;
  reorderQuantity: number;
  stockHistory: {
    action: string;
    quantity: number;
    date: string;
    notes?: string;
  }[];
  updatedAt: string;
}

interface StockAdjustment {
  action: 'add' | 'remove';
  quantity: number;
  notes: string;
}

interface CategoryStat {
  _id: string;
  count: number;
}

interface StockSummary {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
}

const InventoryManager: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // State for inventory items and pagination
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // State for filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // State for categories and stock summary
  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const [stockSummary, setStockSummary] = useState<StockSummary | null>(null);
  
  // State for stock adjustment modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustment, setAdjustment] = useState<StockAdjustment>({
    action: 'add',
    quantity: 1,
    notes: ''
  });
  
  // State for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Fetch inventory items
  const fetchInventory = async () => {
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
      
      if (selectedCategory) {
        queryParams.append('category', selectedCategory);
      }
      
      if (showLowStock) {
        queryParams.append('lowStock', 'true');
      }
      
      const response = await axios.get(`${API_URL}/api/inventory?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setItems(response.data.data.items);
        setTotalPages(response.data.data.pagination.pages);
        setCategories(response.data.data.categories || []);
        setStockSummary(response.data.data.stockSummary || null);
      } else {
        setError('Failed to fetch inventory items');
      }
    } catch (err: any) {
      console.error('Error fetching inventory:', err);
      setError(err.response?.data?.message || 'An error occurred while fetching inventory');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    if (isAuthenticated && user?.role === 'seller') {
      fetchInventory();
    } else if (isAuthenticated && user?.role !== 'seller') {
      navigate('/unauthorized');
    }
  }, [isAuthenticated, user, navigate]);
  
  // Refetch when filters, sorting, or pagination changes
  useEffect(() => {
    if (isAuthenticated && user?.role === 'seller') {
      fetchInventory();
    }
  }, [page, sortField, sortDirection, searchTerm, selectedCategory, showLowStock]);
  
  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
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
  
  // Open stock adjustment modal
  const openAdjustModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setAdjustment({
      action: 'add',
      quantity: 1,
      notes: ''
    });
    setShowAdjustModal(true);
  };
  
  // Handle stock adjustment
  const handleStockAdjustment = async () => {
    if (!selectedItem) return;
    
    try {
      const response = await axios.post(
        `${API_URL}/api/inventory/${selectedItem._id}/adjust`,
        adjustment,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        // Update the item in the list
        setItems(items.map(item => 
          item._id === selectedItem._id 
            ? { ...item, stock: adjustment.action === 'add' 
                ? item.stock + adjustment.quantity 
                : item.stock - adjustment.quantity 
              } 
            : item
        ));
        
        setShowAdjustModal(false);
      } else {
        setError('Failed to adjust stock');
      }
    } catch (err: any) {
      console.error('Error adjusting stock:', err);
      setError(err.response?.data?.message || 'An error occurred while adjusting stock');
    }
  };
  
  // Open delete confirmation modal
  const openDeleteModal = (itemId: string) => {
    setItemToDelete(itemId);
    setShowDeleteModal(true);
  };
  
  // Handle item deletion
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    
    try {
      const response = await axios.delete(`${API_URL}/api/inventory/${itemToDelete}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        // Remove the item from the list
        setItems(items.filter(item => item._id !== itemToDelete));
        setShowDeleteModal(false);
      } else {
        setError('Failed to delete item');
      }
    } catch (err: any) {
      console.error('Error deleting item:', err);
      setError(err.response?.data?.message || 'An error occurred while deleting the item');
      
      // Show specific error if the item is in use
      if (err.response?.data?.errors?.[0]?.listings) {
        setError('This item is used in active listings and cannot be deleted');
      }
    }
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
  
  // Render stock status badge
  const renderStockStatus = (stock: number, reorderPoint: number) => {
    if (stock === 0) {
      return <Badge bg="danger">Out of Stock</Badge>;
    } else if (stock <= reorderPoint) {
      return <Badge bg="warning">Low Stock</Badge>;
    } else {
      return <Badge bg="success">In Stock</Badge>;
    }
  };

  return (
    <Container fluid className="py-4">
      <h1 className="mb-4">Inventory Management</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Summary Cards */}
      {stockSummary && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center h-100">
              <Card.Body>
                <h5>Total Items</h5>
                <h2>{stockSummary.totalItems}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center h-100">
              <Card.Body>
                <h5>Total Value</h5>
                <h2>${stockSummary.totalValue.toFixed(2)}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center h-100">
              <Card.Body>
                <h5>Low Stock Items</h5>
                <h2>{stockSummary.lowStockItems}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center h-100">
              <Card.Body>
                <h5>Out of Stock</h5>
                <h2>{stockSummary.outOfStockItems}</h2>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
      
      {/* Filters and Actions */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={5}>
              <Form onSubmit={handleSearch}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search inventory..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button type="submit" variant="primary">
                    <FaSearch /> Search
                  </Button>
                </InputGroup>
              </Form>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category._id} ({category.count})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Check
                type="switch"
                id="low-stock-filter"
                label="Low Stock Only"
                checked={showLowStock}
                onChange={(e) => setShowLowStock(e.target.checked)}
              />
            </Col>
            <Col md={2} className="text-end">
              <Link to="/seller/inventory/add">
                <Button variant="success">
                  <FaPlus className="me-1" /> Add Item
                </Button>
              </Link>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Inventory Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading inventory...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-5">
              <FaBoxOpen size={48} className="text-muted mb-3" />
              <h4>No inventory items found</h4>
              <p className="text-muted">
                {searchTerm || selectedCategory || showLowStock ? 
                  'Try adjusting your filters' : 
                  'Start adding items to your inventory'}
              </p>
              <Link to="/seller/inventory/add">
                <Button variant="primary">
                  <FaPlus className="me-1" /> Add First Item
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                      Name {sortField === 'name' && (
                        sortDirection === 'asc' ? <FaSortAmountUp size={14} /> : <FaSortAmountDown size={14} />
                      )}
                    </th>
                    <th onClick={() => handleSort('category')} style={{ cursor: 'pointer' }}>
                      Category {sortField === 'category' && (
                        sortDirection === 'asc' ? <FaSortAmountUp size={14} /> : <FaSortAmountDown size={14} />
                      )}
                    </th>
                    <th onClick={() => handleSort('stock')} style={{ cursor: 'pointer' }}>
                      Stock {sortField === 'stock' && (
                        sortDirection === 'asc' ? <FaSortAmountUp size={14} /> : <FaSortAmountDown size={14} />
                      )}
                    </th>
                    <th onClick={() => handleSort('price')} style={{ cursor: 'pointer' }}>
                      Price {sortField === 'price' && (
                        sortDirection === 'asc' ? <FaSortAmountUp size={14} /> : <FaSortAmountDown size={14} />
                      )}
                    </th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item._id}>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>{item.stock} {item.unit}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>{renderStockStatus(item.stock, item.reorderPoint)}</td>
                      <td>
                        <Button 
                          variant="outline-secondary" 
                          size="sm" 
                          className="me-1"
                          onClick={() => openAdjustModal(item)}
                        >
                          Adjust
                        </Button>
                        <Link to={`/seller/inventory/edit/${item._id}`}>
                          <Button variant="outline-primary" size="sm" className="me-1">
                            <FaEdit />
                          </Button>
                        </Link>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => openDeleteModal(item._id)}
                        >
                          <FaTrash />
                        </Button>
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
      
      {/* Stock Adjustment Modal */}
      <Modal show={showAdjustModal} onHide={() => setShowAdjustModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Adjust Stock for {selectedItem?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Action</Form.Label>
              <Form.Select
                value={adjustment.action}
                onChange={(e) => setAdjustment({
                  ...adjustment,
                  action: e.target.value as 'add' | 'remove'
                })}
              >
                <option value="add">Add Stock</option>
                <option value="remove">Remove Stock</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={adjustment.quantity}
                onChange={(e) => setAdjustment({
                  ...adjustment,
                  quantity: parseInt(e.target.value) || 1
                })}
              />
              {adjustment.action === 'remove' && selectedItem && (
                <Form.Text className="text-muted">
                  Available: {selectedItem.stock} {selectedItem.unit}
                </Form.Text>
              )}
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter reason for adjustment"
                value={adjustment.notes}
                onChange={(e) => setAdjustment({
                  ...adjustment,
                  notes: e.target.value
                })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAdjustModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleStockAdjustment}
            disabled={
              adjustment.quantity <= 0 || 
              (adjustment.action === 'remove' && selectedItem && adjustment.quantity > selectedItem.stock)
            }
          >
            {adjustment.action === 'add' ? 'Add Stock' : 'Remove Stock'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this inventory item? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteItem}>
            Delete Item
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default InventoryManager; 