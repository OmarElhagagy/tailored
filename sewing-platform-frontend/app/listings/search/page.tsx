'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [listings, setListings] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    pages: 1
  });
  
  // Filter states
  const [query, setQuery] = useState(searchParams?.get('query') || '');
  const [category, setCategory] = useState(searchParams?.get('category') || '');
  const [subCategory, setSubCategory] = useState(searchParams?.get('subCategory') || '');
  const [minPrice, setMinPrice] = useState(searchParams?.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams?.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(searchParams?.get('sortBy') || 'relevance');
  const [sortDir, setSortDir] = useState(searchParams?.get('sortDir') || 'desc');
  const [deliveryMethod, setDeliveryMethod] = useState(searchParams?.get('deliveryMethod') || '');
  const [inStock, setInStock] = useState(searchParams?.get('inStock') !== 'false');
  const [customizable, setCustomizable] = useState(searchParams?.get('customizable') === 'true');
  const [rating, setRating] = useState(searchParams?.get('rating') || '');
  const [material, setMaterial] = useState(searchParams?.get('material') || '');
  
  // Filter metadata
  const [categories, setCategories] = useState<any[]>([]);
  const [priceRanges, setPriceRanges] = useState<any>({ minPrice: 0, maxPrice: 1000, avgPrice: 0 });
  const [deliveryMethods, setDeliveryMethods] = useState<any[]>([]);
  
  // Load search results based on filters
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        
        // Build query params
        const params = new URLSearchParams();
        if (query) params.append('query', query);
        if (category) params.append('category', category);
        if (subCategory) params.append('subCategory', subCategory);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (sortBy) params.append('sortBy', sortBy);
        if (sortDir) params.append('sortDir', sortDir);
        if (deliveryMethod) params.append('deliveryMethod', deliveryMethod);
        params.append('inStock', inStock.toString());
        if (customizable) params.append('customizable', 'true');
        if (rating) params.append('rating', rating);
        if (material) params.append('material', material);
        params.append('page', pagination.page.toString());
        params.append('limit', pagination.limit.toString());
        
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/listings/search?${params.toString()}`
        );
        
        setListings(response.data.data.listings);
        setPagination(response.data.data.pagination);
        setCategories(response.data.data.filters.categories);
        setPriceRanges(response.data.data.filters.priceRanges);
        setDeliveryMethods(response.data.data.filters.deliveryMethods);
        setError('');
        
        // Update URL with current search params
        const newParams = new URLSearchParams(window.location.search);
        if (query) newParams.set('query', query); else newParams.delete('query');
        if (category) newParams.set('category', category); else newParams.delete('category');
        if (subCategory) newParams.set('subCategory', subCategory); else newParams.delete('subCategory');
        if (minPrice) newParams.set('minPrice', minPrice); else newParams.delete('minPrice');
        if (maxPrice) newParams.set('maxPrice', maxPrice); else newParams.delete('maxPrice');
        if (sortBy !== 'relevance') newParams.set('sortBy', sortBy); else newParams.delete('sortBy');
        if (sortDir !== 'desc') newParams.set('sortDir', sortDir); else newParams.delete('sortDir');
        if (deliveryMethod) newParams.set('deliveryMethod', deliveryMethod); else newParams.delete('deliveryMethod');
        if (!inStock) newParams.set('inStock', 'false'); else newParams.delete('inStock');
        if (customizable) newParams.set('customizable', 'true'); else newParams.delete('customizable');
        if (rating) newParams.set('rating', rating); else newParams.delete('rating');
        if (material) newParams.set('material', material); else newParams.delete('material');
        if (pagination.page > 1) newParams.set('page', pagination.page.toString()); else newParams.delete('page');
        
        const newUrl = `${window.location.pathname}?${newParams.toString()}`;
        window.history.pushState({}, '', newUrl);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load listings');
        console.error('Error fetching listings:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchListings();
  }, [
    query, category, subCategory, minPrice, maxPrice, 
    sortBy, sortDir, deliveryMethod, inStock, customizable,
    rating, material, pagination.page
  ]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset to first page when changing search params
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  const clearFilters = () => {
    setCategory('');
    setSubCategory('');
    setMinPrice('');
    setMaxPrice('');
    setDeliveryMethod('');
    setInStock(true);
    setCustomizable(false);
    setRating('');
    setMaterial('');
    setSortBy('relevance');
    setSortDir('desc');
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg 
            key={star} 
            className={`w-4 h-4 ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search Listings</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className="md:w-1/4">
          <div className="bg-white rounded-lg shadow p-4 sticky top-4">
            <form onSubmit={handleSearch}>
              <div className="mb-4">
                <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  id="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="border rounded w-full py-2 px-3"
                  placeholder="Search listings..."
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setSubCategory('');
                  }}
                  className="border rounded w-full py-2 px-3"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat._id} ({cat.count})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="border rounded w-full py-2 px-3"
                    placeholder="Min"
                    min={0}
                  />
                  <span className="self-center">-</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="border rounded w-full py-2 px-3"
                    placeholder="Max"
                    min={0}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="deliveryMethod" className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Method
                </label>
                <select
                  id="deliveryMethod"
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                  className="border rounded w-full py-2 px-3"
                >
                  <option value="">Any Method</option>
                  {deliveryMethods.map((method) => (
                    <option key={method._id} value={method._id}>
                      {method._id} ({method.count})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-1">
                  Material
                </label>
                <input
                  type="text"
                  id="material"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="border rounded w-full py-2 px-3"
                  placeholder="Search by material..."
                />
                <p className="text-xs text-gray-500 mt-1">Type just a few letters to find materials</p>
              </div>
              
              <div className="mb-4">
                <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Rating
                </label>
                <select
                  id="rating"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="border rounded w-full py-2 px-3"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                  <option value="1">1+ Stars</option>
                </select>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="inStock"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="inStock" className="text-sm font-medium text-gray-700">
                    In Stock Only
                  </label>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="customizable"
                    checked={customizable}
                    onChange={(e) => setCustomizable(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="customizable" className="text-sm font-medium text-gray-700">
                    Customizable Only
                  </label>
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <div className="flex space-x-2">
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border rounded flex-grow py-2 px-3"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price">Price</option>
                    <option value="date">Date</option>
                    <option value="rating">Rating</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
                    className="border rounded p-2"
                    title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
                  >
                    {sortDir === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex-grow"
                >
                  Apply Filters
                </button>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Search Results */}
        <div className="md:w-3/4">
          {/* Results summary */}
          <div className="mb-4">
            <p className="text-gray-600">
              {pagination.total} results found
              {query && ` for "${query}"`}
              {category && ` in ${category}`}
            </p>
          </div>
          
          {loading && listings.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : listings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <div key={listing._id} className="bg-white rounded-lg shadow overflow-hidden">
                    <Link href={`/listings/${listing._id}`}>
                      <div className="relative h-48 w-full">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${listing.mainPhoto}`}
                          alt={listing.title}
                          fill
                          className="object-cover"
                        />
                        {listing.lowStock && (
                          <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs py-1 px-2 rounded">
                            Low Stock
                          </div>
                        )}
                        {listing.stockStatus === 'out_of_stock' && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs py-1 px-2 rounded">
                            Out of Stock
                          </div>
                        )}
                      </div>
                    </Link>
                    
                    <div className="p-4">
                      <Link href={`/listings/${listing._id}`}>
                        <h2 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                          {listing.title}
                        </h2>
                      </Link>
                      
                      <div className="mt-1 flex items-center">
                        {renderStarRating(listing.rating.average)}
                        <span className="ml-1 text-sm text-gray-500">
                          ({listing.rating.count})
                        </span>
                      </div>
                      
                      <p className="mt-1 text-gray-500 text-sm">
                        {listing.category}
                        {listing.subCategory && ` > ${listing.subCategory}`}
                      </p>
                      
                      <div className="mt-2 flex justify-between items-center">
                        <p className="text-lg font-bold text-gray-900">
                          ${listing.price.toFixed(2)}
                        </p>
                        
                        <Link
                          href={`/listings/${listing._id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Details
                        </Link>
                      </div>
                      
                      <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
                        <p>
                          By {listing.sellerId.businessName || `${listing.sellerId.firstName} ${listing.sellerId.lastName}`}
                        </p>
                        
                        {listing.customizable && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            Customizable
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                      className={`px-4 py-2 border rounded ${
                        pagination.page === 1 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: Math.min(pagination.pages, 5) }).map((_, i) => {
                      const pageNum = pagination.page <= 3 
                        ? i + 1 
                        : pagination.page + i - 2;
                        
                      if (pageNum > pagination.pages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                          className={`px-4 py-2 border rounded ${
                            pagination.page === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.pages}
                      className={`px-4 py-2 border rounded ${
                        pagination.page === pagination.pages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-lg text-gray-600">No listings found matching your criteria</p>
              <button
                onClick={clearFilters}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 