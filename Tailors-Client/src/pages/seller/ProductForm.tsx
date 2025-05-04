import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Form, Button, Card, Spinner, Alert, 
  Row, Col, Tab, Tabs, InputGroup, Badge 
} from 'react-bootstrap';
import { FaSave, FaArrowLeft, FaTrash, FaPlus, FaImage } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';
import './ProductForm.css';

interface ProductFormProps {
  isEditing?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ isEditing = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('10');
  const [status, setStatus] = useState('draft');
  const [customizable, setCustomizable] = useState(false);
  
  // Options state
  const [colors, setColors] = useState<string[]>([]);
  const [newColor, setNewColor] = useState('');
  const [sizes, setSizes] = useState<string[]>([]);
  const [newSize, setNewSize] = useState('');
  const [materials, setMaterials] = useState<string[]>([]);
  const [newMaterial, setNewMaterial] = useState('');
  
  // Photos state
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [photosToRemove, setPhotosToRemove] = useState<string[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [categories, setCategories] = useState<string[]>([]);
  
  // Fetch product data if editing
  useEffect(() => {
    const fetchProductData = async () => {
      if (!isEditing || !id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`${API_URL}/api/listings/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data.success) {
          const product = response.data.data;
          
          // Set basic info
          setTitle(product.title);
          setDescription(product.description);
          setPrice(product.price.toString());
          setCategory(product.category);
          setStock(product.stock.toString());
          setStatus(product.status);
          setCustomizable(product.customizable);
          
          // Set options
          setColors(product.colors || []);
          setSizes(product.sizes || []);
          setMaterials(product.materials || []);
          
          // Set existing photos
          if (product.photos && product.photos.length > 0) {
            setExistingPhotos(product.photos);
          }
        } else {
          setError('Failed to fetch product data');
        }
      } catch (err: any) {
        console.error('Error fetching product data:', err);
        setError(err.response?.data?.message || 'An error occurred while fetching product data');
      } finally {
        setLoading(false);
      }
    };
    
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/listings/categories/all`);
        if (response.data.success) {
          setCategories(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    
    if (isAuthenticated && user?.role === 'seller') {
      fetchCategories();
      fetchProductData();
    }
  }, [isEditing, id, isAuthenticated, user]);
  
  // Handle photo changes
  useEffect(() => {
    const newPreviewUrls: string[] = [];
    
    photos.forEach(photo => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviewUrls.push(reader.result as string);
        if (newPreviewUrls.length === photos.length) {
          setPhotoPreviewUrls(newPreviewUrls);
        }
      };
      reader.readAsDataURL(photo);
    });
  }, [photos]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !price || !category) {
      setError('Please fill in all required fields');
      setActiveTab('basic');
      return;
    }
    
    if ((!isEditing || photosToRemove.length === existingPhotos.length) && photos.length === 0) {
      setError('Please add at least one product photo');
      setActiveTab('photos');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('stock', stock);
      formData.append('status', status);
      formData.append('customizable', customizable.toString());
      
      // Add options
      formData.append('colors', JSON.stringify(colors));
      formData.append('sizes', JSON.stringify(sizes));
      formData.append('materials', JSON.stringify(materials));
      
      // Add photos
      photos.forEach(photo => {
        formData.append('photos', photo);
      });
      
      // Add photo removal info for editing
      if (isEditing && photosToRemove.length > 0) {
        formData.append('photosToRemove', JSON.stringify(photosToRemove));
        if (photosToRemove.length === existingPhotos.length) {
          formData.append('removeExistingPhotos', 'true');
        }
      }
      
      let response;
      if (isEditing && id) {
        response = await axios.put(`${API_URL}/api/listings/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      } else {
        response = await axios.post(`${API_URL}/api/listings`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      
      if (response.data.success) {
        setSuccess(isEditing ? 'Product updated successfully' : 'Product created successfully');
        
        // Navigate back to product list after a short delay
        setTimeout(() => {
          navigate('/seller/products');
        }, 1500);
      } else {
        setError('Failed to save product');
      }
    } catch (err: any) {
      console.error('Error saving product:', err);
      setError(err.response?.data?.message || 'An error occurred while saving the product');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files);
      setPhotos(prevPhotos => [...prevPhotos, ...newPhotos]);
    }
  };
  
  // Remove uploaded photo
  const handleRemoveUploadedPhoto = (index: number) => {
    setPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
    setPhotoPreviewUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
  };
  
  // Toggle removal of existing photo
  const handleToggleExistingPhotoRemoval = (photo: string) => {
    if (photosToRemove.includes(photo)) {
      setPhotosToRemove(prev => prev.filter(p => p !== photo));
    } else {
      setPhotosToRemove(prev => [...prev, photo]);
    }
  };
  
  // Add color
  const handleAddColor = () => {
    if (newColor && !colors.includes(newColor)) {
      setColors([...colors, newColor]);
      setNewColor('');
    }
  };
  
  // Remove color
  const handleRemoveColor = (color: string) => {
    setColors(colors.filter(c => c !== color));
  };
  
  // Add size
  const handleAddSize = () => {
    if (newSize && !sizes.includes(newSize)) {
      setSizes([...sizes, newSize]);
      setNewSize('');
    }
  };
  
  // Remove size
  const handleRemoveSize = (size: string) => {
    setSizes(sizes.filter(s => s !== size));
  };
  
  // Add material
  const handleAddMaterial = () => {
    if (newMaterial && !materials.includes(newMaterial)) {
      setMaterials([...materials, newMaterial]);
      setNewMaterial('');
    }
  };
  
  // Remove material
  const handleRemoveMaterial = (material: string) => {
    setMaterials(materials.filter(m => m !== material));
  };
  
  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Loading product data...</p>
      </Container>
    );
  }
  
  return (
    <Container className="product-form py-4">
      <div className="d-flex align-items-center mb-4">
        <Button 
          variant="outline-secondary" 
          className="me-2"
          onClick={() => navigate('/seller/products')}
        >
          <FaArrowLeft className="me-2" /> Back to Products
        </Button>
        <h1 className="mb-0">{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Card className="mb-4">
          <Card.Header>
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => k && setActiveTab(k)}
              className="mb-0"
            >
              <Tab eventKey="basic" title="Basic Information">
                <Card.Body>
                  <Row>
                    <Col md={8}>
                      <Form.Group className="mb-3">
                        <Form.Label>Title <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Enter product title"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Category <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          required
                        >
                          <option value="">Select a category</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                          <option value="Other">Other</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Description <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your product in detail"
                      required
                    />
                  </Form.Group>
                  
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Price <span className="text-danger">*</span></Form.Label>
                        <InputGroup>
                          <InputGroup.Text>$</InputGroup.Text>
                          <Form.Control
                            type="number"
                            min="0"
                            step="0.01"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="0.00"
                            required
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Stock</Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
                          value={stock}
                          onChange={(e) => setStock(e.target.value)}
                          placeholder="Available quantity"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                        >
                          <option value="draft">Draft</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="This product is customizable"
                      checked={customizable}
                      onChange={(e) => setCustomizable(e.target.checked)}
                    />
                  </Form.Group>
                </Card.Body>
              </Tab>
              
              <Tab eventKey="options" title="Product Options">
                <Card.Body>
                  {/* Colors */}
                  <Form.Group className="mb-4">
                    <Form.Label>Available Colors</Form.Label>
                    <InputGroup className="mb-2">
                      <Form.Control
                        type="text"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        placeholder="Add a color (e.g., Red, Blue, etc.)"
                      />
                      <Button 
                        variant="outline-primary" 
                        onClick={handleAddColor}
                        disabled={!newColor}
                      >
                        <FaPlus /> Add
                      </Button>
                    </InputGroup>
                    <div className="d-flex flex-wrap mt-2">
                      {colors.map((color) => (
                        <Badge 
                          key={color} 
                          bg="primary" 
                          className="me-2 mb-2 p-2 d-flex align-items-center"
                        >
                          {color}
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="p-0 ms-2 text-white"
                            onClick={() => handleRemoveColor(color)}
                          >
                            <FaTrash size={12} />
                          </Button>
                        </Badge>
                      ))}
                      {colors.length === 0 && (
                        <span className="text-muted">No colors added yet</span>
                      )}
                    </div>
                  </Form.Group>
                  
                  {/* Sizes */}
                  <Form.Group className="mb-4">
                    <Form.Label>Available Sizes</Form.Label>
                    <InputGroup className="mb-2">
                      <Form.Control
                        type="text"
                        value={newSize}
                        onChange={(e) => setNewSize(e.target.value)}
                        placeholder="Add a size (e.g., S, M, L, XL, etc.)"
                      />
                      <Button 
                        variant="outline-primary" 
                        onClick={handleAddSize}
                        disabled={!newSize}
                      >
                        <FaPlus /> Add
                      </Button>
                    </InputGroup>
                    <div className="d-flex flex-wrap mt-2">
                      {sizes.map((size) => (
                        <Badge 
                          key={size} 
                          bg="info" 
                          className="me-2 mb-2 p-2 d-flex align-items-center"
                        >
                          {size}
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="p-0 ms-2 text-white"
                            onClick={() => handleRemoveSize(size)}
                          >
                            <FaTrash size={12} />
                          </Button>
                        </Badge>
                      ))}
                      {sizes.length === 0 && (
                        <span className="text-muted">No sizes added yet</span>
                      )}
                    </div>
                  </Form.Group>
                  
                  {/* Materials */}
                  <Form.Group className="mb-4">
                    <Form.Label>Materials</Form.Label>
                    <InputGroup className="mb-2">
                      <Form.Control
                        type="text"
                        value={newMaterial}
                        onChange={(e) => setNewMaterial(e.target.value)}
                        placeholder="Add a material (e.g., Cotton, Silk, etc.)"
                      />
                      <Button 
                        variant="outline-primary" 
                        onClick={handleAddMaterial}
                        disabled={!newMaterial}
                      >
                        <FaPlus /> Add
                      </Button>
                    </InputGroup>
                    <div className="d-flex flex-wrap mt-2">
                      {materials.map((material) => (
                        <Badge 
                          key={material} 
                          bg="success" 
                          className="me-2 mb-2 p-2 d-flex align-items-center"
                        >
                          {material}
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="p-0 ms-2 text-white"
                            onClick={() => handleRemoveMaterial(material)}
                          >
                            <FaTrash size={12} />
                          </Button>
                        </Badge>
                      ))}
                      {materials.length === 0 && (
                        <span className="text-muted">No materials added yet</span>
                      )}
                    </div>
                  </Form.Group>
                </Card.Body>
              </Tab>
              
              <Tab eventKey="photos" title="Photos">
                <Card.Body>
                  <Form.Group>
                    <Form.Label>Product Photos {!isEditing && <span className="text-danger">*</span>}</Form.Label>
                    <div className="mb-3">
                      <Button 
                        variant="outline-primary" 
                        onClick={() => document.getElementById('photoUpload')?.click()}
                        className="me-2"
                      >
                        <FaImage className="me-2" /> Add Photos
                      </Button>
                      <Form.Control
                        type="file"
                        id="photoUpload"
                        onChange={handlePhotoUpload}
                        multiple
                        accept="image/*"
                        style={{ display: 'none' }}
                      />
                      <small className="text-muted">
                        You can upload multiple photos at once. Max 10 photos per product.
                      </small>
                    </div>
                    
                    {/* Existing photos (for editing) */}
                    {isEditing && existingPhotos.length > 0 && (
                      <>
                        <h6>Current Photos</h6>
                        <div className="photo-preview-container mb-4">
                          {existingPhotos.map((photo, index) => (
                            <div key={index} className="photo-preview-wrapper">
                              <img 
                                src={`${API_URL}/uploads/${photo}`} 
                                alt={`Product ${index + 1}`} 
                                className={`photo-preview ${photosToRemove.includes(photo) ? 'marked-for-removal' : ''}`}
                              />
                              <Button
                                variant={photosToRemove.includes(photo) ? "danger" : "light"}
                                size="sm"
                                className="remove-photo-btn"
                                onClick={() => handleToggleExistingPhotoRemoval(photo)}
                              >
                                <FaTrash size={12} />
                              </Button>
                              {index === 0 && (
                                <Badge bg="primary" className="main-photo-badge">
                                  Main Photo
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    
                    {/* Newly uploaded photos */}
                    {photoPreviewUrls.length > 0 && (
                      <>
                        <h6>New Photos</h6>
                        <div className="photo-preview-container">
                          {photoPreviewUrls.map((url, index) => (
                            <div key={index} className="photo-preview-wrapper">
                              <img 
                                src={url} 
                                alt={`New upload ${index + 1}`} 
                                className="photo-preview"
                              />
                              <Button
                                variant="light"
                                size="sm"
                                className="remove-photo-btn"
                                onClick={() => handleRemoveUploadedPhoto(index)}
                              >
                                <FaTrash size={12} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    
                    {((!isEditing || photosToRemove.length === existingPhotos.length) && photoPreviewUrls.length === 0) && (
                      <div className="text-center p-4 bg-light rounded border mt-2">
                        <FaImage size={48} className="text-muted mb-3" />
                        <p className="mb-0">No photos selected</p>
                        <small className="text-muted">
                          Photos help buyers understand your product better
                        </small>
                      </div>
                    )}
                  </Form.Group>
                </Card.Body>
              </Tab>
            </Tabs>
          </Card.Header>
        </Card>
        
        <div className="d-flex justify-content-between">
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate('/seller/products')}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              <>
                <FaSave className="me-2" /> 
                {isEditing ? 'Update Product' : 'Create Product'}
              </>
            )}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default ProductForm; 