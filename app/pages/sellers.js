import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Sellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  
  // Mock sellers data
  const mockSellers = [
    {
      id: 'premium-tailors',
      name: 'Premium Tailors',
      rating: 4.8,
      reviews: 124,
      location: 'New York, NY',
      phone: '+1 (555) 123-4567',
      bio: 'We specialize in high-quality tailored suits with over 20 years of experience in the industry.',
      image: 'https://via.placeholder.com/150',
      specialties: ['Men\'s Suits', 'Formal Wear', 'Business Attire'],
      featured: true
    },
    {
      id: 'fashion-studio',
      name: 'Fashion Studio',
      rating: 4.6,
      reviews: 87,
      location: 'Los Angeles, CA',
      phone: '+1 (555) 987-6543',
      bio: 'We create unique, fashion-forward designs for all occasions.',
      image: 'https://via.placeholder.com/150',
      specialties: ['Women\'s Dresses', 'Evening Wear', 'Custom Design'],
      featured: true
    },
    {
      id: 'urban-threads',
      name: 'Urban Threads',
      rating: 4.5,
      reviews: 62,
      location: 'Chicago, IL',
      phone: '+1 (555) 456-7890',
      bio: 'Contemporary casual wear with a focus on sustainable materials and ethical production.',
      image: 'https://via.placeholder.com/150',
      specialties: ['Casual Wear', 'Sustainable Fashion', 'Men\'s Shirts'],
      featured: false
    },
    {
      id: 'elite-tailors',
      name: 'Elite Tailors',
      rating: 4.9,
      reviews: 218,
      location: 'Boston, MA',
      phone: '+1 (555) 234-5678',
      bio: 'Luxury tailoring services for discerning clients who demand excellence.',
      image: 'https://via.placeholder.com/150',
      specialties: ['Luxury Wear', 'Designer Jackets', 'Custom Suits'],
      featured: true
    },
    {
      id: 'summer-collections',
      name: 'Summer Collections',
      rating: 4.3,
      reviews: 45,
      location: 'Miami, FL',
      phone: '+1 (555) 876-5432',
      bio: 'Specializing in light, breathable summer fashion for all occasions.',
      image: 'https://via.placeholder.com/150',
      specialties: ['Summer Wear', 'Beachwear', 'Light Fabrics'],
      featured: false
    },
    {
      id: 'corporate-wear',
      name: 'Corporate Wear',
      rating: 4.7,
      reviews: 92,
      location: 'Washington, DC',
      phone: '+1 (555) 345-6789',
      bio: 'Professional attire for the modern workplace, focusing on comfort and style.',
      image: 'https://via.placeholder.com/150',
      specialties: ['Business Attire', 'Professional Wear', 'Corporate Uniforms'],
      featured: false
    },
    {
      id: 'bridal-elegance',
      name: 'Bridal Elegance',
      rating: 4.9,
      reviews: 156,
      location: 'New York, NY',
      phone: '+1 (555) 678-9012',
      bio: 'Creating dream wedding dresses and bridal party attire with meticulous attention to detail.',
      image: 'https://via.placeholder.com/150',
      specialties: ['Wedding Dresses', 'Bridal Party Attire', 'Formal Wear'],
      featured: true
    },
    {
      id: 'seasonal-wear',
      name: 'Seasonal Wear',
      rating: 4.4,
      reviews: 78,
      location: 'Denver, CO',
      phone: '+1 (555) 901-2345',
      bio: 'Clothes for all seasons, with a focus on adaptable, durable designs.',
      image: 'https://via.placeholder.com/150',
      specialties: ['Winter Coats', 'Seasonal Fashion', 'Outerwear'],
      featured: false
    }
  ];
  
  useEffect(() => {
    // In a real app, fetch sellers from an API
    setSellers(mockSellers);
    setLoading(false);
  }, []);
  
  // Get unique locations for filter
  const locations = [...new Set(mockSellers.map(seller => seller.location))];
  
  // Filter sellers based on search term and location
  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = seller.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         seller.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         seller.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLocation = locationFilter ? seller.location === locationFilter : true;
    
    return matchesSearch && matchesLocation;
  });
  
  // Featured sellers
  const featuredSellers = filteredSellers.filter(seller => seller.featured);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900">Find Skilled Tailors</h1>
          <p className="mt-2 text-lg text-gray-500">
            Connect with professional tailors and get custom-made clothing that fits your style.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row">
            <div className="flex-1 min-w-0 mb-4 sm:mb-0 sm:mr-4">
              <label htmlFor="search" className="sr-only">Search tailors</label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Search by name, specialty, or keyword"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="sm:w-64">
              <label htmlFor="location" className="sr-only">Filter by location</label>
              <select
                id="location"
                name="location"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="">All locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {featuredSellers.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Tailors</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featuredSellers.map(seller => (
                <div key={seller.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-4 flex items-center">
                    <img
                      className="h-16 w-16 rounded-full"
                      src={seller.image}
                      alt={seller.name}
                    />
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{seller.name}</h3>
                      <div className="flex items-center">
                        <div className="flex items-center">
                          {[0, 1, 2, 3, 4].map((rating) => (
                            <svg
                              key={rating}
                              className={`h-4 w-4 ${
                                seller.rating > rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-500">
                          {seller.rating} ({seller.reviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-4">
                    <p className="text-sm text-gray-500 line-clamp-2">{seller.bio}</p>
                    <p className="mt-2 text-sm text-gray-500">
                      <span className="font-medium">Location:</span> {seller.location}
                    </p>
                    <div className="mt-2">
                      <span className="text-sm font-medium text-gray-500">Specialties:</span>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {seller.specialties.map(specialty => (
                          <span
                            key={specialty}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link
                        href={`/sellers/${seller.id}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <h2 className="text-2xl font-bold text-gray-900 mb-6">All Tailors</h2>
        
        {filteredSellers.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredSellers.map(seller => (
              <div key={seller.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-4 flex items-center">
                  <img
                    className="h-16 w-16 rounded-full"
                    src={seller.image}
                    alt={seller.name}
                  />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{seller.name}</h3>
                    <div className="flex items-center">
                      <div className="flex items-center">
                        {[0, 1, 2, 3, 4].map((rating) => (
                          <svg
                            key={rating}
                            className={`h-4 w-4 ${
                              seller.rating > rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-500">
                        {seller.rating} ({seller.reviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 px-4 py-4">
                  <p className="text-sm text-gray-500 line-clamp-2">{seller.bio}</p>
                  <p className="mt-2 text-sm text-gray-500">
                    <span className="font-medium">Location:</span> {seller.location}
                  </p>
                  <div className="mt-2">
                    <span className="text-sm font-medium text-gray-500">Specialties:</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {seller.specialties.map(specialty => (
                        <span
                          key={specialty}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link
                      href={`/sellers/${seller.id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No tailors found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        )}
      </main>
    </div>
  );
} 