import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import {
  Container, Row, Col, Card, Button, Nav, Tab, 
  Spinner, Alert, Badge, Image
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
                          <div>
                            {seller.specialties.map((specialty, index) => (
                              <Badge key={index} bg="primary" className="me-2 mb-2">
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
                  
                  {products.length > 0 && (
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h2 className="h4 mb-0">Featured Products</h2>
                        <Button variant="link" onClick={() => setActiveTab('products')}>
                          View All
                        </Button>
                      </div>
                      <Row>
                        {products.slice(0, 3).map((product) => (
                          <Col key={product._id} md={4} className="mb-3">
                            <Card className="h-100">
                              <div style={{ height: '160px', overflow: 'hidden' }}>
                                {product.mainPhoto ? (
                                  <img 
                                    src={`${API_URL}/uploads/${product.mainPhoto}`} 
                                    alt={product.title} 
                                    className="card-img-top object-fit-cover h-100 w-100"
                                  />
                                ) : (
                                  <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center">
                                    <span className="text-muted">No image</span>
                                  </div>
                                )}
                              </div>
                              <Card.Body className="d-flex flex-column">
                                <h5 className="card-title">{product.title}</h5>
                                <p className="card-text text-primary fw-bold mb-2">${product.price.toFixed(2)}</p>
                                <Link to={`/product/${product._id}`} className="btn btn-outline-primary mt-auto">
                                  View Details
                                </Link>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </div>
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
              <Row>
                <Col xs={12}>
                  <h2 className="h4 mb-4">Products by {seller.businessName}</h2>
                </Col>
                {products.length === 0 ? (
                  <Col>
                    <Card className="text-center py-5">
                      <Card.Body>
                        <p className="mb-0">This seller has no products listed yet.</p>
                      </Card.Body>
                    </Card>
                  </Col>
                ) : (
                  products.map((product) => (
                    <Col key={product._id} lg={4} md={6} className="mb-4">
                      <Card className="h-100">
                        <div style={{ height: '200px', overflow: 'hidden' }}>
                          {product.mainPhoto ? (
                            <img 
                              src={`${API_URL}/uploads/${product.mainPhoto}`} 
                              alt={product.title} 
                              className="card-img-top object-fit-cover h-100 w-100"
                            />
                          ) : (
                            <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center">
                              <span className="text-muted">No image</span>
                            </div>
                          )}
                        </div>
                        <Card.Body className="d-flex flex-column">
                          <h5 className="card-title">{product.title}</h5>
                          <p className="text-muted small mb-2">{product.category}</p>
                          <p className="card-text text-primary fw-bold mb-2">${product.price.toFixed(2)}</p>
                          {product.rating && (
                            <div className="mb-3">
                              {renderStarRating(product.rating.average)}
                            </div>
                          )}
                          <p className="card-text mb-3">
                            {product.description.length > 100 
                              ? `${product.description.substring(0, 100)}...`
                              : product.description}
                          </p>
                          <Link to={`/product/${product._id}`} className="btn btn-primary mt-auto">
                            View Details
                          </Link>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                )}
              </Row>
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