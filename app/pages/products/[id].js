import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('');
  const [customization, setCustomization] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
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
    // Check if user is logged in
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Error parsing user data:', err);
    }
    
    // In a real app, fetch product data from an API
    if (id) {
      // Compare as strings or try both string and number comparison
      const foundProduct = productsData.find(p => 
        p.id.toString() === id.toString() || 
        p.id === parseInt(id)
      );
      if (foundProduct) {
        setProduct(foundProduct);
        setLoading(false);
        
        // Optional: Redirect to the new seller-based product route if seller info is available
        if (foundProduct.sellerInfo && foundProduct.sellerInfo.id) {
          router.replace(`/seller/${foundProduct.sellerInfo.id}/product/${foundProduct.id}`);
        }
      } else {
        // Instead of redirecting, set loading to false to show 404 error
        setLoading(false);
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
    if (!user) {
      // Redirect to login if user is not authenticated
      router.push(`/login?redirect=/products/${id}`);
      return;
    }
    
    // Add to cart logic (in a real app, this would call an API)
    console.log('Adding to cart:', {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      size,
      customization
    });
    
    // Show success message and redirect to cart
    toast.success('Product added to cart!');
    setTimeout(() => {
      router.push('/cart');
    }, 1500);
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
  
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Only render the breadcrumb when product is available */}
        {product && (
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link href="/" legacyBehavior>
                  <a className="text-gray-500 hover:text-gray-700">Home</a>
                </Link>
              </li>
              <li className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link href="/products" legacyBehavior>
                  <a className="text-gray-500 hover:text-gray-700">Products</a>
                </Link>
              </li>
              <li className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-900">{product.name}</span>
              </li>
            </ol>
          </nav>
        )}
        
        {/* Show loading state while product is being fetched */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : product ? (
          <>
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
                  <div className="mt-10">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">Size</h3>
                    </div>
                    
                    <div className="mt-4">
                      <div className="grid grid-cols-4 gap-4">
                        {['S', 'M', 'L', 'XL'].map((sizeOption) => (
                          <button
                            key={sizeOption}
                            type="button"
                            onClick={() => setSize(sizeOption)}
                            className={`${
                              size === sizeOption
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-900 border border-gray-200'
                            } py-2 px-4 rounded-md text-sm font-medium uppercase focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                          >
                            {sizeOption}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-10">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">Customization</h3>
                    </div>
                    
                    <div className="mt-4">
                      <textarea
                        rows={3}
                        className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md"
                        placeholder="Add your customization notes here..."
                        value={customization}
                        onChange={(e) => setCustomization(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-10">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">Quantity</h3>
                    </div>
                    
                    <div className="mt-4 flex items-center">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="mx-4 text-gray-900">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-10 flex sm:flex-col1 space-x-4">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="flex-1 bg-blue-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Add to Cart
                    </button>
                    <button
                      type="button"
                      onClick={handleBuyNow}
                      className="flex-1 bg-gray-100 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900">Seller Information</h2>
              
              <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {product.sellerInfo.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{product.sellerInfo.name}</h3>
                    <p className="text-sm text-gray-500">{product.sellerInfo.location}</p>
                  </div>
                  <div className="ml-auto">
                    <Link
                      href={`/sellers/${product.sellerInfo.id}`}
                      legacyBehavior
                    >
                      <a className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        View Profile
                      </a>
                    </Link>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-gray-700">{product.sellerInfo.bio}</p>
                </div>
                
                <div className="mt-6 border-t border-gray-200 pt-4">
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
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium text-gray-900">Phone:</span> {product.sellerInfo.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
              
              <div className="mt-6 space-y-6">
                {product.reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
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
                      <p className="ml-3 text-sm text-gray-700">
                        {review.rating} | {review.user}
                      </p>
                      <p className="ml-auto text-sm text-gray-500">{review.date}</p>
                    </div>
                    <div className="mt-4">
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold text-red-600 mb-2">Product Not Found</h1>
            <p className="text-gray-600 mb-6">The product you are looking for does not exist or has been removed.</p>
            <Link href="/products" className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
              Browse All Products
            </Link>
          </div>
        )}
      </main>
    </div>
  );
} 