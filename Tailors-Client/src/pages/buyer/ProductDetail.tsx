import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';

// Types
interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  photos: string[];
  mainPhoto: string;
  availableMaterials: {
    name: string;
    color: string;
    price: number;
    inStock: boolean;
  }[];
  colors: string[];
  customizationOptions: {
    name: string;
    options: string[];
    required: boolean;
    affects_price: boolean;
    price_modifier: number;
  }[];
  deliveryOptions: {
    method: string;
    estimatedDays: {
      min: number;
      max: number;
    };
    price: number;
  }[];
  rating: {
    average: number;
    count: number;
  };
  seller: {
    _id: string;
    businessName: string;
    businessDescription: string;
    rating: {
      average: number;
    };
  };
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  createdAt: string;
}

interface Measurements {
  _id: string;
  name: string;
  values: {
    [key: string]: number;
  };
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  buyerName: string;
  createdAt: string;
}

// Define the interface for customization options
interface CustomizationOption {
  name: string;
  options: string[];
  required: boolean;
  affects_price: boolean;
  price_modifier: number;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedDelivery, setSelectedDelivery] = useState<string>('');
  const [customizations, setCustomizations] = useState<{ [key: string]: string }>({});
  const [measurements, setMeasurements] = useState<Measurements[]>([]);
  const [selectedMeasurement, setSelectedMeasurement] = useState<string>('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState('description');

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${API_URL}/api/listings/${id}`);
        
        if (response.data.success) {
          setProduct(response.data.data);
          if (response.data.data.photos && response.data.data.photos.length > 0) {
            setSelectedPhoto(response.data.data.mainPhoto || response.data.data.photos[0]);
          }
          
          // Initialize default selections
          if (response.data.data.availableMaterials && response.data.data.availableMaterials.length > 0) {
            setSelectedMaterial(response.data.data.availableMaterials[0].name);
          }
          
          if (response.data.data.colors && response.data.data.colors.length > 0) {
            setSelectedColor(response.data.data.colors[0]);
          }
          
          if (response.data.data.deliveryOptions && response.data.data.deliveryOptions.length > 0) {
            setSelectedDelivery(response.data.data.deliveryOptions[0].method);
          }
          
          // Initialize customizations with default values
          const initialCustomizations: { [key: string]: string } = {};
          if (response.data.data.customizationOptions) {
            response.data.data.customizationOptions.forEach((option: CustomizationOption) => {
              if (option.options && option.options.length > 0) {
                initialCustomizations[option.name] = option.options[0];
              }
            });
          }
          setCustomizations(initialCustomizations);
        } else {
          setError('Failed to fetch product details');
        }
      } catch (err) {
        setError('An error occurred while fetching product details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Fetch user's saved measurements if authenticated
  useEffect(() => {
    const fetchMeasurements = async () => {
      if (!isAuthenticated) return;
      
      try {
        const response = await axios.get(`${API_URL}/api/measurements`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data.success) {
          setMeasurements(response.data.data);
          if (response.data.data.length > 0) {
            setSelectedMeasurement(response.data.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Error fetching measurements:', err);
      }
    };

    fetchMeasurements();
  }, [isAuthenticated]);

  // Fetch product reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      
      try {
        const response = await axios.get(`${API_URL}/api/listings/${id}/reviews`);
        
        if (response.data.success) {
          setReviews(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };

    fetchReviews();
  }, [id]);

  // Calculate total price based on selections
  const calculateTotalPrice = () => {
    if (!product) return 0;
    
    let totalPrice = product.price;
    
    // Add material price if applicable
    if (selectedMaterial && product.availableMaterials) {
      const material = product.availableMaterials.find(m => m.name === selectedMaterial);
      if (material && material.price) {
        totalPrice += material.price;
      }
    }
    
    // Add customization price modifiers
    if (product.customizationOptions) {
      product.customizationOptions.forEach(option => {
        if (option.affects_price && customizations[option.name]) {
          totalPrice += option.price_modifier;
        }
      });
    }
    
    // Add delivery cost
    if (selectedDelivery && product.deliveryOptions) {
      const deliveryOption = product.deliveryOptions.find(d => d.method === selectedDelivery);
      if (deliveryOption && deliveryOption.price) {
        totalPrice += deliveryOption.price;
      }
    }
    
    // Multiply by quantity
    return totalPrice * quantity;
  };

  // Add to cart handler
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate('/login?redirect=' + encodeURIComponent(`/product/${id}`));
      return;
    }

    // Validate required customizations
    const missingRequired = product?.customizationOptions
      .filter(option => option.required && !customizations[option.name])
      .map(option => option.name);

    if (missingRequired && missingRequired.length > 0) {
      alert(`Please select options for: ${missingRequired.join(', ')}`);
      return;
    }

    // Add to cart logic
    // In a real application, this would call the cart service/API
    alert('Added to cart! This is a placeholder - implement cart functionality');
    
    // Navigate to checkout
    // navigate('/buyer/checkout');
  };

  // Proceed to checkout handler
  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate('/login?redirect=' + encodeURIComponent(`/product/${id}`));
      return;
    }

    // Required fields validation similar to addToCart
    const missingRequired = product?.customizationOptions
      .filter(option => option.required && !customizations[option.name])
      .map(option => option.name);

    if (missingRequired && missingRequired.length > 0) {
      alert(`Please select options for: ${missingRequired.join(', ')}`);
      return;
    }

    // Navigate to checkout with product data
    navigate('/buyer/checkout', { 
      state: { 
        product: product,
        quantity,
        selectedMaterial,
        selectedColor,
        selectedDelivery,
        customizations,
        selectedMeasurement,
        totalPrice: calculateTotalPrice()
      } 
    });
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error || 'Product not found'}</p>
          <button
            onClick={() => navigate('/buyer/products')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Product Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Product Images */}
            <div>
              <div className="aspect-w-1 aspect-h-1 mb-4 overflow-hidden rounded-lg">
                <img
                  src={selectedPhoto || product.mainPhoto}
                  alt={product.title}
                  className="object-cover object-center w-full h-96"
                />
              </div>
              <div className="grid grid-cols-5 gap-2">
                {product.photos.map((photo, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer border-2 rounded-md overflow-hidden ${
                      selectedPhoto === photo ? 'border-blue-500' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img
                      src={photo}
                      alt={`${product.title} - thumbnail ${index + 1}`}
                      className="object-cover object-center w-full h-16"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-2 text-sm text-gray-500">{product.category}</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>
              
              <div className="flex items-center mb-4">
                {product.rating && product.rating.average > 0 ? (
                  <div className="flex items-center">
                    {renderStars(product.rating.average)}
                    <span className="ml-2 text-blue-600 cursor-pointer" onClick={() => setActiveTab('reviews')}>
                      ({product.rating.count} reviews)
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">No reviews yet</span>
                )}
              </div>
              
              <div className="text-2xl font-bold text-gray-900 mb-4">
                ${calculateTotalPrice().toFixed(2)}
              </div>
              
              <div className="mb-4">
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    product.stockStatus === 'in_stock'
                      ? 'bg-green-100 text-green-800'
                      : product.stockStatus === 'low_stock'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {product.stockStatus === 'in_stock'
                    ? 'In Stock'
                    : product.stockStatus === 'low_stock'
                    ? 'Low Stock'
                    : 'Out of Stock'}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  Sold by <span className="font-medium">{product.seller.businessName}</span>
                </span>
              </div>
              
              {/* Quantity Selector */}
              <div className="mb-4">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <div className="flex items-center">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 border border-gray-300 rounded-l-md bg-gray-50 text-gray-500 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center border-t border-b border-gray-300 py-1"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 border border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Material Selector */}
              {product.availableMaterials && product.availableMaterials.length > 0 && (
                <div className="mb-4">
                  <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-1">
                    Material
                  </label>
                  <select
                    id="material"
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {product.availableMaterials.map((material, index) => (
                      <option key={index} value={material.name}>
                        {material.name} {material.price > 0 ? `(+$${material.price.toFixed(2)})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color, index) => (
                      <div
                        key={index}
                        className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                          selectedColor === color ? 'border-blue-500' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Customization Options */}
              {product.customizationOptions && product.customizationOptions.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Customization Options</h3>
                  {product.customizationOptions.map((option, index) => (
                    <div key={index} className="mb-3">
                      <label htmlFor={`option-${index}`} className="block text-sm text-gray-600 mb-1">
                        {option.name} {option.required && <span className="text-red-500">*</span>}
                        {option.affects_price && option.price_modifier > 0 && (
                          <span className="text-gray-500 ml-1">
                            (+${option.price_modifier.toFixed(2)})
                          </span>
                        )}
                      </label>
                      <select
                        id={`option-${index}`}
                        value={customizations[option.name] || ''}
                        onChange={(e) => setCustomizations({
                          ...customizations,
                          [option.name]: e.target.value
                        })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select {option.name}</option>
                        {option.options.map((opt, i) => (
                          <option key={i} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Delivery Options */}
              {product.deliveryOptions && product.deliveryOptions.length > 0 && (
                <div className="mb-4">
                  <label htmlFor="delivery" className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Method
                  </label>
                  <select
                    id="delivery"
                    value={selectedDelivery}
                    onChange={(e) => setSelectedDelivery(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {product.deliveryOptions.map((delivery, index) => (
                      <option key={index} value={delivery.method}>
                        {delivery.method} (${delivery.price.toFixed(2)}) - 
                        {delivery.estimatedDays.min === delivery.estimatedDays.max
                          ? `${delivery.estimatedDays.min} days`
                          : `${delivery.estimatedDays.min}-${delivery.estimatedDays.max} days`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Measurements Selection */}
              {isAuthenticated && measurements.length > 0 && (
                <div className="mb-6">
                  <label htmlFor="measurements" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Measurements
                  </label>
                  <select
                    id="measurements"
                    value={selectedMeasurement}
                    onChange={(e) => setSelectedMeasurement(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {measurements.map((measurement) => (
                      <option key={measurement._id} value={measurement._id}>
                        {measurement.name}
                      </option>
                    ))}
                  </select>
                  <div className="mt-1">
                    <button
                      onClick={() => navigate('/buyer/measurements')}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Manage measurements
                    </button>
                  </div>
                </div>
              )}
              
              {/* Add to Cart / Buy Now Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stockStatus === 'out_of_stock'}
                  className={`px-6 py-3 text-sm font-medium rounded-md ${
                    product.stockStatus === 'out_of_stock'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-white border border-blue-600 text-blue-600 hover:bg-blue-50'
                  } flex-1`}
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleProceedToCheckout}
                  disabled={product.stockStatus === 'out_of_stock'}
                  className={`px-6 py-3 text-sm font-medium rounded-md ${
                    product.stockStatus === 'out_of_stock'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } flex-1`}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-gray-200">
            <div className="flex">
              <button
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === 'description'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === 'seller'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('seller')}
              >
                Seller Information
              </button>
              <button
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === 'reviews'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews {reviews.length > 0 && `(${reviews.length})`}
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'description' && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Product Description</h2>
                  <div className="prose prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
                </div>
              )}

              {activeTab === 'seller' && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">About the Seller</h2>
                  <div className="flex items-center mb-4">
                    <h3 className="text-xl font-medium text-gray-900">{product.seller.businessName}</h3>
                    {product.seller.rating && (
                      <div className="ml-4">
                        {renderStars(product.seller.rating.average)}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 mb-4">{product.seller.businessDescription || 'No description provided.'}</p>
                  <button
                    onClick={() => navigate(`/seller/${product.seller._id}`)}
                    className="px-4 py-2 text-sm font-medium rounded-md bg-white border border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    View Seller Profile
                  </button>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Customer Reviews {product.rating && product.rating.average > 0 && (
                      <span className="text-gray-600">{renderStars(product.rating.average)}</span>
                    )}
                  </h2>
                  
                  {reviews.length === 0 ? (
                    <p className="text-gray-600">No reviews yet.</p>
                  ) : (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review._id} className="border-b border-gray-200 pb-6">
                          <div className="flex items-center mb-2">
                            {renderStars(review.rating)}
                            <span className="ml-2 font-medium">{review.buyerName}</span>
                          </div>
                          <p className="text-gray-700 mb-2">{review.comment}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 