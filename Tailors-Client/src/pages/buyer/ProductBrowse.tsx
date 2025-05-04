import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';
import { Container, Row, Col, Card, Form, Button, InputGroup, Spinner, Alert, Badge } from 'react-bootstrap';
import BuyerSidebar from '../../components/BuyerSidebar';
import { FaSearch, FaStar, FaFilter } from 'react-icons/fa';

// Types
interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  mainPhoto: string;
  rating: {
    average: number;
    count: number;
  };
  seller: {
    _id: string;
    businessName: string;
    rating: {
      average: number;
    };
  };
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface Filters {
  category: string[];
  priceRange: [number, number];
  rating: number;
  sellerRating: number;
}

interface FilterOption {
  _id: string;
  count: number;
}

const ProductBrowse: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    category: [],
    priceRange: [0, 1000],
    rating: 0,
    sellerRating: 0,
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [sortDirection, setSortDirection] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryOptions, setCategoryOptions] = useState<FilterOption[]>([]);
  const [priceRanges, setPriceRanges] = useState({ minPrice: 0, maxPrice: 1000, avgPrice: 0 });

  // Fetch products based on search, filters, sorting and pagination
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Construct query parameters
        const params: Record<string, any> = {
          page,
          limit: 12,
          sortBy,
          sortDir: sortDirection,
        };

        // Add search query if present
        if (searchQuery) {
          params.query = searchQuery;
        }

        // Add filters
        if (filters.category.length > 0) {
          params.category = filters.category.join(',');
        }

        params.minPrice = filters.priceRange[0];
        params.maxPrice = filters.priceRange[1];

        if (filters.rating > 0) {
          params.rating = filters.rating;
        }

        if (filters.sellerRating > 0) {
          params.sellerRating = filters.sellerRating;
        }

        const response = await axios.get(`${API_URL}/api/listings/search`, { params });
        
        if (response.data.success) {
          setProducts(response.data.data.listings);
          setTotalPages(response.data.data.pagination.pages);
          
          // Set filter options
          setCategoryOptions(response.data.data.filters.categories);
          setPriceRanges(response.data.data.filters.priceRanges);
        } else {
          setError('Failed to fetch products');
        }
      } catch (err) {
        setError('An error occurred while fetching products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, filters, sortBy, sortDirection, page]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  // Handle category filter change
  const handleCategoryChange = (category: string) => {
    setFilters(prev => {
      const newCategories = prev.category.includes(category)
        ? prev.category.filter(c => c !== category)
        : [...prev.category, category];
      
      return {
        ...prev,
        category: newCategories
      };
    });
    setPage(1); // Reset to first page on filter change
  };

  // Handle price range filter change
  const handlePriceRangeChange = (range: [number, number]) => {
    setFilters(prev => ({
      ...prev,
      priceRange: range
    }));
    setPage(1); // Reset to first page on filter change
  };

  // Handle rating filter change
  const handleRatingChange = (rating: number) => {
    setFilters(prev => ({
      ...prev,
      rating
    }));
    setPage(1); // Reset to first page on filter change
  };

  // Handle seller rating filter change
  const handleSellerRatingChange = (rating: number) => {
    setFilters(prev => ({
      ...prev,
      sellerRating: rating
    }));
    setPage(1); // Reset to first page on filter change
  };

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'price_asc') {
      setSortBy('price');
      setSortDirection('asc');
    } else if (value === 'price_desc') {
      setSortBy('price');
      setSortDirection('desc');
    } else if (value === 'newest') {
      setSortBy('date');
      setSortDirection('desc');
    } else if (value === 'rating') {
      setSortBy('rating');
      setSortDirection('desc');
    } else {
      setSortBy('relevance');
      setSortDirection('desc');
    }
    setPage(1); // Reset to first page on sort change
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: [],
      priceRange: [0, priceRanges.maxPrice],
      rating: 0,
      sellerRating: 0,
    });
    setSearchQuery('');
    setSortBy('relevance');
    setSortDirection('desc');
    setPage(1);
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="mb-0">Browse Products</h1>
          <p className="text-muted">Find custom tailoring services for your needs</p>
        </Col>
      </Row>

      <Row>
        {/* Sidebar for logged-in buyers */}
        {isAuthenticated && user?.role === 'buyer' && (
          <Col md={3} lg={2} className="mb-4">
            <BuyerSidebar />
          </Col>
        )}

        <Col md={isAuthenticated && user?.role === 'buyer' ? 9 : 12} lg={isAuthenticated && user?.role === 'buyer' ? 10 : 12}>
          {/* Search and Filter Card */}
          <Card className="mb-4">
            <Card.Body>
              <Form onSubmit={handleSearchSubmit}>
                <Row className="mb-3">
                  <Col md={8}>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Search for products, tailors, or services..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                      />
                      <Button type="submit" variant="primary">
                        <FaSearch className="me-2" /> Search
                      </Button>
                    </InputGroup>
                  </Col>
                  <Col md={4}>
                    <Form.Select onChange={handleSortChange}>
                      <option value="relevance">Sort by: Relevance</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="newest">Newest First</option>
                      <option value="rating">Highest Rated</option>
                    </Form.Select>
                  </Col>
                </Row>

                <Button 
                  variant="outline-secondary" 
                  className="mb-3" 
                  onClick={clearFilters}
                >
                  <FaFilter className="me-2" /> Clear Filters
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading products...</p>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : products.length === 0 ? (
            <Alert variant="info">
              No products found matching your criteria. Try adjusting your filters or search terms.
            </Alert>
          ) : (
            <Row>
              {products.map(product => (
                <Col md={6} lg={4} xl={3} key={product._id} className="mb-4">
                  <Card className="h-100 product-card">
                    <div className="product-image-container">
                      <img 
                        src={product.mainPhoto ? `${API_URL}/uploads/${product.mainPhoto}` : '/placeholder-product.jpg'} 
                        alt={product.title}
                        className="card-img-top product-image"
                      />
                      <div className="product-status">
                        {product.stockStatus === 'in_stock' && (
                          <Badge bg="success">In Stock</Badge>
                        )}
                        {product.stockStatus === 'low_stock' && (
                          <Badge bg="warning" text="dark">Low Stock</Badge>
                        )}
                        {product.stockStatus === 'out_of_stock' && (
                          <Badge bg="danger">Out of Stock</Badge>
                        )}
                      </div>
                    </div>
                    <Card.Body className="d-flex flex-column">
                      <Card.Title className="mb-2">{product.title}</Card.Title>
                      <Card.Text className="text-muted small mb-2">
                        {product.description.substring(0, 80)}...
                      </Card.Text>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-bold text-primary">${product.price.toFixed(2)}</span>
                        <div className="d-flex align-items-center">
                          {[...Array(5)].map((_, i) => (
                            <FaStar 
                              key={i}
                              color={i < Math.round(product.rating.average) ? '#ffc107' : '#e4e5e9'}
                              size={14}
                              className="me-1"
                            />
                          ))}
                          <small className="text-muted">({product.rating.count})</small>
                        </div>
                      </div>
                      <div className="text-muted small mb-3">
                        Seller: <Link to={`/seller/${product.seller._id}`}>{product.seller.businessName}</Link>
                      </div>
                      <Link to={`/product/${product._id}`} className="btn btn-primary mt-auto">
                        View Details
                      </Link>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <ul className="pagination">
                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProductBrowse; 