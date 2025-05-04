import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import {
  Container, Row, Col, Card, Button, Form, InputGroup,
  Spinner, Alert, Badge
} from 'react-bootstrap';
import { FaSearch, FaStar, FaMapMarkerAlt } from 'react-icons/fa';
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
          response.data.data.sellers.forEach((seller: Seller) => {
            if (seller.location && seller.location.city && seller.location.country) {
              locationSet.add(`${seller.location.city}, ${seller.location.country}`);
            }
          });
          setLocations(Array.from(locationSet));
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

  // Filter sellers based on search term and location
  const getFilteredSellers = () => {
    return sellers.filter(seller => {
      const matchesSearch = searchTerm === '' || 
                           seller.businessName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (seller.businessDescription && seller.businessDescription.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (seller.specialties && seller.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())));
      
      const matchesLocation = locationFilter === '' || 
                             (seller.location && 
                              `${seller.location.city}, ${seller.location.country}` === locationFilter);
      
      return matchesSearch && matchesLocation;
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
          />
        ))}
        <span className="ms-2">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Loading sellers...</p>
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
      <Row className="mb-4">
        <Col>
          <h1 className="mb-4">Find Skilled Tailors</h1>
          <p className="text-muted">
            Connect with professional tailors and get custom-made clothing that fits your style.
          </p>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={8}>
              <Form onSubmit={handleSearchSubmit}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search by name, specialty, or description"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button type="submit" variant="primary">
                    <FaSearch className="me-1" /> Search
                  </Button>
                </InputGroup>
              </Form>
            </Col>
            <Col md={4}>
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
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {featuredSellers.length > 0 && (
        <>
          <h2 className="mb-3">Featured Tailors</h2>
          <Row className="mb-5">
            {featuredSellers.map((seller) => (
              <Col key={seller._id} lg={4} md={6} className="mb-4">
                <Card className="h-100 seller-card">
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex mb-3">
                      <div className="seller-avatar me-3">
                        {seller.logo ? (
                          <img 
                            src={`${API_URL}/uploads/${seller.logo}`} 
                            alt={seller.businessName}
                            className="img-fluid rounded-circle"
                          />
                        ) : (
                          <div className="avatar-placeholder rounded-circle">
                            {seller.businessName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="h5 mb-1">{seller.businessName}</h3>
                        {seller.rating && (
                          <div className="mb-1">
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
                    </div>
                    <p className="text-muted small mb-3">
                      {seller.businessDescription ? 
                        (seller.businessDescription.length > 120 
                          ? `${seller.businessDescription.substring(0, 120)}...` 
                          : seller.businessDescription) 
                        : 'No description available'}
                    </p>
                    {seller.specialties && seller.specialties.length > 0 && (
                      <div className="mb-3">
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
                    <div className="mt-auto">
                      <Link to={`/seller/${seller._id}`} className="btn btn-primary">
                        View Profile
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}

      <h2 className="mb-3">All Tailors</h2>
      {filteredSellers.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <p className="mb-0">No tailors match your search criteria.</p>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {filteredSellers.map((seller) => (
            <Col key={seller._id} lg={4} md={6} className="mb-4">
              <Card className="h-100 seller-card">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex mb-3">
                    <div className="seller-avatar me-3">
                      {seller.logo ? (
                        <img 
                          src={`${API_URL}/uploads/${seller.logo}`} 
                          alt={seller.businessName}
                          className="img-fluid rounded-circle"
                        />
                      ) : (
                        <div className="avatar-placeholder rounded-circle">
                          {seller.businessName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="h5 mb-1">{seller.businessName}</h3>
                      {seller.rating && (
                        <div className="mb-1">
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
                  </div>
                  <p className="text-muted small mb-3">
                    {seller.businessDescription ? 
                      (seller.businessDescription.length > 120 
                        ? `${seller.businessDescription.substring(0, 120)}...` 
                        : seller.businessDescription) 
                      : 'No description available'}
                  </p>
                  {seller.specialties && seller.specialties.length > 0 && (
                    <div className="mb-3">
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
                  <div className="mt-auto">
                    <Link to={`/seller/${seller._id}`} className="btn btn-primary">
                      View Profile
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default SellerList; 