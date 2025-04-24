'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import ListingItem from '@/components/listings/ListingItem';
import ListingFilters from '@/components/listings/ListingFilters';
import { Button } from '@/components/FormElements';
import listingService from '@/src/api/services/listingService';

export default function ListingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for listings and pagination
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Get filters from URL params
  const getInitialFilters = () => {
    return {
      category: searchParams.get('category') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      rating: searchParams.get('rating') || '',
      search: searchParams.get('search') || '',
      sortBy: searchParams.get('sortBy') || 'newest',
    };
  };

  const [filters, setFilters] = useState(getInitialFilters());

  // Load categories 
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await listingService.getCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };

    loadCategories();
  }, []);

  // Fetch listings with current filters
  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const page = Number(searchParams.get('page')) || 1;
        setCurrentPage(page);
        
        // Create API query params
        const queryParams = {
          ...filters,
          page,
          limit: 12
        };
        
        // Clean up empty params
        Object.keys(queryParams).forEach(key => {
          if (queryParams[key] === '' || queryParams[key] === undefined) {
            delete queryParams[key];
          }
        });
        
        const response = await listingService.getListings(queryParams);
        setListings(response.items);
        setTotalItems(response.meta.total);
        setTotalPages(response.meta.totalPages);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to load listings. Please try again later.');
        setListings([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchListings();
  }, [searchParams, filters]);

  // Handle filter changes
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    
    // Update URL with filters
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== '' && value !== undefined) {
        params.set(key, value);
      }
    });
    
    // Reset to page 1 when filters change
    params.set('page', '1');
    
    router.push(`/listings?${params.toString()}`);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/listings?${params.toString()}`);
  };

  // Generate pagination buttons
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Previous button
    pages.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
    );
    
    // First page
    if (startPage > 1) {
      pages.push(
        <Button
          key="1"
          variant={currentPage === 1 ? 'primary' : 'outline'}
          size="sm"
          onClick={() => handlePageChange(1)}
        >
          1
        </Button>
      );
      
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-2">
            ...
          </span>
        );
      }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? 'primary' : 'outline'}
          size="sm"
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }
    
    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-2">
            ...
          </span>
        );
      }
      
      pages.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? 'primary' : 'outline'}
          size="sm"
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }
    
    // Next button
    pages.push(
      <Button
        key="next"
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    );
    
    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        {pages}
      </div>
    );
  };

  return (
    <MainLayout title="Browse Listings | TailorMatch" description="Find the perfect tailor for your unique style. Browse listings from skilled tailors offering custom-made garments, repairs, and alterations.">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-baseline mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Browse Listings
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isLoading ? 'Loading...' : totalItems > 0 ? `Showing ${listings.length} of ${totalItems} listings` : 'No listings found'}
          </p>
        </div>
        
        {/* Filters */}
        <ListingFilters 
          onApplyFilters={handleApplyFilters} 
          initialFilters={filters}
          categories={categories}
        />
        
        {/* Results */}
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
              No listings found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Try adjusting your search filters or browse all listings.
            </p>
            <Button 
              variant="primary" 
              onClick={() => handleApplyFilters({
                category: '',
                minPrice: '',
                maxPrice: '',
                rating: '',
                search: '',
                sortBy: 'newest'
              })}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map(listing => (
                <ListingItem key={listing._id} listing={listing} />
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && renderPagination()}
          </>
        )}
      </div>
    </MainLayout>
  );
} 