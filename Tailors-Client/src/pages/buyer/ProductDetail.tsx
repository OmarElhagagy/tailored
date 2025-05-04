import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';
import { Container, Row, Col, Card, Button, Form, Badge, Tabs, Tab, Spinner, Alert, Image } from 'react-bootstrap';
import { FaStar, FaArrowLeft, FaShoppingCart, FaStoreAlt } from 'react-icons/fa';

// Types
interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  photos: string[];
  mainPhoto: string;
  availableMaterials: {
    name: string;
    color: string;
    price: number;
    inStock: boolean;
  }[];
  colors: string[];
  customizationOptions: {
    name: string;
    options: string[];
    required: boolean;
    affects_price: boolean;
    price_modifier: number;
  }[];
  deliveryOptions: {
    method: string;
    estimatedDays: {
      min: number;
      max: number;
    };
    price: number;
  }[];
  rating: {
    average: number;
    count: number;
  };
  seller: {
    _id: string;
    businessName: string;
    businessDescription: string;
    rating: {
      average: number;
    };
  };
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  createdAt: string;
}

interface Measurements {
  _id: string;
  name: string;
  values: {
    [key: string]: number;
  };
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  buyerName: string;
  createdAt: string;
}

// Define the interface for customization options
interface CustomizationOption {
  name: string;
  options: string[];
  required: boolean;
  affects_price: boolean;
  price_modifier: number;
}

