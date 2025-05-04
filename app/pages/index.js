import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [featuredSellers, setFeaturedSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
      featured: true,
      products: [
        { id: 1, name: 'Tailored Suit', price: 299.99, image: 'https://via.placeholder.com/200x250' },
        { id: 9, name: 'Business Suit', price: 349.99, image: 'https://via.placeholder.com/200x250' }
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
      specialties: ['Women\'s Dresses', 'Evening Wear', 'Custom Design'],
      featured: true,
      products: [
        { id: 2, name: 'Evening Dress', price: 189.99, image: 'https://via.placeholder.com/200x250' },
        { id: 11, name: 'Cocktail Dress', price: 159.99, image: 'https://via.placeholder.com/200x250' }
      ]
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
      featured: false,
      products: [
        { id: 3, name: 'Casual Shirt', price: 59.99, image: 'https://via.placeholder.com/200x250' }
      ]
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
      featured: true,
      products: [
        { id: 4, name: 'Designer Jacket', price: 159.99, image: 'https://via.placeholder.com/200x250' }
      ]
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
      featured: true,
      products: [
        { id: 7, name: 'Wedding Dress', price: 599.99, image: 'https://via.placeholder.com/200x250' }
      ]
    }
  ];
  
  useEffect(() => {
    // In a real app, fetch sellers from an API
    // Get all sellers and prioritize featured ones
    const allSellers = mockSellers;
    setFeaturedSellers(allSellers);
    setLoading(false);
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
              <span className="block">Premium Tailoring Services</span>
              <span className="block text-blue-200">Exceptional Quality</span>
            </h1>
            <p className="mt-6 max-w-lg mx-auto text-xl md:text-2xl md:max-w-3xl">
              Connect with skilled tailors and get custom-made clothing that fits your style perfectly.
            </p>
            <div className="mt-10 flex justify-center">
              <Link href="/sellers" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 md:text-lg">
                Browse All Tailors
              </Link>
              <Link href="/products" className="ml-4 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-800 bg-opacity-60 hover:bg-opacity-70 md:text-lg">
                View Products
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Our Featured Tailors
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Discover our highly-rated tailors and their unique specialties
            </p>
          </div>
          
          <div className="space-y-16">
            {featuredSellers.filter(seller => seller.featured).map(seller => (
              <div key={seller.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="md:flex">
                  <div className="md:flex-shrink-0 p-6 flex items-center justify-center bg-gray-50">
                    <img className="h-32 w-32 rounded-full object-cover" src={seller.image} alt={seller.name} />
                  </div>
                  <div className="p-8">
                    <div className="flex items-center">
                      <h3 className="text-2xl font-bold text-gray-900">{seller.name}</h3>
                      <div className="ml-4 flex items-center">
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
                        <span className="ml-2 text-sm text-gray-500">
                          {seller.rating} ({seller.reviews} reviews)
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      <span className="font-medium">Location:</span> {seller.location}
                    </p>
                    <p className="mt-4 text-base text-gray-600">{seller.bio}</p>
                    <div className="mt-4">
                      <span className="text-sm font-medium text-gray-500">Specialties:</span>
                      <div className="mt-2 flex flex-wrap gap-2">
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
                    
                    <div className="mt-6">
                      <h4 className="text-lg font-medium text-gray-900">Featured Products</h4>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {seller.products.slice(0, 2).map(product => (
                          <div key={product.id} className="group relative">
                            <div className="w-full h-48 bg-gray-200 rounded-md overflow-hidden">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-center object-cover group-hover:opacity-75"
                              />
                            </div>
                            <div className="mt-2 flex justify-between">
                              <div>
                                <h3 className="text-sm text-gray-700 font-medium">
                                  {product.name}
                                </h3>
                              </div>
                              <p className="text-sm font-medium text-gray-900">${product.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <Link
                        href={`/sellers/${seller.id}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        View Profile & Services
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link
              href="/sellers"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View All Tailors
            </Link>
          </div>
        </section>
        
        <section className="bg-gray-100 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                How It Works
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                Get custom-tailored clothing in just a few simple steps
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 text-xl font-bold">
                  1
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Browse Tailors</h3>
                <p className="mt-2 text-base text-gray-500">
                  Explore our network of professional tailors and their services
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 text-xl font-bold">
                  2
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Choose Products</h3>
                <p className="mt-2 text-base text-gray-500">
                  Select from their catalog or request custom-made items
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 text-xl font-bold">
                  3
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Place Your Order</h3>
                <p className="mt-2 text-base text-gray-500">
                  Complete your purchase and get tailored clothing delivered to you
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
} 