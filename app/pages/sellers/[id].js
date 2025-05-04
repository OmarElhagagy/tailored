import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function SellerProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [seller, setSeller] = useState(null);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
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
      coverImage: 'https://via.placeholder.com/1200x400',
      specialties: ['Men\'s Suits', 'Formal Wear', 'Business Attire'],
      featured: true,
      establishedYear: 2003,
      description: 'Premium Tailors has been crafting fine suits and formal wear since 2003. Our master tailors bring decades of experience to every garment, ensuring perfect fit and exceptional quality. We use only the finest materials sourced from the best mills in Italy and the UK. Our attention to detail and commitment to customer satisfaction has earned us a reputation as one of the premier tailoring establishments in New York City. Whether you need a bespoke suit for a special occasion or want to upgrade your professional wardrobe, our team is here to provide personalized service and expert craftsmanship.',
      services: [
        'Custom suit tailoring',
        'Formalwear for special occasions',
        'Corporate uniform design',
        'Alterations and repairs',
        'Style consultations'
      ],
      team: [
        { name: 'Robert Johnson', role: 'Master Tailor', image: 'https://via.placeholder.com/100' },
        { name: 'Maria Garcia', role: 'Design Specialist', image: 'https://via.placeholder.com/100' },
        { name: 'David Chen', role: 'Fabric Expert', image: 'https://via.placeholder.com/100' }
      ],
      reviews: [
        { id: 1, user: 'John D.', rating: 5, comment: 'Excellent quality suit, perfect fit!', date: '2023-05-15' },
        { id: 2, user: 'Michael S.', rating: 4, comment: 'Good material and craftsmanship.', date: '2023-04-22' },
        { id: 3, user: 'Robert T.', rating: 5, comment: 'Professional service and amazing attention to detail.', date: '2023-03-10' }
      ]
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
      coverImage: 'https://via.placeholder.com/1200x400',
      specialties: ['Women\'s Dresses', 'Evening Wear', 'Custom Design'],
      featured: true,
      establishedYear: 2010,
      description: 'Fashion Studio was founded in 2010 with a mission to create unique, fashion-forward designs that help our clients express their individual style. Based in Los Angeles, we draw inspiration from the city\'s vibrant culture and diverse fashion scene. Our team of designers and tailors work closely with each client to create custom garments that are both beautiful and comfortable. We specialize in women\'s dresses and evening wear, with a focus on innovative design and impeccable fit. Our creations have been featured in fashion shows and worn by celebrities on red carpets across the country.',
      services: [
        'Custom dress design',
        'Evening and formal wear',
        'Wedding dresses and bridal party attire',
        'Alterations for perfect fit',
        'Fashion consultation'
      ],
      team: [
        { name: 'Elena Rodriguez', role: 'Lead Designer', image: 'https://via.placeholder.com/100' },
        { name: 'Thomas Kim', role: 'Pattern Maker', image: 'https://via.placeholder.com/100' },
        { name: 'Sophia Lee', role: 'Embroidery Specialist', image: 'https://via.placeholder.com/100' }
      ],
      reviews: [
        { id: 1, user: 'Emma L.', rating: 5, comment: 'Beautiful dress, received many compliments!', date: '2023-06-10' },
        { id: 2, user: 'Sophia R.', rating: 4, comment: 'Gorgeous design and comfortable to wear.', date: '2023-05-28' },
        { id: 3, user: 'Jennifer M.', rating: 5, comment: 'The attention to detail was amazing. Love my dress!', date: '2023-04-15' }
      ]
    }
  ];
  
  // Mock products data
  const mockProducts = [
    { 
      id: 1, 
      name: 'Tailored Suit', 
      price: 299.99, 
      image: 'https://via.placeholder.com/300x400', 
      seller: 'Premium Tailors', 
      sellerId: 'premium-tailors',
      category: "Men's Suits" 
    },
    { 
      id: 2, 
      name: 'Evening Dress', 
      price: 189.99, 
      image: 'https://via.placeholder.com/300x400', 
      seller: 'Fashion Studio', 
      sellerId: 'fashion-studio',
      category: "Women's Dresses" 
    },
    { 
      id: 7, 
      name: 'Wedding Dress', 
      price: 599.99, 
      image: 'https://via.placeholder.com/300x400', 
      seller: 'Fashion Studio', 
      sellerId: 'fashion-studio',
      category: "Wedding Attire" 
    },
    { 
      id: 9, 
      name: 'Business Suit', 
      price: 349.99, 
      image: 'https://via.placeholder.com/300x400', 
      seller: 'Premium Tailors', 
      sellerId: 'premium-tailors',
      category: "Men's Suits" 
    },
    { 
      id: 10, 
      name: 'Tuxedo', 
      price: 399.99, 
      image: 'https://via.placeholder.com/300x400', 
      seller: 'Premium Tailors', 
      sellerId: 'premium-tailors',
      category: "Formal Wear" 
    },
    { 
      id: 11, 
      name: 'Cocktail Dress', 
      price: 159.99, 
      image: 'https://via.placeholder.com/300x400', 
      seller: 'Fashion Studio', 
      sellerId: 'fashion-studio',
      category: "Women's Dresses" 
    }
  ];
  
  useEffect(() => {
    if (id) {
      // In a real app, fetch seller data from an API
      const foundSeller = mockSellers.find(s => s.id === id);
      if (foundSeller) {
        setSeller(foundSeller);
        
        // Filter products by this seller
        const sellerProds = mockProducts.filter(p => p.sellerId === id);
        setSellerProducts(sellerProds);
        
        setLoading(false);
      } else {
        // Instead of redirecting, set loading to false to show 404 error
        setLoading(false);
      }
    }
  }, [id, router]);
  
  // Show 404 error if seller is not found
  if (!loading && !seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-red-600 mb-2">Seller Not Found</h1>
        <p className="text-gray-600 mb-6">The seller you are looking for does not exist or has been removed.</p>
        <Link href="/sellers" className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
          Browse All Sellers
        </Link>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative">
        <div className="h-48 sm:h-64 md:h-80 w-full bg-gray-300 overflow-hidden">
          <img 
            src={seller.coverImage} 
            alt={`${seller.name} cover`} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-16 sm:-mt-24">
            <div className="flex flex-col sm:flex-row items-center">
              <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full overflow-hidden border-4 border-white bg-white">
                <img 
                  src={seller.image} 
                  alt={seller.name} 
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
                <h1 className="text-3xl font-bold text-gray-900">{seller.name}</h1>
                <div className="flex items-center mt-2 justify-center sm:justify-start">
                  <div className="flex items-center">
                    {[0, 1, 2, 3, 4].map((rating) => (
                      <svg
                        key={rating}
                        className={`h-5 w-5 ${
                          seller.rating > rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="ml-2 text-sm text-gray-700">
                    {seller.rating} ({seller.reviews.length} reviews)
                  </p>
                </div>
                <p className="mt-2 text-gray-600">{seller.location} • Established {seller.establishedYear}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === 'products'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === 'reviews'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </button>
        </div>
        
        <div className="mt-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">About {seller.name}</h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <p className="text-base text-gray-700 whitespace-pre-line">{seller.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Services */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Services</h3>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    <ul className="divide-y divide-gray-200">
                      {seller.services.map((service, index) => (
                        <li key={index} className="py-3 flex items-center">
                          <svg className="h-5 w-5 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700">{service}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Contact Information */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Contact Information</h3>
                  </div>
                  <div className="border-t border-gray-200">
                    <dl>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Location</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{seller.location}</dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Phone</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{seller.phone}</dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Specialties</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <div className="flex flex-wrap gap-2">
                            {seller.specialties.map(specialty => (
                              <span
                                key={specialty}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
              
              {/* Team Members */}
              {seller.team && seller.team.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Our Team</h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {seller.team.map((member, index) => (
                      <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-16 w-16 rounded-full overflow-hidden">
                              <img
                                src={member.image}
                                alt={member.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="ml-4">
                              <h4 className="text-lg font-medium text-gray-900">{member.name}</h4>
                              <p className="text-sm text-gray-500">{member.role}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Featured Products Preview */}
              {sellerProducts.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Featured Products</h3>
                    <button 
                      onClick={() => setActiveTab('products')}
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      View All
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3">
                    {sellerProducts.slice(0, 3).map(product => (
                      <div key={product.id} className="group relative">
                        <div className="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-center object-cover"
                          />
                        </div>
                        <div className="mt-4 flex justify-between">
                          <div>
                            <h3 className="text-sm text-gray-700">
                              <Link href={`/seller/${seller.id}/product/${product.id}`} legacyBehavior>
                                <a className="absolute inset-0">{product.name}</a>
                              </Link>
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                          </div>
                          <p className="text-sm font-medium text-gray-900">${product.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-6">All Products by {seller.name}</h3>
              
              {sellerProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
                  {sellerProducts.map(product => (
                    <div key={product.id} className="group relative">
                      <div className="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-center object-cover"
                        />
                      </div>
                      <div className="mt-4 flex justify-between">
                        <div>
                          <h3 className="text-sm text-gray-700">
                            <Link href={`/seller/${seller.id}/product/${product.id}`} legacyBehavior>
                              <a className="absolute inset-0">{product.name}</a>
                            </Link>
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">${product.price}</p>
                      </div>
                      <div className="mt-2">
                        <Link href={`/seller/${seller.id}/product/${product.id}`} className="text-sm text-blue-600 hover:text-blue-800">
                          View details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No products available</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This seller doesn't have any products listed yet.
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-6">Customer Reviews</h3>
              
              {seller.reviews.length > 0 ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <ul className="divide-y divide-gray-200">
                    {seller.reviews.map(review => (
                      <li key={review.id} className="px-4 py-6">
                        <div className="flex items-center">
                          <div className="flex items-center">
                            {[0, 1, 2, 3, 4].map((rating) => (
                              <svg
                                key={rating}
                                className={`h-5 w-5 ${
                                  review.rating > rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <p className="ml-3 text-sm font-medium text-gray-900">{review.user}</p>
                          <span className="ml-3 text-sm text-gray-500">{review.date}</span>
                        </div>
                        <div className="mt-4 text-sm text-gray-600">
                          <p>{review.comment}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No reviews yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Be the first to leave a review for this seller.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 