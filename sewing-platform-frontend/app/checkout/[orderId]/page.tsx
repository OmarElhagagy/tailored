'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import PaymentMethodSelector from '../../../components/PaymentMethodSelector';
import useResponsive from '../../../src/hooks/useResponsive';

export default function CheckoutPage({ params }: { params: { orderId: string } }) {
  const router = useRouter();
  const { isMobile } = useResponsive();
  const { orderId } = params;
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [customerMobile, setCustomerMobile] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  
  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          router.push('/login?redirect=' + encodeURIComponent(`/checkout/${orderId}`));
          return;
        }
        
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          setOrder(response.data.data);
          
          // If order is already paid, redirect to order details
          if (response.data.data.paymentStatus === 'paid') {
            router.push(`/order/${orderId}?message=Order already paid`);
          }
        } else {
          setError('Failed to load order details');
        }
      } catch (err: any) {
        console.error('Error fetching order:', err);
        setError(err.response?.data?.message || 'Failed to load order details');
        
        if (err.response?.status === 404) {
          router.push('/orders?error=Order not found');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId, router]);
  
  // Handle payment method selection
  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
  };
  
  // Process payment
  const handleProcessPayment = async () => {
    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      return;
    }
    
    // Validate mobile for all payment methods
    if (!customerMobile) {
      setError('Please enter your mobile number');
      return;
    }
    
    // Validate mobile format (simple check)
    const mobileRegex = /^\+?[0-9]{10,15}$/;
    if (!mobileRegex.test(customerMobile)) {
      setError('Please enter a valid mobile number');
      return;
    }
    
    try {
      setProcessing(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      
      // Prepare request data
      const requestData: any = {
        orderId,
        paymentMethod: selectedPaymentMethod,
        customerMobile
      };
      
      // For cash on delivery, need delivery address
      if (selectedPaymentMethod === 'cash_on_delivery') {
        requestData.deliveryAddress = order.deliveryAddress;
      }
      
      // Initialize payment
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/initialize`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setPaymentResult(response.data.data);
      } else {
        setError('Payment initialization failed');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.response?.data?.errors?.[0]?.message || 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Render error state
  if (error && !order) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <h2 className="text-lg font-medium mb-2">Error</h2>
          <p>{error}</p>
          <button
            onClick={() => router.push('/orders')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Go to My Orders
          </button>
        </div>
      </div>
    );
  }
  
  // Render payment success state
  if (paymentResult) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-center text-green-800 mb-4">
            Payment Initialized Successfully
          </h2>
          
          <div className="bg-white rounded-lg p-4 mb-4 border border-green-100">
            <h3 className="font-medium text-gray-800 mb-2">Payment Details:</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Reference Number:</span>
                <span className="font-medium">{paymentResult.referenceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium capitalize">{paymentResult.paymentMethod.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">{paymentResult.amount.toFixed(2)} EGP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-yellow-600">Pending</span>
              </div>
            </div>
          </div>
          
          {/* Method-specific instructions */}
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100 mb-4">
            <h3 className="font-medium text-gray-800 mb-2">What's Next?</h3>
            
            {paymentResult.paymentMethod === 'fawry' && (
              <div>
                <p className="text-sm mb-2">Please use the reference number provided to complete your payment:</p>
                <div className="bg-white p-3 rounded border border-yellow-200 text-center font-mono text-lg mb-3">
                  {paymentResult.referenceNumber}
                </div>
                <p className="text-sm">You can pay at any Fawry outlet or through the myFawry app.</p>
              </div>
            )}
            
            {paymentResult.paymentMethod === 'vodafone_cash' && (
              <div>
                <p className="text-sm mb-2">Please follow these instructions to complete your payment:</p>
                <div className="bg-white p-3 rounded border border-yellow-200 text-sm mb-3">
                  {paymentResult.instructions}
                </div>
              </div>
            )}
            
            {paymentResult.paymentMethod === 'instapay' && (
              <div>
                <p className="text-sm mb-2">Scan this QR code with your banking app or follow the payment link:</p>
                <div className="flex flex-col items-center justify-center my-3">
                  <div className="bg-white p-3 rounded border border-yellow-200 w-48 h-48 flex items-center justify-center mb-3">
                    QR Code Placeholder
                  </div>
                  <a 
                    href={paymentResult.paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm"
                  >
                    Or click here to pay online
                  </a>
                </div>
              </div>
            )}
            
            {paymentResult.paymentMethod === 'cash_on_delivery' && (
              <div className="text-sm">
                <p>Your order has been confirmed and will be prepared for delivery.</p>
                <p>You'll pay the full amount of {paymentResult.amount.toFixed(2)} EGP when you receive your order.</p>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push(`/order/${orderId}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              View Order Details
            </button>
            <button
              onClick={() => router.push('/orders')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Go to My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Main checkout page
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}
      
      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row space-x-6'}`}>
        {/* Order Summary */}
        <div className={`${isMobile ? 'w-full mb-6' : 'w-1/3'}`}>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            {order && (
              <>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium">#{order._id.slice(-6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium">{order.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{order.price.subtotal.toFixed(2)} EGP</span>
                  </div>
                  {order.price.deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery:</span>
                      <span className="font-medium">{order.price.deliveryFee.toFixed(2)} EGP</span>
                    </div>
                  )}
                  {order.price.taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-medium">{order.price.taxAmount.toFixed(2)} EGP</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>{order.price.total.toFixed(2)} EGP</span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p className="mb-1">Delivery Method: {order.deliveryMethod}</p>
                  {order.scheduledDay && (
                    <p className="mb-1">Scheduled for: {new Date(order.scheduledDay).toLocaleDateString()}</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Payment Section */}
        <div className={`${isMobile ? 'w-full' : 'w-2/3'}`}>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-6">Payment Information</h2>
            
            {/* Mobile Number */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="mobile">
                Mobile Number*
              </label>
              <input
                type="tel"
                id="mobile"
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
                placeholder="e.g. +201xxxxxxxxx"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                We'll use this to confirm your payment
              </p>
            </div>
            
            {/* Payment Methods */}
            {order && (
              <PaymentMethodSelector
                onSelect={handlePaymentMethodSelect}
                selectedMethod={selectedPaymentMethod}
                orderId={order._id}
                orderTotal={order.price.total}
              />
            )}
            
            {/* Pay Button */}
            <div className="mt-8">
              <button
                onClick={handleProcessPayment}
                disabled={processing || !selectedPaymentMethod}
                className={`
                  w-full py-3 rounded-md text-center font-medium
                  ${processing || !selectedPaymentMethod 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }
                `}
              >
                {processing 
                  ? 'Processing...' 
                  : `Pay ${order?.price.total.toFixed(2) || '0.00'} EGP`
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 