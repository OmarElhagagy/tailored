import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import {
  Container, Row, Col, Card, Button, Form, InputGroup,
  Spinner, Alert, Badge, Carousel
} from 'react-bootstrap';
import { FaSearch, FaStar, FaMapMarkerAlt, FaArrowRight, FaTshirt } from 'react-icons/fa';
import './SellerList.css';

interface Seller {
  _id: string;
  businessName: string;
  businessDescription: string;
  businessWebsite?: string;
  businessEstablishedYear?: number;
  logo?: string;
  coverPhoto?: string;
  location?: {
    city: string;
    state: string;
    country: string;
  };
  specialties?: string[];
  rating?: {
    average: number;
    count: number;
  };
}

const SellerList: React.FC = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [featuredSellers, setFeaturedSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [locations, setLocations] = useState<string[]>([]);
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`${API_URL}/api/sellers/public`);
        
        if (response.data.success) {
          setSellers(response.data.data.sellers || []);
          setFeaturedSellers(response.data.data.featuredSellers || []);
          
          // Extract unique locations
          const locationSet = new Set<string>();
          // Extract unique specialties
          const specialtySet = new Set<string>();
          
          response.data.data.sellers.forEach((seller: Seller) => {
            if (seller.location && seller.location.city && seller.location.country) {
              locationSet.add(`${seller.location.city}, ${seller.location.country}`);
            }
            
            if (seller.specialties) {
              seller.specialties.forEach(specialty => {
                specialtySet.add(specialty);
              });
            }
          });
          
          setLocations(Array.from(locationSet));
          setSpecialties(Array.from(specialtySet));
        } else {
          setError('Failed to fetch sellers');
        }
      } catch (err) {
        console.error('Error fetching sellers:', err);
        setError('An error occurred while fetching seller data');
      } finally {
        setLoading(false);
      }
    };

    fetchSellers();
  }, []);

  // Filter sellers based on search term, location and specialty
  const getFilteredSellers = () => {
    return sellers.filter(seller => {
      const matchesSearch = searchTerm === '' || 
                           seller.businessName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (seller.businessDescription && seller.businessDescription.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (seller.specialties && seller.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())));
      
      const matchesLocation = locationFilter === '' || 
                             (seller.location && 
                              `${seller.location.city}, ${seller.location.country}` === locationFilter);
      
      const matchesSpecialty = specialtyFilter === '' ||
                              (seller.specialties && 
                               seller.specialties.includes(specialtyFilter));
      
      return matchesSearch && matchesLocation && matchesSpecialty;
    });
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="d-flex align-items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar 
            key={star} 
            className="me-1" 
            color={star <= Math.round(rating) ? '#ffc107' : '#e4e5e9'} 
            size={16}
          />
        ))}
        <span className="ms-1 small">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setSpecialtyFilter('');
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Loading tailors...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  const filteredSellers = getFilteredSellers();

  return (
    <Container fluid className="py-4">
      {/* Hero Section */}
      <div className="bg-primary text-white rounded-3 mb-5 p-4 p-md-5">
        <Row className="align-items-center">
          <Col lg={7}>
            <h1 className="display-5 fw-bold mb-3">Find the Perfect Tailor for Your Style</h1>
            <p className="lead mb-4">
              Browse our curated list of skilled tailors and get custom-made clothing that fits perfectly.
              From traditional attire to modern fashion, find the right professional for your needs.
            </p>
            <Form onSubmit={handleSearchSubmit} className="mt-4">
              <InputGroup className="mb-3">
                <Form.Control
                  size="lg"
                  type="text"
                  placeholder="Search tailors by name, specialty, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button type="submit" variant="light" size="lg">
                  <FaSearch className="me-2" /> Search
                </Button>
              </InputGroup>
            </Form>
          </Col>
          <Col lg={5} className="d-none d-lg-block">
            <img 
              src="/images/tailor-hero.jpg" 
              alt="Tailor at work" 
              className="img-fluid rounded-3"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = 'https://via.placeholder.com/600x400?text=Tailors+Platform';
              }}
            />
          </Col>
        </Row>
      </div>

      {/* Filter Section */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row>
            <Col md={4} className="mb-3 mb-md-0">
              <Form.Group>
                <Form.Label>Location</Form.Label>
                <Form.Select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  aria-label="Filter by location"
                >
                  <option value="">All locations</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4} className="mb-3 mb-md-0">
              <Form.Group>
                <Form.Label>Specialty</Form.Label>
                <Form.Select
                  value={specialtyFilter}
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                  aria-label="Filter by specialty"
                >
                  <option value="">All specialties</option>
                  {specialties.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end justify-content-end">
              <Button 
                variant="outline-secondary" 
                onClick={handleClearFilters}
                className="w-100"
              >
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {featuredSellers.length > 0 && (
        <div className="mb-5">
          <h2 className="display-6 mb-4">Featured Tailors</h2>
          <Row>
            {featuredSellers.map((seller) => (
              <Col key={seller._id} lg={4} md={6} className="mb-4">
                <Link to={`/seller/${seller._id}`} className="text-decoration-none">
                  <Card className="h-100 seller-card shadow-sm hover-effect">
                    <div className="seller-card-banner" style={{ 
                      height: '120px',
                      backgroundImage: seller.coverPhoto 
                        ? `url(${API_URL}/uploads/${seller.coverPhoto})`
                        : 'linear-gradient(to right, #6a11cb, #2575fc)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}></div>
                    <Card.Body className="position-relative pt-5">
                      <div className="seller-avatar position-absolute" style={{
                        top: '-40px',
                        left: '20px',
                        width: '80px',
                        height: '80px',
                        overflow: 'hidden',
                        borderRadius: '50%',
                        border: '4px solid white',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                      }}>
                        {seller.logo ? (
                          <img 
                            src={`${API_URL}/uploads/${seller.logo}`} 
                            alt={seller.businessName}
                            className="w-100 h-100 object-fit-cover"
                          />
                        ) : (
                          <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-primary text-white">
                            {seller.businessName.charAt(0)}
                          </div>
                        )}
                      </div>
                      
                      <div className="mb-3 mt-2">
                        <h3 className="h4 mb-1">{seller.businessName}</h3>
                        {seller.rating && (
                          <div className="mb-2">
                            {renderStarRating(seller.rating.average)}
                            <small className="text-muted ms-2">({seller.rating.count} reviews)</small>
                          </div>
                        )}
                        {seller.location && (
                          <div className="text-muted small">
                            <FaMapMarkerAlt className="me-1" />
                            {seller.location.city}, {seller.location.country}
                          </div>
                        )}
                      </div>
                      
                      <p className="text-muted small mb-3">
                        {seller.businessDescription ? 
                          (seller.businessDescription.length > 120 
                            ? `${seller.businessDescription.substring(0, 120)}...` 
                            : seller.businessDescription) 
                          : 'No description available'}
                      </p>
                      
                      {seller.specialties && seller.specialties.length > 0 && (
                        <div className="mb-4">
                          {seller.specialties.slice(0, 3).map((specialty, index) => (
                            <Badge key={index} bg="light" text="dark" className="me-1 mb-1">
                              {specialty}
                            </Badge>
                          ))}
                          {seller.specialties.length > 3 && (
                            <Badge bg="light" text="dark">
                              +{seller.specialties.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="mt-auto d-grid">
                        <Button variant="outline-primary" className="d-flex align-items-center justify-content-center">
                          View Tailor Profile <FaArrowRight className="ms-2" />
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </div>
      )}

      <h2 className="display-6 mb-4">All Tailors</h2>
      {filteredSellers.length === 0 ? (
        <Card className="text-center p-4">
          <Card.Body>
            <FaTshirt size={50} className="text-muted mb-3" />
            <h3 className="h4 mb-3">No tailors found</h3>
            <p className="text-muted mb-3">
              We couldn't find any tailors matching your search criteria.
            </p>
            <Button variant="primary" onClick={handleClearFilters}>
              Clear All Filters
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {filteredSellers.map((seller) => (
            <Col key={seller._id} lg={3} md={4} sm={6} className="mb-1">
              <Link to={`/seller/${seller._id}`} className="text-decoration-none">
                <Card className="h-100 seller-card hover-effect">
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex mb-3">
                      <div className="me-3" style={{
                        width: '60px',
                        height: '60px',
                        overflow: 'hidden',
                        borderRadius: '50%'
                      }}>
                        {seller.logo ? (
                          <img 
                            src={`${API_URL}/uploads/${seller.logo}`} 
                            alt={seller.businessName}
                            className="w-100 h-100 object-fit-cover"
                          />
                        ) : (
                          <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-primary text-white">
                            {seller.businessName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="h5 mb-1">{seller.businessName}</h3>
                        {seller.rating && (
                          <div>
                            {renderStarRating(seller.rating.average)}
                          </div>
                        )}
                        {seller.location && (
                          <div className="text-muted small">
                            <FaMapMarkerAlt className="me-1" />
                            {seller.location.city}, {seller.location.country}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-muted small mb-3">
                      {seller.businessDescription ? 
                        (seller.businessDescription.length > 100 
                          ? `${seller.businessDescription.substring(0, 100)}...` 
                          : seller.businessDescription) 
                        : 'No description available'}
                    </p>
                    
                    {seller.specialties && seller.specialties.length > 0 && (
                      <div className="mb-3">
                        {seller.specialties.slice(0, 2).map((specialty, index) => (
                          <Badge key={index} bg="light" text="dark" className="me-1 mb-1">
                            {specialty}
                          </Badge>
                        ))}
                        {seller.specialties.length > 2 && (
                          <Badge bg="light" text="dark">
                            +{seller.specialties.length - 2} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-auto d-grid">
                      <Button variant="outline-primary" size="sm" className="d-flex align-items-center justify-content-center">
                        View Profile <FaArrowRight size={12} className="ms-2" />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default SellerList; 