import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
    businessName: '',
    businessDescription: '',
    location: ''
  });
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        if (userData.role === 'buyer') {
          router.push('/dashboard');
        } else if (userData.role === 'seller') {
          router.push('/seller/dashboard');
        }
      } catch (err) {
        console.error('Error parsing user data', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, [router]);
  
  const validateBasicInfo = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Allow registration with either email or phone, but at least one is required
    const hasEmail = formData.email.trim() !== '';
    const hasPhone = formData.phone.trim() !== '';
    
    if (!hasEmail && !hasPhone) {
      newErrors.email = 'Either email or phone is required';
      newErrors.phone = 'Either email or phone is required';
    } else {
      // Validate email format if provided
      if (hasEmail && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
      
      // Validate phone format if provided
      if (hasPhone && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(formData.phone)) {
        newErrors.phone = 'Phone number is invalid';
      }
    }
    
    // Phone is now mandatory regardless
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateRoleSelection = () => {
    const newErrors = {};
    
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateFinal = () => {
    const newErrors = {};
    
    if (formData.role === 'seller') {
      if (!formData.businessName.trim()) {
        newErrors.businessName = 'Business name is required';
      }
      
      if (!formData.location.trim()) {
        newErrors.location = 'Location is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleRoleSelection = (role) => {
    setFormData(prevState => ({
      ...prevState,
      role
    }));
  };
  
  const handleSubmitBasicInfo = (e) => {
    e.preventDefault();
    
    if (validateBasicInfo()) {
      setCurrentStep(2);
    }
  };
  
  const handleSubmitRoleSelection = (e) => {
    e.preventDefault();
    
    if (validateRoleSelection()) {
      setCurrentStep(3);
    }
  };
  
  const handleSubmitFinal = async (e) => {
    e.preventDefault();
    
    if (validateFinal()) {
      setLoading(true);
      
      try {
        // In a real app, this would be an API call to create a user account
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        
        // Store user data in localStorage (in a real app, this would be a JWT token)
        const userData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          ...(formData.role === 'seller' && {
            businessName: formData.businessName,
            businessDescription: formData.businessDescription,
            location: formData.location
          })
        };
        
        const mockToken = 'mock-jwt-token';
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', mockToken);
        
        // Redirect based on role
        if (formData.role === 'buyer') {
          router.push('/dashboard');
        } else {
          // Redirect to client app seller dashboard with token
          window.location.href = `http://localhost:3000/seller/dashboard?token=${mockToken}`;
        }
      } catch (error) {
        console.error('Registration error:', error);
        setErrors({ general: 'Failed to register. Please try again.' });
      } finally {
        setLoading(false);
      }
    }
  };
  
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            sign in to your existing account
          </Link>
        </p>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${currentStep >= 1 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                  {currentStep > 1 ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>1</span>
                  )}
                </div>
                <span className="ml-2 text-sm font-medium">Basic Info</span>
              </div>
              
              <div className={`flex-1 border-t-2 mx-4 ${currentStep >= 2 ? 'border-blue-600' : 'border-gray-200'}`}></div>
              
              <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${currentStep >= 2 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                  {currentStep > 2 ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>2</span>
                  )}
                </div>
                <span className="ml-2 text-sm font-medium">Role</span>
              </div>
              
              <div className={`flex-1 border-t-2 mx-4 ${currentStep >= 3 ? 'border-blue-600' : 'border-gray-200'}`}></div>
              
              <div className={`flex items-center ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${currentStep >= 3 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                  <span>3</span>
                </div>
                <span className="ml-2 text-sm font-medium">Details</span>
              </div>
            </div>
          </div>
          
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <form onSubmit={handleSubmitBasicInfo}>
              {errors.general && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
                  {errors.general}
                </div>
              )}
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`appearance-none block w-full px-3 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    />
                  </div>
                  {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address (optional if phone provided)
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`appearance-none block w-full px-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    />
                  </div>
                  {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (123) 456-7890"
                      className={`appearance-none block w-full px-3 py-2 border ${errors.phone ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    />
                  </div>
                  {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone}</p>}
                  <p className="mt-1 text-sm text-gray-500">Your phone number will be used for authentication and communication with buyers/sellers.</p>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`appearance-none block w-full px-3 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    />
                  </div>
                  {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`appearance-none block w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    />
                  </div>
                  {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Continue
                </button>
              </div>
            </form>
          )}
          
          {/* Step 2: Role Selection */}
          {currentStep === 2 && (
            <form onSubmit={handleSubmitRoleSelection}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  I want to register as a:
                </label>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div 
                    className={`relative rounded-lg border ${formData.role === 'buyer' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} p-4 cursor-pointer`}
                    onClick={() => handleRoleSelection('buyer')}
                  >
                    <div className="flex items-center">
                      <div className={`mr-3 h-5 w-5 rounded-full border flex items-center justify-center ${formData.role === 'buyer' ? 'border-blue-500' : 'border-gray-300'}`}>
                        {formData.role === 'buyer' && (
                          <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Buyer</h3>
                        <p className="text-xs text-gray-500">I want to shop for tailoring services</p>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`relative rounded-lg border ${formData.role === 'seller' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} p-4 cursor-pointer`}
                    onClick={() => handleRoleSelection('seller')}
                  >
                    <div className="flex items-center">
                      <div className={`mr-3 h-5 w-5 rounded-full border flex items-center justify-center ${formData.role === 'seller' ? 'border-blue-500' : 'border-gray-300'}`}>
                        {formData.role === 'seller' && (
                          <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Seller (Tailor)</h3>
                        <p className="text-xs text-gray-500">I want to offer my tailoring services</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {errors.role && <p className="mt-2 text-sm text-red-600">{errors.role}</p>}
              </div>
              
              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Continue
                </button>
              </div>
            </form>
          )}
          
          {/* Step 3: Role-specific Details */}
          {currentStep === 3 && (
            <form onSubmit={handleSubmitFinal}>
              {formData.role === 'buyer' ? (
                <div className="p-4 bg-blue-50 rounded-md mb-6">
                  <h3 className="text-sm font-medium text-blue-800">Your Account as a Buyer</h3>
                  <p className="mt-1 text-sm text-blue-700">
                    You're all set to start shopping for tailoring services! After registration, you'll be able to:
                  </p>
                  <ul className="mt-2 text-sm text-blue-700 list-disc pl-5 space-y-1">
                    <li>Browse products and services from tailors</li>
                    <li>Place orders for custom tailoring</li>
                    <li>Communicate with tailors</li>
                    <li>Track your orders</li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                      Business Name
                    </label>
                    <div className="mt-1">
                      <input
                        id="businessName"
                        name="businessName"
                        type="text"
                        required
                        value={formData.businessName}
                        onChange={handleInputChange}
                        className={`appearance-none block w-full px-3 py-2 border ${errors.businessName ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      />
                    </div>
                    {errors.businessName && <p className="mt-2 text-sm text-red-600">{errors.businessName}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="businessDescription" className="block text-sm font-medium text-gray-700">
                      Business Description
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="businessDescription"
                        name="businessDescription"
                        rows="3"
                        value={formData.businessDescription}
                        onChange={handleInputChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Tell buyers about your services, specialties, experience, etc."
                      ></textarea>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <div className="mt-1">
                      <input
                        id="location"
                        name="location"
                        type="text"
                        required
                        value={formData.location}
                        onChange={handleInputChange}
                        className={`appearance-none block w-full px-3 py-2 border ${errors.location ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                        placeholder="City, State, Country"
                      />
                    </div>
                    {errors.location && <p className="mt-2 text-sm text-red-600">{errors.location}</p>}
                  </div>
                </div>
              )}
              
              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>
          )}
          
          <div className="mt-6">
            <p className="text-center text-xs text-gray-600">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="font-medium text-blue-600 hover:text-blue-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="font-medium text-blue-600 hover:text-blue-500">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
} 