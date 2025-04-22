'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Card from '../../components/Card';
import { Button, Input, Select, Checkbox } from '../../components/FormElements';
import { listingsAPI } from '../../src/services/api';

// Filter and sort options
const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'suits', label: 'Suits' },
  { value: 'dresses', label: 'Dresses' },
  { value: 'alterations', label: 'Alterations' },
  { value: 'repairs', label: 'Repairs' },
  { value: 'custom', label: 'Custom Designs' },
  { value: 'kids', label: 'Children\'s Wear' },
  { value: 'costumes', label: 'Costumes' }
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' }
];

export default function ListingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // State for filter controls
  const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') !== 'false');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [maxDeliveryDays, setMaxDeliveryDays] = useState(searchParams.get('maxDays') || '');
  
  // State for results
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch listings from API
  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        // Build query parameters
        const params: Record<string, string> = {};
        if (searchTerm) params.search = searchTerm;
        if (category) params.category = category;
        if (sortBy) params.sort = sortBy;
        if (location) params.location = location;
        if (maxPrice) params.maxPrice = maxPrice;
        if (maxDeliveryDays) params.maxDeliveryDays = maxDeliveryDays;
        
        // Use the listings API service
        const data = await listingsAPI.getListings(params);
        setListings(data.listings || []);
      } catch (err: any) {
        console.error('Error fetching listings:', err);
        setError('Failed to load listings. Please try again later.');
        setListings([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchListings();
  }, [searchTerm, category, sortBy, location, inStockOnly, maxPrice, maxDeliveryDays]);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update URL with search parameters
    const params = new URLSearchParams();
    if (searchTerm) params.set('query', searchTerm);
    if (category) params.set('category', category);
    if (sortBy) params.set('sort', sortBy);
    if (location) params.set('location', location);
    if (!inStockOnly) params.set('inStock', 'false');
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (maxDeliveryDays) params.set('maxDays', maxDeliveryDays);
    
    router.push(`/listings?${params.toString()}`);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setCategory('');
    setSortBy('relevance');
    setLocation('');
    setInStockOnly(true);
    setMaxPrice('');
    setMaxDeliveryDays('');
    router.push('/listings');
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero/Search Section */}
        <section className="mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Find the Perfect Tailor
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Search through our listings of skilled tailors for your custom clothing needs.
            </p>
            
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <Input 
                  id="search"
                  label="Search"
                  type="text"
                  placeholder="Search tailors, services, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-grow"
                />
                
                <div className="flex flex-col md:flex-row gap-4">
                  <Select
                    id="category"
                    label="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    options={CATEGORIES}
                    className="w-full md:w-40"
                  />
                  
                  <Select
                    id="sort"
                    label="Sort By"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    options={SORT_OPTIONS}
                    className="w-full md:w-48"
                  />
                </div>
              </div>
              
              <div className="flex items-end justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? 'Hide Filters' : 'More Filters'}
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetFilters}
                  >
                    Reset
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="primary"
                  >
                    Search
                  </Button>
                </div>
              </div>
              
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Input 
                    id="location"
                    label="Location"
                    type="text"
                    placeholder="City, state, or zip code..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  
                  <Input 
                    id="maxPrice"
                    label="Maximum Price"
                    type="number"
                    placeholder="Enter maximum price..."
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                  
                  <Input 
                    id="maxDeliveryDays"
                    label="Maximum Delivery Days"
                    type="number"
                    placeholder="Enter maximum days..."
                    value={maxDeliveryDays}
                    onChange={(e) => setMaxDeliveryDays(e.target.value)}
                  />
                  
                  <Checkbox
                    id="inStockOnly"
                    label="Available Now"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                  />
                </div>
              )}
            </form>
          </div>
        </section>
        
        {/* Results Section */}
        <section>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isLoading ? 'Loading Results...' : `${listings.length} Results Found`}
            </h2>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-6 rounded-lg text-center">
              {error}
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                No results found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Try adjusting your search filters or search for something else.
              </p>
              <Button variant="primary" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <Card
                  key={listing._id}
                  title={listing.title}
                  description={listing.description}
                  imageSrc={listing.imageUrl || '/images/placeholder.jpg'}
                  rating={listing.averageRating}
                  reviewCount={listing.reviewCount}
                  price={`From $${listing.startingPrice}`}
                  tags={listing.tags}
                  location={listing.location}
                  ctaText="View Details"
                  ctaLink={`/listings/${listing._id}`}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
