import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import {
  Container, Row, Col, Card, Button, Nav, Tab, 
  Spinner, Alert, Badge, Image, Form
} from 'react-bootstrap';
import { FaStar, FaMapMarkerAlt, FaPhone, FaGlobe, FaCalendarAlt } from 'react-icons/fa';
import './SellerProfile.css';

interface Seller {
  _id: string;
  businessName: string;
  businessDescription: string;
  businessWebsite?: string;
  businessEstablishedYear?: number;
  businessAddress?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  logo?: string;
  coverPhoto?: string;
  specialties?: string[];
  serviceAreas?: string[];
  languages?: string[];
  rating?: {
    average: number;
    count: number;
  };
  contactPhone?: string;
  contactEmail?: string;
}

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  mainPhoto: string;
  photos: string[];
  status: string;
  stock: string;
  rating?: {
    average: number;
    count: number;
  };
  createdAt: string;
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  buyer: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

const SellerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchSellerData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch seller profile
        const sellerResponse = await axios.get(`${API_URL}/api/sellers/${id}/public`);
        
        if (sellerResponse.data.success) {
          setSeller(sellerResponse.data.data);
          
          // Fetch seller's products
          const productsResponse = await axios.get(`${API_URL}/api/listings/seller/${id}/public`);
          if (productsResponse.data.success) {
            setProducts(productsResponse.data.data.listings || []);
          }
          
          // Fetch seller's reviews
          const reviewsResponse = await axios.get(`${API_URL}/api/reviews/seller/${id}`);
          if (reviewsResponse.data.success) {
            setReviews(reviewsResponse.data.data || []);
          }
        } else {
          setError('Failed to fetch seller information');
        }
      } catch (err) {
        console.error('Error fetching seller data:', err);
        setError('An error occurred while fetching seller information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSellerData();
  }, [id]);

  const renderStarRating = (rating: number) => {
    return (
      <div className="d-flex align-items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar 
            key={star} 
            className="me-1" 
            color={star <= Math.round(rating) ? '#ffc107' : '#e4e5e9'} 
          />
        ))}
        <span className="ms-2">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Loading seller profile...</p>
      </Container>
    );
  }

  if (error || !seller) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error || 'Seller not found'}
        </Alert>
        <Button variant="primary" onClick={() => navigate('/sellers')}>
          Back to Sellers
        </Button>
      </Container>
    );
  }

  return (
    <div className="seller-profile">
      {/* Cover Photo & Profile Header */}
      <div className="position-relative mb-4">
        <div className="seller-cover-photo" style={{ 
          height: '250px', 
          backgroundColor: '#f8f9fa',
          backgroundImage: seller.coverPhoto ? `url(${API_URL}/uploads/${seller.coverPhoto})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
        </div>
        <Container>
          <div className="position-relative" style={{ marginTop: '-75px' }}>
            <div className="d-flex flex-column flex-md-row align-items-center align-items-md-end">
              <div 
                className="seller-logo rounded-circle border border-4 border-white bg-white" 
                style={{ width: '150px', height: '150px', overflow: 'hidden' }}
              >
                {seller.logo ? (
                  <img 
                    src={`${API_URL}/uploads/${seller.logo}`} 
                    alt={seller.businessName}
                    className="img-fluid w-100 h-100 object-fit-cover"
                  />
                ) : (
                  <div className="w-100 h-100 bg-primary d-flex align-items-center justify-content-center">
                    <span className="text-white display-4">
                      {seller.businessName.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="ms-md-4 mt-3 mt-md-0 text-center text-md-start">
                <h1 className="mb-2">{seller.businessName}</h1>
                <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-start gap-3 mb-2">
                  {seller.rating && (
                    <div className="d-flex align-items-center">
                      {renderStarRating(seller.rating.average)}
                      <span className="ms-2">({seller.rating.count} reviews)</span>
                    </div>
                  )}
                  {seller.businessAddress && seller.businessAddress.city && (
                    <div className="d-flex align-items-center text-muted">
                      <FaMapMarkerAlt className="me-2" />
                      {seller.businessAddress.city}
                      {seller.businessAddress.country && `, ${seller.businessAddress.country}`}
                    </div>
                  )}
                  {seller.businessEstablishedYear && (
                    <div className="d-flex align-items-center text-muted">
                      <FaCalendarAlt className="me-2" />
                      Est. {seller.businessEstablishedYear}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container className="mb-5">
        <Tab.Container id="seller-tabs" activeKey={activeTab} onSelect={(k) => k && setActiveTab(k)}>
          <Nav variant="tabs" className="mb-4">
            <Nav.Item>
              <Nav.Link eventKey="overview">Overview</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="products">Products</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="reviews">
                Reviews {seller.rating && `(${seller.rating.count})`}
              </Nav.Link>
            </Nav.Item>
          </Nav>
          
          <Tab.Content>
            <Tab.Pane eventKey="overview">
              <Row>
                <Col lg={8}>
                  <Card className="mb-4">
                    <Card.Body>
                      <h2 className="h4 mb-3">About {seller.businessName}</h2>
                      <p>{seller.businessDescription || 'No description provided.'}</p>
                      
                      {(seller.specialties && seller.specialties.length > 0) && (
                        <div className="mt-4">
                          <h3 className="h5 mb-2">Specialties</h3>
                          <div className="d-flex flex-wrap gap-2">
                            {seller.specialties.map((specialty, index) => (
                              <Badge key={index} bg="light" text="dark" className="py-2 px-3">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {(seller.languages && seller.languages.length > 0) && (
                        <div className="mt-4">
                          <h3 className="h5 mb-2">Languages</h3>
                          <p>
                            {seller.languages.join(', ')}
                          </p>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                  
                  {/* Featured Products Preview */}
                  {products.length > 0 && (
                    <Card className="mb-4">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h2 className="h4 mb-0">Featured Products</h2>
                          <Button 
                            variant="link" 
                            className="text-decoration-none"
                            onClick={() => setActiveTab('products')}
                          >
                            View All Products
                          </Button>
                        </div>
                        
                        <Row className="g-3">
                          {products.slice(0, 3).map((product) => (
                            <Col md={4} sm={6} key={product._id}>
                              <Link 
                                to={`/seller/${id}/product/${product._id}`} 
                                className="text-decoration-none"
                              >
                                <Card className="h-100 product-card border-0 shadow-sm">
                                  <div style={{ height: '180px', overflow: 'hidden' }}>
                                    <Card.Img 
                                      variant="top" 
                                      src={`${API_URL}/uploads/${product.mainPhoto}`}
                                      alt={product.title}
                                      className="img-fluid"
                                      style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                                    />
                                  </div>
                                  <Card.Body>
                                    <Card.Title className="h6 mb-2 text-truncate">
                                      {product.title}
                                    </Card.Title>
                                    <div className="d-flex justify-content-between align-items-center">
                                      <span className="fw-bold">${product.price.toFixed(2)}</span>
                                      {product.rating && (
                                        <div className="d-flex align-items-center small">
                                          <FaStar className="text-warning me-1" />
                                          <span>{product.rating.average.toFixed(1)}</span>
                                        </div>
                                      )}
                                    </div>
                                  </Card.Body>
                                </Card>
                              </Link>
                            </Col>
                          ))}
                        </Row>
                      </Card.Body>
                    </Card>
                  )}
                </Col>
                
                <Col lg={4}>
                  <Card className="mb-4">
                    <Card.Body>
                      <h3 className="h5 mb-3">Contact Information</h3>
                      <ul className="list-unstyled">
                        {seller.contactPhone && (
                          <li className="mb-2">
                            <div className="d-flex">
                              <FaPhone className="mt-1 me-2 text-primary" />
                              <div>
                                <strong>Phone</strong>
                                <p className="mb-0">{seller.contactPhone}</p>
                              </div>
                            </div>
                          </li>
                        )}
                        {seller.businessWebsite && (
                          <li className="mb-2">
                            <div className="d-flex">
                              <FaGlobe className="mt-1 me-2 text-primary" />
                              <div>
                                <strong>Website</strong>
                                <p className="mb-0">
                                  <a href={seller.businessWebsite} target="_blank" rel="noopener noreferrer">
                                    {seller.businessWebsite.replace(/^https?:\/\//, '')}
                                  </a>
                                </p>
                              </div>
                            </div>
                          </li>
                        )}
                        {seller.businessAddress && (
                          <li>
                            <div className="d-flex">
                              <FaMapMarkerAlt className="mt-1 me-2 text-primary" />
                              <div>
                                <strong>Address</strong>
                                <p className="mb-0">
                                  {seller.businessAddress.street && `${seller.businessAddress.street}, `}
                                  {seller.businessAddress.city && `${seller.businessAddress.city}, `}
                                  {seller.businessAddress.state && `${seller.businessAddress.state}, `}
                                  {seller.businessAddress.postalCode && `${seller.businessAddress.postalCode}, `}
                                  {seller.businessAddress.country}
                                </p>
                              </div>
                            </div>
                          </li>
                        )}
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab.Pane>
            
            <Tab.Pane eventKey="products">
              <div className="mb-4">
                <h2 className="h4 mb-3">Products by {seller.businessName}</h2>
                
                {products.length === 0 ? (
                  <Alert variant="info">
                    This seller doesn't have any products listed yet.
                  </Alert>
                ) : (
                  <>
                    {/* Product Filters */}
                    <Card className="mb-4">
                      <Card.Body>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3 mb-md-0">
                              <Form.Control 
                                type="text" 
                                placeholder="Search products by name..."
                                // Add search functionality here if needed
                              />
                            </Form.Group>
                          </Col>
                          <Col md={3}>
                            <Form.Select 
                              aria-label="Sort by"
                              // Add sort functionality here if needed
                            >
                              <option>Sort by</option>
                              <option value="price_asc">Price: Low to High</option>
                              <option value="price_desc">Price: High to Low</option>
                              <option value="newest">Newest First</option>
                              <option value="rating">Highest Rated</option>
                            </Form.Select>
                          </Col>
                          <Col md={3}>
                            <Form.Select 
                              aria-label="Filter by"
                              // Add filter functionality here if needed
                            >
                              <option>All Categories</option>
                              {/* Add dynamic categories if available */}
                            </Form.Select>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                    
                    {/* Product Grid */}
                    <Row className="g-4">
                      {products.map((product) => (
                        <Col lg={3} md={4} sm={6} key={product._id}>
                          <Link 
                            to={`/seller/${id}/product/${product._id}`} 
                            className="text-decoration-none"
                          >
                            <Card className="h-100 product-card">
                              <div style={{ height: '200px', overflow: 'hidden' }}>
                                <Card.Img 
                                  variant="top" 
                                  src={`${API_URL}/uploads/${product.mainPhoto}`}
                                  alt={product.title}
                                  className="img-fluid"
                                  style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                                />
                              </div>
                              <Card.Body>
                                <Card.Title className="h6 mb-2">
                                  {product.title}
                                </Card.Title>
                                <div className="text-truncate small text-muted mb-2">
                                  {product.description}
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                  <span className="fw-bold">${product.price.toFixed(2)}</span>
                                  {product.rating && (
                                    <div className="d-flex align-items-center small">
                                      <FaStar className="text-warning me-1" />
                                      <span>{product.rating.average.toFixed(1)}</span>
                                    </div>
                                  )}
                                </div>
                              </Card.Body>
                              <Card.Footer className="bg-white border-top-0 d-grid">
                                <Button variant="outline-primary" size="sm">
                                  View Details
                                </Button>
                              </Card.Footer>
                            </Card>
                          </Link>
                        </Col>
                      ))}
                    </Row>
                  </>
                )}
              </div>
            </Tab.Pane>
            
            <Tab.Pane eventKey="reviews">
              <h2 className="h4 mb-4">Customer Reviews</h2>
              {reviews.length === 0 ? (
                <Card className="text-center py-5">
                  <Card.Body>
                    <p className="mb-0">This seller has no reviews yet.</p>
                  </Card.Body>
                </Card>
              ) : (
                <div>
                  {seller.rating && (
                    <div className="d-flex align-items-center mb-4">
                      <div className="display-4 me-3">{seller.rating.average.toFixed(1)}</div>
                      <div>
                        {renderStarRating(seller.rating.average)}
                        <p className="mb-0">{seller.rating.count} total reviews</p>
                      </div>
                    </div>
                  )}
                  
                  {reviews.map((review) => (
                    <Card key={review._id} className="mb-3">
                      <Card.Body>
                        <div className="d-flex mb-3">
                          <div className="flex-shrink-0 me-3">
                            {review.buyer.avatar ? (
                              <img 
                                src={`${API_URL}/uploads/${review.buyer.avatar}`} 
                                alt={review.buyer.name}
                                className="rounded-circle"
                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                              />
                            ) : (
                              <div 
                                className="rounded-circle bg-primary d-flex align-items-center justify-content-center"
                                style={{ width: '50px', height: '50px' }}
                              >
                                <span className="text-white">
                                  {review.buyer.name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div>
                            <h5 className="mb-1">{review.buyer.name}</h5>
                            <div className="mb-2">
                              {renderStarRating(review.rating)}
                            </div>
                            <p className="text-muted small">
                              {formatDate(review.createdAt)}
                            </p>
                          </div>
                        </div>
                        <p className="mb-0">{review.comment}</p>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Container>
    </div>
  );
};

export default SellerProfile; 