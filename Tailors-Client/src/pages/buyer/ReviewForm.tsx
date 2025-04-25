import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';

interface Order {
  _id: string;
  status: string;
  listing: {
    _id: string;
    title: string;
    mainPhoto: string;
  };
  seller: {
    _id: string;
    businessName: string;
  };
  deliveredAt?: string;
  rating?: {
    value: number;
    comment: string;
    timestamp: string;
  };
}

const ReviewForm: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  
  // Fetch order data on component mount
  useEffect(() => {
    const fetchOrder = async () => {
      if (!isAuthenticated) {
        navigate('/login?redirect=' + encodeURIComponent(`/buyer/review/${orderId}`));
        return;
      }
      
      if (!orderId) {
        setError('Invalid order ID');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(
          `${API_URL}/api/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        if (response.data.success) {
          const orderData = response.data.data;
          
          // Check if order is eligible for review
          if (orderData.status !== 'delivered' && orderData.status !== 'completed') {
            setError('This order is not eligible for review yet. Orders must be delivered before they can be reviewed.');
            setLoading(false);
            return;
          }
          
          // Check if order has already been reviewed
          if (orderData.rating && orderData.rating.value) {
            setError('You have already reviewed this order.');
            setRating(orderData.rating.value);
            setComment(orderData.rating.comment || '');
            setLoading(false);
            return;
          }
          
          setOrder(orderData);
        } else {
          setError('Failed to fetch order details');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('An error occurred while fetching the order details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [isAuthenticated, navigate, orderId]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!order) return;
    
    if (rating < 1) {
      setError('Please select a rating');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      const reviewData = {
        orderId: order._id,
        rating,
        comment
      };
      
      const response = await axios.post(
        `${API_URL}/api/reviews`,
        reviewData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        // Redirect to order history with success message
        navigate('/buyer/orders?review=success');
      } else {
        setError('Failed to submit review');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('An error occurred while submitting your review');
    } finally {
      setSubmitting(false);
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Leave a Review</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : !order ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-700 mb-4">Order not found or you do not have permission to review this order.</p>
            <button
              onClick={() => navigate('/buyer/orders')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Orders
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              {/* Order Summary */}
              <div className="mb-6 border-b border-gray-200 pb-4">
                <h2 className="text-xl font-medium text-gray-900 mb-4">Order Details</h2>
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 flex-shrink-0">
                    <img
                      src={order.listing.mainPhoto || 'https://via.placeholder.com/64'}
                      alt={order.listing.title}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{order.listing.title}</div>
                    <div className="text-sm text-gray-500">Order #{order._id.substring(order._id.length - 8)}</div>
                    <div className="text-sm text-gray-500">Seller: {order.seller.businessName}</div>
                    <div className="text-sm text-gray-500">Delivered: {formatDate(order.deliveredAt)}</div>
                  </div>
                </div>
              </div>
              
              {/* Review Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your Rating</h3>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="text-3xl text-gray-300 focus:outline-none"
                      >
                        <span className={`${
                          (hoverRating !== null ? star <= hoverRating : star <= rating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}>
                          ★
                        </span>
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {rating === 1 && 'Poor'}
                      {rating === 2 && 'Fair'}
                      {rating === 3 && 'Good'}
                      {rating === 4 && 'Very Good'}
                      {rating === 5 && 'Excellent'}
                    </span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="comment" className="block text-lg font-medium text-gray-900 mb-2">
                    Your Review
                  </label>
                  <textarea
                    id="comment"
                    rows={5}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Share your experience with this product and seller..."
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Your honest feedback helps other buyers make informed decisions and helps sellers improve their services.
                  </p>
                </div>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => navigate('/buyer/orders')}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewForm; 