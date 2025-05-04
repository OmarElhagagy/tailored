import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';
import './Products.css';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get(`${API_URL}/api/listings/seller`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data.success) {
          setProducts(response.data.data.listings || []);
        } else {
          setError('Failed to fetch products');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.response?.data?.message || 'Failed to load products. Please try again later.');
        setLoading(false);
      }
    };

    // Only fetch if user is authenticated as a seller
    if (isAuthenticated && user?.role === 'seller') {
      fetchProducts();
    } else if (isAuthenticated && user?.role !== 'seller') {
      navigate('/unauthorized');
    }
  }, [isAuthenticated, user, navigate]);

  const getStatusBadge = (status) => {
    switch(status) {
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
  
  const getStockBadge = (stock) => {
    switch(stock) {
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

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await axios.delete(`${API_URL}/api/listings/${productId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data.success) {
          setProducts(products.filter(product => product._id !== productId));
        } else {
          setError('Failed to delete product');
        }
      } catch (err) {
        console.error('Error deleting product:', err);
        setError(err.response?.data?.message || 'An error occurred while deleting the product');
      }
    }
  };

  if (loading) return (
    <div className="text-center py-5">
      <Spinner animation="border" role="status" variant="primary">
        <span className="visually-hidden">Loading products...</span>
      </Spinner>
    </div>
  );
  
  if (error) return <div className="text-center py-5 text-danger">{error}</div>;

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Products</h2>
            <Link to="/seller/products/new">
              <Button variant="primary">Add New Product</Button>
            </Link>
          </div>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          {products.length === 0 ? (
            <div className="text-center py-5">
              <p className="mb-3">You don't have any products yet.</p>
              <Link to="/seller/products/new">
                <Button variant="outline-primary">Add Your First Product</Button>
              </Link>
            </div>
          ) : (
            <Table responsive hover className="product-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id}>
                    <td className="product-image-cell">
                      {product.mainPhoto ? (
                        <img 
                          src={`${API_URL}/uploads/${product.mainPhoto}`}
                          alt={product.title}
                          className="product-image"
                        />
                      ) : (
                        <div className="product-image-placeholder">📷</div>
                      )}
                    </td>
                    <td>{product.title}</td>
                    <td>{product.category}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>{getStockBadge(product.stock || 'in_stock')}</td>
                    <td>{getStatusBadge(product.status)}</td>
                    <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/seller/products/edit/${product._id}`} className="btn btn-sm btn-outline-primary me-2">
                        Edit
                      </Link>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDeleteProduct(product._id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Products; 