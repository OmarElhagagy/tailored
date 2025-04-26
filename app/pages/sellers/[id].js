import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function SellerProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [seller, setSeller] = useState(null);
  const [sellerProducts, setSellerProducts] = useState([]);
  
  // Mock sellers data
  const sellersData = [
    {
      id: 'premium-tailors',
      name: 'Premium Tailors',
      rating: 4.8,
      reviews: 124,
      location: 'New York, NY',
      phone: '+1 (555) 123-4567',
      email: 'contact@premiumtailors.com',
      bio: 'We specialize in high-quality tailored suits with over 20 years of experience in the industry. Our team of skilled tailors can create custom designs to match your style and preferences.',
      established: 2001,
      specialties: ['Business Suits', 'Wedding Attire', 'Formal Wear', 'Custom Designs'],
      businessHours: 'Mon-Fri: 9AM-6PM, Sat: 10AM-4PM',
      image: 'https://via.placeholder.com/400x300',
      gallery: [
        'https://via.placeholder.com/600x400',
        'https://via.placeholder.com/600x400',
        'https://via.placeholder.com/600x400'
      ]
    },
    {
      id: 'fashion-studio',
      name: 'Fashion Studio',
      rating: 4.6,
      reviews: 87,
      location: 'Los Angeles, CA',
      phone: '+1 (555) 987-6543',
      email: 'contact@fashionstudio.com',
      bio: 'We create unique, fashion-forward designs for all occasions. Our team specializes in women\'s clothing, including evening dresses, casual wear, and bridal collections.',
      established: 2010,
      specialties: ['Evening Dresses', 'Casual Wear', 'Bridal Collections', 'Custom Designs'],
      businessHours: 'Mon-Sat: 10AM-7PM',
      image: 'https://via.placeholder.com/400x300',
      gallery: [
        'https://via.placeholder.com/600x400',
        'https://via.placeholder.com/600x400',
        'https://via.placeholder.com/600x400'
      ]
    }
  ];
  
  // Mock products data
  const productsData = [
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
      id: 3, 
      name: 'Casual Shirt', 
      price: 59.99, 
      image: 'https://via.placeholder.com/300x400', 
      seller: 'Urban Threads',
      sellerId: 'urban-threads',
      category: "Men's Shirts" 
    },
    { 
      id: 4, 
      name: 'Designer Jacket', 
      price: 159.99, 
      image: 'https://via.placeholder.com/300x400', 
      seller: 'Premium Tailors',
      sellerId: 'premium-tailors',
      category: "Outerwear" 
    },
    { 
      id: 5, 
      name: 'Wedding Dress', 
      price: 599.99, 
      image: 'https://via.placeholder.com/300x400', 
      seller: 'Fashion Studio',
      sellerId: 'fashion-studio',
      category: "Wedding Attire" 
    },
    { 
      id: 6, 
      name: 'Business Shirt', 
      price: 79.99, 
      image: 'https://via.placeholder.com/300x400', 
      seller: 'Premium Tailors',
      sellerId: 'premium-tailors',
      category: "Men's Shirts" 
    }
  ];
  
  useEffect(() => {
    if (id) {
      // In a real app, you would fetch seller data from an API
      const foundSeller = sellersData.find(s => s.id === id);
      if (foundSeller) {
        setSeller(foundSeller);
        
        // Filter products by this seller
        const products = productsData.filter(p => p.sellerId === id);
        setSellerProducts(products);
      } else {
        router.push('/sellers');
      }
    }
  }, [id, router]);
  
  if (!seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/">
            <a className="text-2xl font-bold text-gray-900">Tailors Platform</a>
          </Link>
          <div className="flex space-x-4">
            <Link href="/products">
              <a className="px-4 py-2 text-gray-700 font-medium hover:underline">Products</a>
            </Link>
            <Link href="/sellers">
              <a className="px-4 py-2 text-gray-700 font-medium hover:underline">Find Tailors</a>
            </Link>
            <Link href="/login">
              <a className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">Sign In</a>
            </Link>
            <Link href="/register">
              <a className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700">Register</a>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/">
                <a className="text-gray-500 hover:text-gray-700">Home</a>
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link href="/sellers">
                <a className="text-gray-500 hover:text-gray-700">Sellers</a>
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-900">{seller.name}</span>
            </li>
          </ol>
        </nav>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{seller.name}</h1>
              <div className="flex items-center mt-1">
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
                  {seller.rating} ({seller.reviews} reviews)
                </p>
              </div>
            </div>
            <div>
              <Link href={`/message/${seller.id}`}>
                <a className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Contact Seller
                </a>
              </Link>
            </div>
          </div>
          
          <div className="border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
              <div className="col-span-1">
                <img src={seller.image} alt={seller.name} className="w-full h-auto rounded-lg shadow" />
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                  <dl className="mt-2 text-sm text-gray-600">
                    <div className="mt-3">
                      <dt className="font-medium text-gray-500">Location</dt>
                      <dd className="mt-1">{seller.location}</dd>
                    </div>
                    <div className="mt-3">
                      <dt className="font-medium text-gray-500">Phone</dt>
                      <dd className="mt-1">{seller.phone}</dd>
                    </div>
                    <div className="mt-3">
                      <dt className="font-medium text-gray-500">Email</dt>
                      <dd className="mt-1">
                        <a href={`mailto:${seller.email}`} className="text-blue-600 hover:text-blue-500">
                          {seller.email}
                        </a>
                      </dd>
                    </div>
                    <div className="mt-3">
                      <dt className="font-medium text-gray-500">Business Hours</dt>
                      <dd className="mt-1">{seller.businessHours}</dd>
                    </div>
                    <div className="mt-3">
                      <dt className="font-medium text-gray-500">Established</dt>
                      <dd className="mt-1">{seller.established}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              <div className="col-span-2">
                <h3 className="text-lg font-medium text-gray-900">About</h3>
                <p className="mt-2 text-gray-600">{seller.bio}</p>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900">Specialties</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {seller.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900">Gallery</h3>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {seller.gallery.map((image, index) => (
                      <div key={index} className="overflow-hidden rounded-lg">
                        <img
                          src={image}
                          alt={`${seller.name} - Gallery Image ${index + 1}`}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900">Products by {seller.name}</h2>
          
          <div className="mt-6 grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-4">
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
                      <Link href={`/products/${product.id}`}>
                        <a>
                          <span aria-hidden="true" className="absolute inset-0" />
                          {product.name}
                        </a>
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">${product.price}</p>
                </div>
              </div>
            ))}
          </div>
          
          {sellerProducts.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
              <p className="text-gray-500">This seller doesn't have any products listed at the moment.</p>
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="md:flex md:justify-between">
            <div className="mb-8 md:mb-0">
              <h3 className="text-xl font-bold">Tailors Platform</h3>
              <p className="mt-2 text-gray-400">Connecting tailors and clients seamlessly.</p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Support</h3>
                <ul className="mt-4 space-y-2">
                  <li><a href="#" className="text-gray-300 hover:text-white">Help Center</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white">Contact Us</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Legal</h3>
                <ul className="mt-4 space-y-2">
                  <li><a href="#" className="text-gray-300 hover:text-white">Privacy Policy</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white">Terms of Service</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Tailors Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 