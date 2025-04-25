import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Row, Col, Card, Form, Button, Spinner, Alert
} from 'react-bootstrap';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { API_URL } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';

interface InventoryItemFormData {
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
  location?: string;
  supplier?: {
    name?: string;
    contactName?: string;
    email?: string;
    phone?: string;
    website?: string;
    leadTime?: number;
  };
}

const InventoryItemForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const isEditMode = Boolean(id);

  // Form state
  const [formData, setFormData] = useState<InventoryItemFormData>({
    name: '',
    description: '',
    stock: 0,
    price: 0,
    unit: 'piece',
    category: '',
    reorderPoint: 5,
    reorderQuantity: 20
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([
    'Fabric', 'Thread', 'Button', 'Zipper', 'Elastic', 'Trim', 'Tool', 'Other'
  ]);
  const [unitOptions, setUnitOptions] = useState<string[]>([
    'piece', 'yard', 'meter', 'roll', 'spool', 'pack', 'box'
  ]);

  // Fetch item data if in edit mode
  useEffect(() => {
    if (isEditMode && isAuthenticated) {
      const fetchItemData = async () => {
        try {
          setFetchLoading(true);
          setError(null);
          
          const response = await axios.get(`${API_URL}/api/inventory/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (response.data.success) {
            const item = response.data.data.item;
            setFormData({
              name: item.name,
              description: item.description || '',
              stock: item.stock,
              price: item.price,
              unit: item.unit,
              category: item.category,
              material: item.material || '',
              color: item.color || '',
              sku: item.sku || '',
              reorderPoint: item.reorderPoint,
              reorderQuantity: item.reorderQuantity,
              location: item.location || '',
              supplier: item.supplier || {}
            });
          } else {
            setError('Failed to fetch inventory item');
          }
        } catch (err: any) {
          console.error('Error fetching inventory item:', err);
          setError(err.response?.data?.message || 'An error occurred while fetching the item');
        } finally {
          setFetchLoading(false);
        }
      };
      
      fetchItemData();
    }
  }, [id, isAuthenticated, isEditMode]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Prepare data for API
      const apiData = {
        ...formData,
        stock: Number(formData.stock),
        price: Number(formData.price),
        reorderPoint: Number(formData.reorderPoint),
        reorderQuantity: Number(formData.reorderQuantity)
      };
      
      let response;
      
      if (isEditMode) {
        response = await axios.put(
          `${API_URL}/api/inventory/${id}`,
          apiData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
      } else {
        response = await axios.post(
          `${API_URL}/api/inventory`,
          apiData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
      }
      
      if (response.data.success) {
        setSuccess(isEditMode ? 'Inventory item updated successfully!' : 'New inventory item added successfully!');
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/seller/inventory');
        }, 1500);
      } else {
        setError('Failed to save inventory item');
      }
    } catch (err: any) {
      console.error('Error saving inventory item:', err);
      setError(err.response?.data?.errors?.[0]?.message || 'An error occurred while saving the item');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested fields (supplier)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof InventoryItemFormData],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle back button click
  const handleBack = () => {
    navigate('/seller/inventory');
  };

  if (fetchLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading inventory item...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex align-items-center mb-4">
        <Button variant="outline-secondary" className="me-3" onClick={handleBack}>
          <FaArrowLeft /> Back
        </Button>
        <h1 className="mb-0">{isEditMode ? 'Edit Inventory Item' : 'Add New Inventory Item'}</h1>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Item Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter item name"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter item description"
                  />
                </Form.Group>
                
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category *</Form.Label>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Category</option>
                        {categoryOptions.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Material</Form.Label>
                      <Form.Control
                        type="text"
                        name="material"
                        value={formData.material || ''}
                        onChange={handleChange}
                        placeholder="e.g., Cotton, Polyester"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Color</Form.Label>
                      <Form.Control
                        type="text"
                        name="color"
                        value={formData.color || ''}
                        onChange={handleChange}
                        placeholder="e.g., Red, Blue"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Stock Quantity *</Form.Label>
                  <Form.Control
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                </Form.Group>
                
                <Row>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>Price *</Form.Label>
                      <Form.Control
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Unit *</Form.Label>
                      <Form.Select
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                        required
                      >
                        {unitOptions.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>SKU</Form.Label>
                  <Form.Control
                    type="text"
                    name="sku"
                    value={formData.sku || ''}
                    onChange={handleChange}
                    placeholder="Optional stock keeping unit"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Storage Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={formData.location || ''}
                    onChange={handleChange}
                    placeholder="e.g., Shelf A, Bin 3"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <h5 className="mt-4 mb-3">Re-order Settings</h5>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Re-order Point</Form.Label>
                  <Form.Control
                    type="number"
                    name="reorderPoint"
                    value={formData.reorderPoint}
                    onChange={handleChange}
                    min="0"
                    placeholder="Stock level that triggers alerts"
                  />
                  <Form.Text className="text-muted">
                    You will receive alerts when stock falls below this level
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Re-order Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    name="reorderQuantity"
                    value={formData.reorderQuantity}
                    onChange={handleChange}
                    min="0"
                    placeholder="Suggested quantity to order"
                  />
                  <Form.Text className="text-muted">
                    Recommended quantity to purchase when restocking
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            
            <h5 className="mt-4 mb-3">Supplier Information</h5>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Supplier Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="supplier.name"
                    value={formData.supplier?.name || ''}
                    onChange={handleChange}
                    placeholder="Supplier company name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Person</Form.Label>
                  <Form.Control
                    type="text"
                    name="supplier.contactName"
                    value={formData.supplier?.contactName || ''}
                    onChange={handleChange}
                    placeholder="Contact person name"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="supplier.email"
                    value={formData.supplier?.email || ''}
                    onChange={handleChange}
                    placeholder="Supplier email"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    name="supplier.phone"
                    value={formData.supplier?.phone || ''}
                    onChange={handleChange}
                    placeholder="Supplier phone"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Lead Time (Days)</Form.Label>
                  <Form.Control
                    type="number"
                    name="supplier.leadTime"
                    value={formData.supplier?.leadTime || ''}
                    onChange={handleChange}
                    min="0"
                    placeholder="Delivery lead time in days"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <div className="mt-4 d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={handleBack}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="me-2" />
                    {isEditMode ? 'Update Item' : 'Add Item'}
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default InventoryItemForm; 