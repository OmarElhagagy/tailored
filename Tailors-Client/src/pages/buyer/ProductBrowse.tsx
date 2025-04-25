import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';

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
  const { isAuthenticated } = useAuth();
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

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-gray-600 text-sm">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Browse Products</h1>

        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearchSubmit}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search for products, tailors, or services..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Search
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear All
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 mb-2">Categories</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {categoryOptions.map((category) => (
                    <div key={category._id} className="flex items-center">
                      <input
                        id={`category-${category._id}`}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={filters.category.includes(category._id)}
                        onChange={() => handleCategoryChange(category._id)}
                      />
                      <label
                        htmlFor={`category-${category._id}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        {category._id} ({category.count})
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 mb-2">Price Range</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">${filters.priceRange[0]}</span>
                  <span className="text-sm text-gray-600">${filters.priceRange[1]}</span>
                </div>
                <input
                  type="range"
                  min={priceRanges.minPrice}
                  max={priceRanges.maxPrice}
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceRangeChange([filters.priceRange[0], parseInt(e.target.value)])}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Product Rating Filter */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 mb-2">Product Rating</h3>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center">
                      <input
                        id={`rating-${rating}`}
                        type="radio"
                        name="rating"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        checked={filters.rating === rating}
                        onChange={() => handleRatingChange(rating)}
                      />
                      <label
                        htmlFor={`rating-${rating}`}
                        className="ml-2 text-sm text-gray-700 flex items-center"
                      >
                        {renderStars(rating)} & Up
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seller Rating Filter */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 mb-2">Seller Rating</h3>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center">
                      <input
                        id={`seller-rating-${rating}`}
                        type="radio"
                        name="sellerRating"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        checked={filters.sellerRating === rating}
                        onChange={() => handleSellerRatingChange(rating)}
                      />
                      <label
                        htmlFor={`seller-rating-${rating}`}
                        className="ml-2 text-sm text-gray-700 flex items-center"
                      >
                        {renderStars(rating)} & Up
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="w-full lg:w-3/4">
            <div className="bg-white p-6 rounded-lg shadow">
              {/* Sort and Result Count */}
              <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <p className="text-gray-600 mb-2 md:mb-0">
                  Showing {products.length} products
                </p>
                <div className="flex items-center">
                  <label htmlFor="sort" className="text-sm text-gray-600 mr-2">
                    Sort by:
                  </label>
                  <select
                    id="sort"
                    className="border border-gray-300 rounded-md text-sm px-2 py-1"
                    value={sortBy === 'price' ? `price_${sortDirection}` : sortBy}
                    onChange={handleSortChange}
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="newest">Newest</option>
                    <option value="rating">Best Rating</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="text-center text-red-600 py-12">{error}</div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No products found matching your criteria.</p>
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Link
                      key={product._id}
                      to={`/product/${product._id}`}
                      className="group"
                    >
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                          <img
                            src={product.mainPhoto || 'https://via.placeholder.com/300'}
                            alt={product.title}
                            className="object-cover object-center w-full h-48 group-hover:opacity-90 transition-opacity"
                          />
                        </div>
                        <div className="p-4">
                          <div className="mb-1 text-sm text-gray-500">{product.category}</div>
                          <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors mb-2 truncate">
                            {product.title}
                          </h3>
                          <p className="text-gray-700 font-bold mb-2">${product.price.toFixed(2)}</p>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600 truncate">
                              By {product.seller.businessName}
                            </div>
                            {product.rating && product.rating.average > 0 && (
                              <div className="flex items-center">
                                {renderStars(product.rating.average)}
                              </div>
                            )}
                          </div>
                          <div className="mt-3">
                            <span
                              className={`px-2 py-1 text-xs rounded ${
                                product.stockStatus === 'in_stock'
                                  ? 'bg-green-100 text-green-800'
                                  : product.stockStatus === 'low_stock'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {product.stockStatus === 'in_stock'
                                ? 'In Stock'
                                : product.stockStatus === 'low_stock'
                                ? 'Low Stock'
                                : 'Out of Stock'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <nav className="flex items-center space-x-1">
                    <button
                      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className={`px-3 py-1 rounded-md ${
                        page === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      } border`}
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        onClick={() => setPage(pageNumber)}
                        className={`px-3 py-1 rounded-md ${
                          page === pageNumber
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        } border`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={page === totalPages}
                      className={`px-3 py-1 rounded-md ${
                        page === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      } border`}
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductBrowse; 