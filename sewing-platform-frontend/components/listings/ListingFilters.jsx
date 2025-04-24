import React, { useState, useEffect } from 'react';
import { Input, Select, Button, Checkbox, RadioGroup } from '../FormElements';

const ListingFilters = ({ onApplyFilters, initialFilters, categories }) => {
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    rating: '',
    search: '',
    sortBy: 'newest',
    ...initialFilters
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);

  useEffect(() => {
    // Check if any filters are applied
    const defaultFilters = {
      category: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      search: '',
      sortBy: 'newest'
    };

    const hasFilters = Object.keys(filters).some(key => {
      // Skip search for determination of filter badge
      if (key === 'search') return false;
      return filters[key] !== defaultFilters[key] && filters[key] !== '';
    });

    setHasAppliedFilters(hasFilters);
  }, [filters]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (e) => {
    setFilters((prev) => ({ ...prev, rating: e.target.value }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      category: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      sortBy: 'newest',
      search: filters.search // Preserve search
    };
    setFilters(clearedFilters);
    onApplyFilters(clearedFilters);
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' }
  ];

  const ratingOptions = [
    { value: '4', label: '4+ Stars' },
    { value: '3', label: '3+ Stars' },
    { value: '2', label: '2+ Stars' },
    { value: '1', label: '1+ Stars' },
    { value: '', label: 'Any Rating' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 md:mb-0">
          Filters
          {hasAppliedFilters && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-blue-600 rounded-full">
              !
            </span>
          )}
        </h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Hide Filters' : 'Show Filters'}
          </Button>
          {hasAppliedFilters && (
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Search and Sort Controls - Always Visible */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Input
          id="search"
          name="search"
          label="Search Listings"
          placeholder="Search by keyword..."
          value={filters.search}
          onChange={handleInputChange}
        />
        <Select
          id="sortBy"
          name="sortBy"
          label="Sort By"
          value={filters.sortBy}
          onChange={handleInputChange}
          options={sortOptions}
        />
      </div>

      {/* Expandable Filter Controls */}
      {isExpanded && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Select
              id="category"
              name="category"
              label="Category"
              value={filters.category}
              onChange={handleInputChange}
              options={[
                { value: '', label: 'All Categories' },
                ...(categories || []).map(cat => ({ value: cat, label: cat }))
              ]}
            />
            <Input
              id="minPrice"
              name="minPrice"
              label="Min Price"
              type="number"
              placeholder="0"
              value={filters.minPrice}
              onChange={handleInputChange}
              min={0}
            />
            <Input
              id="maxPrice"
              name="maxPrice"
              label="Max Price"
              type="number"
              placeholder="Any"
              value={filters.maxPrice}
              onChange={handleInputChange}
              min={0}
            />
          </div>

          <div className="mb-4">
            <RadioGroup
              legend="Minimum Rating"
              name="rating"
              value={filters.rating}
              onChange={handleRatingChange}
              options={ratingOptions}
              inline={true}
            />
          </div>
        </>
      )}

      <div className="flex justify-end">
        <Button onClick={handleApplyFilters}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default ListingFilters; 