import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';

interface CheckoutState {
  product: any;
  quantity: number;
  selectedMaterial: string;
  selectedColor: string;
  selectedDelivery: string;
  customizations: { [key: string]: string };
  selectedMeasurement: string;
  totalPrice: number;
}

interface Address {
  _id?: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [checkoutData, setCheckoutData] = useState<CheckoutState | null>(null);
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Address form state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<Address>({
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
    isDefault: false
  });
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });
  
  // Fetch user's saved addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!isAuthenticated) return;
      
      try {
        const response = await axios.get(`${API_URL}/api/addresses`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data.success && response.data.data.length > 0) {
          setAddresses(response.data.data);
          
          // Set default address if available
          const defaultAddress = response.data.data.find((addr: Address) => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress._id || '');
          } else {
            setSelectedAddressId(response.data.data[0]._id || '');
          }
        } else {
          // If no saved addresses, show the new address form
          setShowNewAddressForm(true);
        }
      } catch (err) {
        console.error('Error fetching addresses:', err);
        setShowNewAddressForm(true);
      }
    };

    fetchAddresses();
  }, [isAuthenticated]);
  
  // Get checkout data from location state
  useEffect(() => {
    if (location.state) {
      setCheckoutData(location.state as CheckoutState);
    } else {
      // If no checkout data, redirect to products
      navigate('/buyer/products');
    }
  }, [location, navigate]);
  
  // Handle address selection
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAddressId(e.target.value);
    setShowNewAddressForm(e.target.value === 'new');
  };
  
  // Handle new address form changes
  const handleNewAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setNewAddress({
      ...newAddress,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };
  
  // Handle adding new address
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/api/addresses`,
        newAddress,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        const newAddressList = [...addresses, response.data.data];
        setAddresses(newAddressList);
        setSelectedAddressId(response.data.data._id);
        setShowNewAddressForm(false);
      } else {
        setError('Failed to add address');
      }
    } catch (err) {
      console.error('Error adding address:', err);
      setError('An error occurred while adding the address');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle card details change
  const handleCardDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails({
      ...cardDetails,
      [name]: value
    });
  };
  
  // Proceed to payment step
  const proceedToPayment = () => {
    if (!selectedAddressId && !showNewAddressForm) {
      setError('Please select a delivery address');
      return;
    }
    
    if (showNewAddressForm) {
      // Validate new address form
      const requiredFields = ['name', 'addressLine1', 'city', 'state', 'postalCode', 'country', 'phone'];
      const missingFields = requiredFields.filter(field => !newAddress[field as keyof Address]);
      
      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }
    }
    
    setStep('payment');
    setError(null);
  };
  
  // Place order
  const placeOrder = async () => {
    if (!checkoutData) return;
    
    // Validate payment details
    if (paymentMethod === 'card') {
      const requiredFields = ['cardNumber', 'cardHolder', 'expiryDate', 'cvv'];
      const missingFields = requiredFields.filter(field => !cardDetails[field as keyof typeof cardDetails]);
      
      if (missingFields.length > 0) {
        setError(`Please fill in all card details: ${missingFields.join(', ')}`);
        return;
      }
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Prepare order data
      const orderData = {
        listingId: checkoutData.product._id,
        quantity: checkoutData.quantity,
        customizations: checkoutData.customizations,
        deliveryMethod: checkoutData.selectedDelivery,
        addressId: showNewAddressForm ? null : selectedAddressId,
        newAddress: showNewAddressForm ? newAddress : null,
        measurementId: checkoutData.selectedMeasurement,
        paymentMethod,
        // Include material and color selections if applicable
        materialSelection: checkoutData.selectedMaterial,
        colorSelection: checkoutData.selectedColor
      };
      
      // Create order
      const response = await axios.post(
        `${API_URL}/api/orders`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        // Redirect to order confirmation
        navigate(`/buyer/order-confirmation/${response.data.data._id}`);
      } else {
        setError('Failed to place order');
      }
    } catch (err) {
      console.error('Error placing order:', err);
      setError('An error occurred while placing the order');
    } finally {
      setLoading(false);
    }
  };
  
  if (!checkoutData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>
        
        {/* Checkout Steps */}
        <div className="flex mb-8">
          <div className={`flex-1 text-center py-2 ${step === 'details' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            1. Delivery Details
          </div>
          <div className={`flex-1 text-center py-2 ${step === 'payment' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            2. Payment
          </div>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Checkout Form */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {step === 'details' ? (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Address</h2>
                  
                  {/* Saved Addresses */}
                  {addresses.length > 0 && (
                    <div className="mb-6">
                      <div className="space-y-3">
                        {addresses.map(address => (
                          <label key={address._id} className="flex items-start p-4 border rounded-md cursor-pointer hover:border-blue-500">
                            <input
                              type="radio"
                              value={address._id}
                              checked={selectedAddressId === address._id}
                              onChange={handleAddressChange}
                              className="h-5 w-5 text-blue-600 mt-1"
                            />
                            <div className="ml-3">
                              <div className="text-gray-900 font-medium">{address.name}</div>
                              <div className="text-gray-600 text-sm">
                                {address.addressLine1}<br />
                                {address.addressLine2 && <>{address.addressLine2}<br /></>}
                                {address.city}, {address.state} {address.postalCode}<br />
                                {address.country}<br />
                                Phone: {address.phone}
                              </div>
                            </div>
                          </label>
                        ))}
                        
                        <label className="flex items-start p-4 border rounded-md cursor-pointer hover:border-blue-500">
                          <input
                            type="radio"
                            value="new"
                            checked={showNewAddressForm}
                            onChange={handleAddressChange}
                            className="h-5 w-5 text-blue-600 mt-1"
                          />
                          <div className="ml-3">
                            <div className="text-gray-900 font-medium">Add a new address</div>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}
                  
                  {/* New Address Form */}
                  {showNewAddressForm && (
                    <form onSubmit={handleAddAddress} className="space-y-4 mt-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={newAddress.name}
                          onChange={handleNewAddressChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          placeholder="Full Name"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">
                          Address Line 1
                        </label>
                        <input
                          id="addressLine1"
                          name="addressLine1"
                          type="text"
                          required
                          value={newAddress.addressLine1}
                          onChange={handleNewAddressChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          placeholder="Street address, P.O. box"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">
                          Address Line 2 (Optional)
                        </label>
                        <input
                          id="addressLine2"
                          name="addressLine2"
                          type="text"
                          value={newAddress.addressLine2 || ''}
                          onChange={handleNewAddressChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          placeholder="Apartment, suite, unit, building, floor, etc."
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                            City
                          </label>
                          <input
                            id="city"
                            name="city"
                            type="text"
                            required
                            value={newAddress.city}
                            onChange={handleNewAddressChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                            State / Province
                          </label>
                          <input
                            id="state"
                            name="state"
                            type="text"
                            required
                            value={newAddress.state}
                            onChange={handleNewAddressChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                            Postal Code
                          </label>
                          <input
                            id="postalCode"
                            name="postalCode"
                            type="text"
                            required
                            value={newAddress.postalCode}
                            onChange={handleNewAddressChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                            Country
                          </label>
                          <select
                            id="country"
                            name="country"
                            required
                            value={newAddress.country}
                            onChange={handleNewAddressChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                          >
                            <option value="">Select Country</option>
                            <option value="United States">United States</option>
                            <option value="Canada">Canada</option>
                            <option value="United Kingdom">United Kingdom</option>
                            {/* Add more countries as needed */}
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          required
                          value={newAddress.phone}
                          onChange={handleNewAddressChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          placeholder="For delivery questions"
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="isDefault"
                          name="isDefault"
                          type="checkbox"
                          checked={newAddress.isDefault}
                          onChange={handleNewAddressChange}
                          className="h-4 w-4 text-blue-600"
                        />
                        <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                          Set as default address
                        </label>
                      </div>
                      
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                        >
                          {loading ? 'Saving...' : 'Save Address'}
                        </button>
                      </div>
                    </form>
                  )}
                  
                  <div className="mt-8">
                    <button
                      onClick={proceedToPayment}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                      disabled={loading}
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
                  
                  <div className="mb-6">
                    <div className="space-y-3">
                      <label className="flex items-start p-4 border rounded-md cursor-pointer hover:border-blue-500">
                        <input
                          type="radio"
                          value="card"
                          checked={paymentMethod === 'card'}
                          onChange={() => setPaymentMethod('card')}
                          className="h-5 w-5 text-blue-600 mt-1"
                        />
                        <div className="ml-3">
                          <div className="text-gray-900 font-medium">Credit or Debit Card</div>
                          <div className="text-gray-600 text-sm">Pay securely with your card</div>
                        </div>
                      </label>
                      
                      <label className="flex items-start p-4 border rounded-md cursor-pointer hover:border-blue-500">
                        <input
                          type="radio"
                          value="paypal"
                          checked={paymentMethod === 'paypal'}
                          onChange={() => setPaymentMethod('paypal')}
                          className="h-5 w-5 text-blue-600 mt-1"
                        />
                        <div className="ml-3">
                          <div className="text-gray-900 font-medium">PayPal</div>
                          <div className="text-gray-600 text-sm">Pay with your PayPal account</div>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  {paymentMethod === 'card' && (
                    <div className="space-y-4 mt-4">
                      <div>
                        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                          Card Number
                        </label>
                        <input
                          id="cardNumber"
                          name="cardNumber"
                          type="text"
                          required
                          value={cardDetails.cardNumber}
                          onChange={handleCardDetailsChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          placeholder="1234 5678 9012 3456"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-700 mb-1">
                          Card Holder Name
                        </label>
                        <input
                          id="cardHolder"
                          name="cardHolder"
                          type="text"
                          required
                          value={cardDetails.cardHolder}
                          onChange={handleCardDetailsChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          placeholder="Name as appears on card"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                            Expiry Date
                          </label>
                          <input
                            id="expiryDate"
                            name="expiryDate"
                            type="text"
                            required
                            value={cardDetails.expiryDate}
                            onChange={handleCardDetailsChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            placeholder="MM/YY"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                            CVV
                          </label>
                          <input
                            id="cvv"
                            name="cvv"
                            type="text"
                            required
                            value={cardDetails.cvv}
                            onChange={handleCardDetailsChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            placeholder="123"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {paymentMethod === 'paypal' && (
                    <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-md">
                      You will be redirected to PayPal to complete your payment after placing the order.
                    </div>
                  )}
                  
                  <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setStep('details')}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Back
                    </button>
                    
                    <button
                      onClick={placeOrder}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Place Order'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 flex-shrink-0">
                    <img
                      src={checkoutData.product.mainPhoto || 'https://via.placeholder.com/64'}
                      alt={checkoutData.product.title}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{checkoutData.product.title}</h3>
                    <p className="text-sm text-gray-500">Qty: {checkoutData.quantity}</p>
                    {checkoutData.selectedMaterial && (
                      <p className="text-sm text-gray-500">Material: {checkoutData.selectedMaterial}</p>
                    )}
                    {checkoutData.selectedColor && (
                      <p className="text-sm text-gray-500">
                        Color: <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ backgroundColor: checkoutData.selectedColor }}></span>
                        {checkoutData.selectedColor}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Customizations */}
                {Object.keys(checkoutData.customizations).length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Customizations:</h4>
                    <ul className="text-sm text-gray-600">
                      {Object.entries(checkoutData.customizations).map(([key, value]) => (
                        <li key={key}>{key}: {value}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Delivery Method */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Delivery Method:</h4>
                  <p className="text-sm text-gray-600">{checkoutData.selectedDelivery}</p>
                </div>
              </div>
              
              {/* Price Breakdown */}
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900 font-medium">${(checkoutData.totalPrice * 0.9).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes (10%)</span>
                  <span className="text-gray-900 font-medium">${(checkoutData.totalPrice * 0.1).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex justify-between text-lg font-semibold text-gray-900 mb-6">
                <span>Total</span>
                <span>${checkoutData.totalPrice.toFixed(2)}</span>
              </div>
              
              {/* Secure Checkout Note */}
              <div className="text-xs text-gray-500 flex items-center justify-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure checkout - Your data is protected
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 