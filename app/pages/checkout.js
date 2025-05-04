import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Checkout() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    paymentMethod: 'cashOnDelivery'
  });
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0
  });
  
  // Mock cart items - same as cart page
  const mockCartItems = [
    {
      id: 1,
      productId: 1,
      name: 'Tailored Suit',
      price: 299.99,
      quantity: 1,
      image: 'https://via.placeholder.com/100x100',
      seller: 'Premium Tailors',
      sellerId: 'premium-tailors',
      sellerPhone: '+1 (555) 123-4567'
    },
    {
      id: 2,
      productId: 3,
      name: 'Casual Shirt',
      price: 59.99,
      quantity: 2,
      image: 'https://via.placeholder.com/100x100',
      seller: 'Urban Threads',
      sellerId: 'urban-threads',
      sellerPhone: '+1 (555) 987-6543'
    }
  ];
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      // Redirect to login page if not authenticated
      router.push('/login?redirect=/checkout');
      return;
    }
    
    try {
      setUser(JSON.parse(storedUser));
      
      // For demo purposes, we're using mock data
      // In a real app, you would fetch the user's cart from an API
      setCartItems(mockCartItems);
      setLoading(false);
      
      // Calculate order summary
      const subtotal = mockCartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      setOrderSummary({
        subtotal: subtotal,
        shipping: 10,
        tax: subtotal * 0.08,
        total: subtotal + 10 + (subtotal * 0.08)
      });
    } catch (err) {
      console.error('Error parsing user data:', err);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      router.push('/login?redirect=/checkout');
    }
  }, [router]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would process the payment and create an order
    // For this demo, we'll just show a success message and redirect
    alert('Order placed successfully!');
    router.push('/order-confirmation');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
      
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
        {/* Form */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit}>
            <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h2>
              
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First name</label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last name</label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone number</label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="col-span-6">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">Street address</label>
                  <input
                    type="text"
                    name="address"
                    id="address"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="col-span-6 sm:col-span-6 lg:col-span-2">
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    name="city"
                    id="city"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">State / Province</label>
                  <input
                    type="text"
                    name="state"
                    id="state"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.state}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">ZIP / Postal code</label>
                  <input
                    type="text"
                    name="zipCode"
                    id="zipCode"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="col-span-6">
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                  <select
                    id="country"
                    name="country"
                    required
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.country}
                    onChange={handleInputChange}
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="Mexico">Mexico</option>
                    <option value="United Kingdom">United Kingdom</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow overflow-hidden sm:rounded-md p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h2>
              
              <div className="mt-4 space-y-4">
                <div className="flex items-center">
                  <input
                    id="cashOnDelivery"
                    name="paymentMethod"
                    type="radio"
                    value="cashOnDelivery"
                    checked={formData.paymentMethod === 'cashOnDelivery'}
                    onChange={handleInputChange}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <label htmlFor="cashOnDelivery" className="ml-3 block text-sm font-medium text-gray-700">
                    Cash on Delivery
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="creditCard"
                    name="paymentMethod"
                    type="radio"
                    value="creditCard"
                    checked={formData.paymentMethod === 'creditCard'}
                    onChange={handleInputChange}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <label htmlFor="creditCard" className="ml-3 block text-sm font-medium text-gray-700">
                    Credit Card
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="contactSeller"
                    name="paymentMethod"
                    type="radio"
                    value="contactSeller"
                    checked={formData.paymentMethod === 'contactSeller'}
                    onChange={handleInputChange}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <label htmlFor="contactSeller" className="ml-3 block text-sm font-medium text-gray-700">
                    Contact Seller Directly
                  </label>
                </div>
              </div>
              
              {formData.paymentMethod === 'creditCard' && (
                <div className="mt-6 grid grid-cols-6 gap-6">
                  <div className="col-span-6">
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">Card number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      id="cardNumber"
                      placeholder="XXXX XXXX XXXX XXXX"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700">Expiration date</label>
                    <input
                      type="text"
                      name="expirationDate"
                      id="expirationDate"
                      placeholder="MM/YY"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      id="cvv"
                      placeholder="XXX"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              )}
              
              {formData.paymentMethod === 'contactSeller' && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-md">
                  <h3 className="text-sm font-medium text-gray-900">Seller Contact Information</h3>
                  <div className="mt-2 space-y-2">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span>{item.seller}:</span>
                        <a href={`tel:${item.sellerPhone}`} className="text-blue-600 hover:text-blue-500">{item.sellerPhone}</a>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Contact the seller(s) directly to arrange payment and delivery details.
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                className="w-full bg-blue-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Place Order
              </button>
            </div>
            
            <div className="mt-4">
              <Link href="/cart" className="text-sm text-blue-600 hover:text-blue-500 flex items-center justify-center">
                <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Return to Cart
              </Link>
            </div>
          </form>
        </div>
        
        {/* Order summary */}
        <div className="mt-8 lg:mt-0 lg:col-span-4">
          <div className="bg-white shadow overflow-hidden sm:rounded-md p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
            
            <ul className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <li key={item.id} className="py-4 flex">
                  <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-center object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-1 flex flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3>{item.name}</h3>
                        <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{item.seller}</p>
                    </div>
                    <div className="flex-1 flex items-end justify-between text-sm">
                      <p className="text-gray-500">Qty {item.quantity}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="flex justify-between text-sm">
                <p className="text-gray-600">Subtotal</p>
                <p className="font-medium text-gray-900">${calculateSubtotal().toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <p className="text-gray-600">Shipping</p>
                <p className="font-medium text-gray-900">$10.00</p>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <p className="text-gray-600">Taxes</p>
                <p className="font-medium text-gray-900">${(calculateSubtotal() * 0.1).toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-base font-medium text-gray-900 mt-4 pt-4 border-t border-gray-200">
                <p>Total</p>
                <p>${(calculateSubtotal() + 10 + calculateSubtotal() * 0.1).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 