const ProductDetail: React.FC = () => {
  // Get both productId and sellerId from URL params
  const { productId, sellerId } = useParams<{ productId: string; sellerId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedDelivery, setSelectedDelivery] = useState<string>('');
  const [customizations, setCustomizations] = useState<{ [key: string]: string }>({});
  const [measurements, setMeasurements] = useState<Measurements[]>([]);
  const [selectedMeasurement, setSelectedMeasurement] = useState<string>('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState('description');
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use productId instead of id
        const response = await axios.get(`${API_URL}/api/listings/${productId}`);
        
        if (response.data.success) {
          setProduct(response.data.data);
          
          // Verify this product belongs to the seller in the URL
          if (sellerId && response.data.data.seller._id !== sellerId) {
            setError('This product does not belong to the specified seller');
            return;
          }
          
          if (response.data.data.photos && response.data.data.photos.length > 0) {
            setSelectedPhoto(response.data.data.mainPhoto || response.data.data.photos[0]);
          }
          
          // Initialize default selections
          if (response.data.data.availableMaterials && response.data.data.availableMaterials.length > 0) {
            setSelectedMaterial(response.data.data.availableMaterials[0].name);
          }
          
          if (response.data.data.colors && response.data.data.colors.length > 0) {
            setSelectedColor(response.data.data.colors[0]);
          }
          
          if (response.data.data.deliveryOptions && response.data.data.deliveryOptions.length > 0) {
            setSelectedDelivery(response.data.data.deliveryOptions[0].method);
          }
          
          // Initialize customizations with default values
          const initialCustomizations: { [key: string]: string } = {};
          if (response.data.data.customizationOptions) {
            response.data.data.customizationOptions.forEach((option: CustomizationOption) => {
              if (option.options && option.options.length > 0) {
                initialCustomizations[option.name] = option.options[0];
              }
            });
          }
          setCustomizations(initialCustomizations);
        } else {
          setError('Failed to fetch product details');
        }
      } catch (err) {
        setError('An error occurred while fetching product details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, sellerId]);

  // Fetch more products from this seller
  useEffect(() => {
    const fetchSellerProducts = async () => {
      if (!sellerId || !product) return;
      
      try {
        const response = await axios.get(`${API_URL}/api/listings/seller/${sellerId}/public`);
        
        if (response.data.success) {
          // Filter out the current product and limit to 4 related products
          const otherProducts = response.data.data.listings.filter(
            (p: Product) => p._id !== productId
          ).slice(0, 4);
          
          setSellerProducts(otherProducts);
        }
      } catch (err) {
        console.error('Error fetching seller products:', err);
      }
    };

    if (product && sellerId) {
      fetchSellerProducts();
    }
  }, [product, sellerId, productId]);

  // Fetch user's saved measurements if authenticated
  useEffect(() => {
    const fetchMeasurements = async () => {
      if (!isAuthenticated) return;
      
      try {
        const response = await axios.get(`${API_URL}/api/measurements`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data.success) {
          setMeasurements(response.data.data);
          if (response.data.data.length > 0) {
            setSelectedMeasurement(response.data.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Error fetching measurements:', err);
      }
    };

    fetchMeasurements();
  }, [isAuthenticated]);

  // Fetch product reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) return;
      
      try {
        const response = await axios.get(`${API_URL}/api/listings/${productId}/reviews`);
        
        if (response.data.success) {
          setReviews(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };

    fetchReviews();
  }, [productId]);

  // Calculate total price based on selections
  const calculateTotalPrice = () => {
    if (!product) return 0;
    
    let totalPrice = product.price;
    
    // Add material price if applicable
    if (selectedMaterial && product.availableMaterials) {
      const material = product.availableMaterials.find(m => m.name === selectedMaterial);
      if (material && material.price) {
        totalPrice += material.price;
      }
    }
    
    // Add customization price modifiers
    if (product.customizationOptions) {
      product.customizationOptions.forEach(option => {
        if (option.affects_price && customizations[option.name]) {
          totalPrice += option.price_modifier;
        }
      });
    }
    
    // Add delivery cost
    if (selectedDelivery && product.deliveryOptions) {
      const deliveryOption = product.deliveryOptions.find(d => d.method === selectedDelivery);
      if (deliveryOption && deliveryOption.price) {
        totalPrice += deliveryOption.price;
      }
    }
    
    // Multiply by quantity
    return totalPrice * quantity;
  };

  // Add to cart handler
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate(`/login?redirect=${encodeURIComponent(`/seller/${sellerId}/product/${productId}`)}`);
      return;
    }

    // Validate required customizations
    const missingRequired = product?.customizationOptions
      .filter(option => option.required && !customizations[option.name])
      .map(option => option.name);

    if (missingRequired && missingRequired.length > 0) {
      alert(`Please select options for: ${missingRequired.join(', ')}`);
      return;
    }

    // Add to cart logic
    // In a real application, this would call the cart service/API
    alert(`Product added to cart: ${product?.title}`);
  };

  // Render loading state
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Loading product details...</p>
      </Container>
    );
  }

  // Render error state
  if (error || !product) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error || 'Product not found'}
        </Alert>
        <Button variant="primary" onClick={() => navigate(`/seller/${sellerId}`)}>
          <FaArrowLeft className="me-2" /> Back to Seller
        </Button>
      </Container>
    );
  }

  // Handle navigation to seller profile
  const goToSellerProfile = () => {
    navigate(`/seller/${product.seller._id}`);
  };

  // Render stars for ratings
  const renderStars = (rating: number) => {
    return (
      <div className="d-flex">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className="me-1"
            color={i < Math.floor(rating) ? '#ffc107' : '#e4e5e9'}
          />
        ))}
        <span className="ms-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <Container className="py-4">
      {/* Breadcrumb Navigation */}
      <div className="mb-4 d-flex">
        <Link to={`/seller/${sellerId}`} className="text-decoration-none">
          <Button variant="outline-secondary" size="sm" className="me-2">
            <FaArrowLeft className="me-1" /> Back to {product.seller.businessName}
          </Button>
        </Link>
      </div>
      
      <Row>
        {/* Product Images */}
        <Col md={6} className="mb-4">
          <div className="product-main-image mb-3">
            <img
              src={`${API_URL}/uploads/${selectedPhoto}`}
              alt={product.title}
              className="img-fluid rounded"
            />
          </div>
          
          <div className="product-thumbnails d-flex">
            {product.photos.map((photo, index) => (
              <div
                key={index}
                className={`thumbnail me-2 ${selectedPhoto === photo ? 'border border-primary' : ''}`}
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={`${API_URL}/uploads/${photo}`}
                  alt={`Thumbnail ${index}`}
                  className="img-fluid rounded"
                  style={{ width: '60px', height: '60px', objectFit: 'cover', cursor: 'pointer' }}
                />
              </div>
            ))}
          </div>
        </Col>
        
        {/* Product Info & Options */}
        <Col md={6}>
          <h1 className="h2 mb-2">{product.title}</h1>
          
          <div className="d-flex align-items-center mb-3">
            {product.rating && renderStars(product.rating.average)}
          </div>
          
          <div className="mb-3 d-flex align-items-center">
            <h3 className="h4 mb-0 me-3">${product.price.toFixed(2)}</h3>
            <Badge bg={
              product.stockStatus === 'in_stock' ? 'success' :
              product.stockStatus === 'low_stock' ? 'warning' : 'danger'
            }>
              {product.stockStatus === 'in_stock' ? 'In Stock' :
              product.stockStatus === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
            </Badge>
          </div>
          
          {/* Seller Info Card */}
          <Card className="mb-4 border-light">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaStoreAlt size={24} className="text-primary" />
              </div>
              <div>
                <p className="mb-1">Sold by:</p>
                <h4 className="h6 mb-1">{product.seller.businessName}</h4>
                {product.seller.rating && (
                  <div className="small mb-2">{renderStars(product.seller.rating.average)}</div>
                )}
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={goToSellerProfile}
                >
                  View Seller Profile
                </Button>
              </div>
            </Card.Body>
          </Card>
          
          {/* Order Options Form */}
          <Form className="mt-4">
            {/* Quantity */}
            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                style={{ width: '5rem' }}
              />
            </Form.Group>
            
            {/* Material Selection */}
            {product.availableMaterials && product.availableMaterials.length > 0 && (
              <Form.Group className="mb-3">
                <Form.Label>Material</Form.Label>
                <Form.Select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                >
                  {product.availableMaterials.map((material, index) => (
                    <option
                      key={index}
                      value={material.name}
                      disabled={!material.inStock}
                    >
                      {material.name} {material.price > 0 ? `(+$${material.price.toFixed(2)})` : ''}
                      {!material.inStock ? ' - Out of Stock' : ''}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}
            
            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <Form.Group className="mb-3">
                <Form.Label>Color</Form.Label>
                <div className="d-flex">
                  {product.colors.map((color, index) => (
                    <div
                      key={index}
                      className={`color-option me-2 p-1 rounded ${selectedColor === color ? 'border border-primary' : 'border'}`}
                      onClick={() => setSelectedColor(color)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div
                        style={{
                          backgroundColor: color,
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </Form.Group>
            )}
            
            {/* Customization Options */}
            {product.customizationOptions && product.customizationOptions.map((option, index) => (
              <Form.Group key={index} className="mb-3">
                <Form.Label>
                  {option.name}
                  {option.required && <span className="text-danger ms-1">*</span>}
                  {option.affects_price && <span className="text-muted ms-1">(+${option.price_modifier.toFixed(2)})</span>}
                </Form.Label>
                <Form.Select
                  value={customizations[option.name] || ''}
                  onChange={(e) => setCustomizations({
                    ...customizations,
                    [option.name]: e.target.value
                  })}
                  required={option.required}
                >
                  {option.options.map((opt, optIndex) => (
                    <option key={optIndex} value={opt}>{opt}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            ))}
            
            {/* Delivery Options */}
            {product.deliveryOptions && product.deliveryOptions.length > 0 && (
              <Form.Group className="mb-3">
                <Form.Label>Delivery Method</Form.Label>
                <Form.Select
                  value={selectedDelivery}
                  onChange={(e) => setSelectedDelivery(e.target.value)}
                >
                  {product.deliveryOptions.map((delivery, index) => (
                    <option key={index} value={delivery.method}>
                      {delivery.method} (${delivery.price.toFixed(2)}) - 
                      {delivery.estimatedDays.min === delivery.estimatedDays.max
                        ? `${delivery.estimatedDays.min} days`
                        : `${delivery.estimatedDays.min}-${delivery.estimatedDays.max} days`}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}
            
            {/* Measurements Selection */}
            {isAuthenticated && measurements.length > 0 && (
              <Form.Group className="mb-3">
                <Form.Label>Your Measurements</Form.Label>
                <Form.Select
                  value={selectedMeasurement}
                  onChange={(e) => setSelectedMeasurement(e.target.value)}
                >
                  {measurements.map((measurement) => (
                    <option key={measurement._id} value={measurement._id}>
                      {measurement.name}
                    </option>
                  ))}
                </Form.Select>
                <div className="mt-2">
                  <Link to="/measurements" className="small">
                    Manage your measurements
                  </Link>
                </div>
              </Form.Group>
            )}
            
            <div className="d-grid gap-2 mt-4">
              <h4 className="text-end mb-3">Total: ${calculateTotalPrice().toFixed(2)}</h4>
              <Button
                variant="primary"
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stockStatus === 'out_of_stock'}
              >
                <FaShoppingCart className="me-2" />
                Add to Cart
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
      
      {/* Product Details Tabs */}
      <div className="mt-5">
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => k && setActiveTab(k)}
          className="mb-3"
        >
          <Tab eventKey="description" title="Description">
            <Card>
              <Card.Body>
                <div className="product-description">
                  <h3 className="h5 mb-3">Product Description</h3>
                  <p>{product.description}</p>
                </div>
              </Card.Body>
            </Card>
          </Tab>
          <Tab eventKey="reviews" title={`Reviews (${reviews.length})`}>
            <Card>
              <Card.Body>
                <h3 className="h5 mb-3">Customer Reviews</h3>
                {reviews.length === 0 ? (
                  <p className="text-muted">No reviews yet for this product.</p>
                ) : (
                  <div className="product-reviews">
                    {reviews.map((review) => (
                      <div key={review._id} className="review border-bottom pb-3 mb-3">
                        <div className="d-flex justify-content-between mb-2">
                          <div>
                            <h4 className="h6 mb-1">{review.buyerName}</h4>
                            <div>{renderStars(review.rating)}</div>
                          </div>
                          <small className="text-muted">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                        <p>{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      </div>
      
      {/* More from this seller */}
      {sellerProducts.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-4">More from {product.seller.businessName}</h3>
          <Row>
            {sellerProducts.map((relatedProduct) => (
              <Col key={relatedProduct._id} md={3} sm={6} className="mb-4">
                <Card className="h-100">
                  <Card.Img
                    variant="top"
                    src={`${API_URL}/uploads/${relatedProduct.mainPhoto}`}
                    alt={relatedProduct.title}
                  />
                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="h6">{relatedProduct.title}</Card.Title>
                    <div className="mt-2 mb-3">${relatedProduct.price.toFixed(2)}</div>
                    <Link 
                      to={`/seller/${sellerId}/product/${relatedProduct._id}`}
                      className="btn btn-outline-primary mt-auto"
                    >
                      View Details
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <div className="text-center mt-3">
            <Link to={`/seller/${sellerId}`} className="btn btn-link">
              View All Products from {product.seller.businessName}
            </Link>
          </div>
        </div>
      )}
    </Container>
  );
};

export default ProductDetail; 