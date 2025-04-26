import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Mock products data
  const productsData = [
    { 
      id: 1, 
      name: 'Tailored Suit', 
      price: 299.99, 
      description: 'Premium tailored suit made with high-quality wool blend fabric. Perfect for formal occasions and business meetings. Available in multiple colors and can be customized to your measurements.',
      image: 'https://via.placeholder.com/600x400', 
      images: [
        'https://via.placeholder.com/600x400',
        'https://via.placeholder.com/600x400',
        'https://via.placeholder.com/600x400'
      ],
      seller: 'Premium Tailors',
      sellerInfo: {
        id: 'premium-tailors',
        name: 'Premium Tailors',
        rating: 4.8,
        reviews: 124,
        location: 'New York, NY',
        phone: '+1 (555) 123-4567',
        bio: 'We specialize in high-quality tailored suits with over 20 years of experience in the industry.'
      },
      category: "Men's Suits",
      attributes: {
        material: 'Wool Blend',
        care: 'Dry Clean Only',
        style: 'Professional'
      },
      inStock: true,
      reviews: [
        { id: 1, user: 'John D.', rating: 5, comment: 'Excellent quality suit, perfect fit!', date: '2023-05-15' },
        { id: 2, user: 'Michael S.', rating: 4, comment: 'Good material and craftsmanship.', date: '2023-04-22' }
      ]
    },
    { 
      id: 2, 
      name: 'Evening Dress', 
      price: 189.99, 
      description: 'Elegant evening dress perfect for formal events and galas. Features delicate embroidery and a flattering silhouette. Can be customized to your measurements and preferences.',
      image: 'https://via.placeholder.com/600x400', 
      images: [
        'https://via.placeholder.com/600x400',
        'https://via.placeholder.com/600x400',
        'https://via.placeholder.com/600x400'
      ],
      seller: 'Fashion Studio',
      sellerInfo: {
        id: 'fashion-studio',
        name: 'Fashion Studio',
        rating: 4.6,
        reviews: 87,
        location: 'Los Angeles, CA',
        phone: '+1 (555) 987-6543',
        bio: 'We create unique, fashion-forward designs for all occasions.'
      },
      category: "Women's Dresses",
      attributes: {
        material: 'Satin, Lace',
        care: 'Dry Clean Only',
        style: 'Formal'
      },
      inStock: true,
      reviews: [
        { id: 1, user: 'Emma L.', rating: 5, comment: 'Beautiful dress, received many compliments!', date: '2023-06-10' },
        { id: 2, user: 'Sophia R.', rating: 4, comment: 'Gorgeous design and comfortable to wear.', date: '2023-05-28' }
      ]
    },
    // Remaining mock data for other products...
  ];
  
  useEffect(() => {
    if (id) {
      // In a real app, you would fetch product data from an API
      const foundProduct = productsData.find(p => p.id == id);
      if (foundProduct) {
        setProduct(foundProduct);
      } else {
        router.push('/products');
      }
    }
  }, [id, router]);
  
  // Check if user is logged in
  useEffect(() => {
    // In a real app, check if user is authenticated
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);
  
  const handleAddToCart = () => {
    if (!isLoggedIn) {
      // Redirect to login page with return URL
      router.push(`/login?redirect=/products/${id}`);
      return;
    }
    
    // Add to cart logic here
    alert(`Added ${quantity} of ${product.name} to cart!`);
  };
  
  const handleBuyNow = () => {
    if (!isLoggedIn) {
      // Redirect to login page with return URL
      router.push(`/login?redirect=/checkout?product=${id}&quantity=${quantity}`);
      return;
    }
    
    // Proceed to checkout
    router.push(`/checkout?product=${id}&quantity=${quantity}`);
  };
  
  if (!product) {
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
            {isLoggedIn ? (
              <Link href="/dashboard">
                <a className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700">Dashboard</a>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <a className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">Sign In</a>
                </Link>
                <Link href="/register">
                  <a className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700">Register</a>
                </Link>
              </>
            )}
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
              <Link href="/products">
                <a className="text-gray-500 hover:text-gray-700">Products</a>
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-900">{product.name}</span>
            </li>
          </ol>
        </nav>
        
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
          {/* Product images */}
          <div className="lg:max-w-lg lg:self-start">
            <div className="overflow-hidden rounded-lg">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-center object-cover"
              />
            </div>
            
            <div className="mt-4 grid grid-cols-3 gap-2">
              {product.images.map((img, index) => (
                <div key={index} className="overflow-hidden rounded-lg">
                  <img
                    src={img}
                    alt={`${product.name} - Image ${index + 1}`}
                    className="w-full h-full object-center object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Product details */}
          <div className="mt-10 lg:mt-0">
            <h1 className="text-3xl font-extrabold text-gray-900">{product.name}</h1>
            
            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl text-gray-900">${product.price}</p>
            </div>
            
            <div className="mt-6">
              <div className="flex items-center">
                <div className="flex items-center">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <svg
                      key={rating}
                      className={`h-5 w-5 ${
                        product.sellerInfo.rating > rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="ml-3 text-sm text-gray-700">
                  {product.sellerInfo.rating} ({product.sellerInfo.reviews} reviews)
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              <p className="text-base text-gray-700">{product.description}</p>
            </div>
            
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Seller Information</h3>
                <Link href={`/sellers/${product.sellerInfo.id}`}>
                  <a className="text-sm font-medium text-blue-600 hover:text-blue-500">View Profile</a>
                </Link>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                <p><strong>Seller:</strong> {product.sellerInfo.name}</p>
                <p><strong>Location:</strong> {product.sellerInfo.location}</p>
                <p className="mt-1"><strong>Bio:</strong> {product.sellerInfo.bio}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="mt-10 flex flex-col space-y-4">
                <div className="flex items-center">
                  <label htmlFor="quantity" className="mr-4 text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <select
                    id="quantity"
                    name="quantity"
                    className="rounded-md border border-gray-300 py-1.5 text-base text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  type="button"
                  className="bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </button>
                
                <button
                  type="button"
                  className="border border-gray-300 bg-white text-gray-700 py-3 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </button>
                
                {!isLoggedIn && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-100 rounded-md text-sm text-yellow-800">
                    <p>You must be logged in to place an order. Please <Link href={`/login?redirect=/products/${id}`}><a className="font-medium text-blue-600 hover:text-blue-500">sign in</a></Link> or <Link href="/register"><a className="font-medium text-blue-600 hover:text-blue-500">register</a></Link>.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16">
          <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
          <div className="mt-6 space-y-6">
            {product.reviews.map(review => (
              <div key={review.id} className="border-t border-gray-200 pt-6">
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
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-16">
          <h2 className="text-xl font-bold text-gray-900">You Might Also Like</h2>
          <div className="mt-6 grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-4">
            {productsData.filter(p => p.id !== product.id).slice(0, 4).map(p => (
              <div key={p.id} className="group relative">
                <div className="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-center object-cover"
                  />
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-sm text-gray-700">
                      <Link href={`/products/${p.id}`}>
                        <a>
                          <span aria-hidden="true" className="absolute inset-0" />
                          {p.name}
                        </a>
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">By {p.seller}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">${p.price}</p>
                </div>
              </div>
            ))}
          </div>
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