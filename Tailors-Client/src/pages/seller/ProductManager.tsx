import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Row, Col, Card, Table, Button, Form, 
  InputGroup, Badge, Spinner, Alert, Pagination, Dropdown
} from 'react-bootstrap';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye, FaEllipsisH, FaStore } from 'react-icons/fa';
import { API_URL } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';

interface Product {
  _id: string;
  title: string;
  price: number;
  category: string;
  status: 'draft' | 'active' | 'inactive';
  mainPhoto: string;
  stock: 'in_stock' | 'low_stock' | 'out_of_stock';
  totalSales: number;
  viewCount: number;
  createdAt: string;
}

const ProductManager: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // State for products and pagination
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // State for filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // State for categories
  const [categories, setCategories] = useState<{ name: string, count: number }[]>([]);

  // Fetch products
  const fetchProducts = async () => {
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
      
      if (selectedStatus) {
        queryParams.append('status', selectedStatus);
      }
      
      const response = await axios.get(`${API_URL}/api/listings/seller?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setProducts(response.data.data.listings);
        setTotalPages(response.data.data.pagination.pages);
        setCategories(response.data.data.categories || []);
      } else {
        setError('Failed to fetch products');
      }
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.message || 'An error occurred while fetching products');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    if (isAuthenticated && user?.role === 'seller') {
      fetchProducts();
    } else if (isAuthenticated && user?.role !== 'seller') {
      navigate('/unauthorized');
    }
  }, [isAuthenticated, user, navigate]);
  
  // Refetch when filters, sorting, or pagination changes
  useEffect(() => {
    if (isAuthenticated && user?.role === 'seller') {
      fetchProducts();
    }
  }, [page, sortField, sortDirection, searchTerm, selectedCategory, selectedStatus]);
  
  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
  };
  
  // Handle product deletion
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      const response = await axios.delete(`${API_URL}/api/listings/${productId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        // Remove the deleted product from the list
        setProducts(products.filter(product => product._id !== productId));
      } else {
        setError('Failed to delete product');
      }
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setError(err.response?.data?.message || 'An error occurred while deleting the product');
      
      // Show specific error if the product has orders
      if (err.response?.data?.errors?.[0]?.message?.includes('orders')) {
        setError('This product has existing orders and cannot be deleted');
      }
    }
  };
  
  // Handle product status change
  const handleStatusChange = async (productId: string, newStatus: 'draft' | 'active' | 'inactive') => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/listings/${productId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        // Update the product status in the list
        setProducts(products.map(product => 
          product._id === productId 
            ? { ...product, status: newStatus } 
            : product
        ));
      } else {
        setError('Failed to update product status');
      }
    } catch (err: any) {
      console.error('Error updating product status:', err);
      setError(err.response?.data?.message || 'An error occurred while updating the product status');
    }
  };
  
  // Handle pagination click
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
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
  
  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge bg="success">Active</Badge>;
      case 'draft':
        return <Badge bg="secondary">Draft</Badge>;
      case 'inactive':
        return <Badge bg="warning">Inactive</Badge>;
      default:
        return <Badge bg="info">{status}</Badge>;
    }
  };
  
  // Render stock badge
  const renderStockBadge = (stock: string) => {
    switch (stock) {
      case 'in_stock':
        return <Badge bg="success">In Stock</Badge>;
      case 'low_stock':
        return <Badge bg="warning">Low Stock</Badge>;
      case 'out_of_stock':
        return <Badge bg="danger">Out of Stock</Badge>;
      default:
        return <Badge bg="info">{stock}</Badge>;
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Container fluid className="py-4">
      <h1 className="mb-4">Product Management</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Filters and Actions */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form onSubmit={handleSearch}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search products..."
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
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.name} value={category.name}>
                      {category.name} ({category.count})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2} className="text-end">
              <Link to="/seller/products/new">
                <Button variant="success">
                  <FaPlus className="me-1" /> Add Product
                </Button>
              </Link>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Products Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-5">
              <FaStore size={48} className="text-muted mb-3" />
              <h4>No products found</h4>
              <p className="text-muted">
                {searchTerm || selectedCategory || selectedStatus ? 
                  'Try adjusting your filters' : 
                  'Start adding products to your store'}
              </p>
              <Link to="/seller/products/new">
                <Button variant="primary">
                  <FaPlus className="me-1" /> Add First Product
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Stock</th>
                    <th>Sales</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          {product.mainPhoto && (
                            <img
                              src={`${API_URL}/uploads/${product.mainPhoto}`}
                              alt={product.title}
                              style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px' }}
                            />
                          )}
                          <div className="text-truncate" style={{ maxWidth: '150px' }}>
                            {product.title}
                          </div>
                        </div>
                      </td>
                      <td>{product.category}</td>
                      <td>${product.price.toFixed(2)}</td>
                      <td>{renderStatusBadge(product.status)}</td>
                      <td>{renderStockBadge(product.stock)}</td>
                      <td>{product.totalSales || 0}</td>
                      <td>{formatDate(product.createdAt)}</td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-secondary" size="sm" id={`dropdown-${product._id}`}>
                            <FaEllipsisH />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item as={Link} to={`/seller/products/edit/${product._id}`}>
                              <FaEdit className="me-2" /> Edit
                            </Dropdown.Item>
                            <Dropdown.Item as={Link} to={`/buyer/product/${product._id}`} target="_blank">
                              <FaEye className="me-2" /> View
                            </Dropdown.Item>
                            {product.status === 'active' ? (
                              <Dropdown.Item onClick={() => handleStatusChange(product._id, 'inactive')}>
                                Deactivate
                              </Dropdown.Item>
                            ) : (
                              <Dropdown.Item onClick={() => handleStatusChange(product._id, 'active')}>
                                Activate
                              </Dropdown.Item>
                            )}
                            <Dropdown.Divider />
                            <Dropdown.Item 
                              className="text-danger"
                              onClick={() => handleDeleteProduct(product._id)}
                            >
                              <FaTrash className="me-2" /> Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
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
    </Container>
  );
};

export default ProductManager; 