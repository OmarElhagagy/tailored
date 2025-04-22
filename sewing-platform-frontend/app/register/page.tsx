'use client';

import React, { useState } from 'react';
import { Input, Select, Button, Checkbox } from '../../components/FormElements';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/contexts/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [accountType, setAccountType] = useState('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  
  // Form validation
  const validateStep1 = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (!password) {
      setError('Password is required');
      return false;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };
  
  const validateStep2 = () => {
    if (!firstName.trim()) {
      setError('First name is required');
      return false;
    }
    
    if (!lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    
    if (!agreeTerms) {
      setError('You must agree to the Terms of Service to continue');
      return false;
    }
    
    return true;
  };
  
  // Handle step navigation
  const goToNextStep = () => {
    setError('');
    
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      handleSubmit();
    }
  };
  
  const goToPreviousStep = () => {
    setStep(step - 1);
    setError('');
  };
  
  // Submit form
  const handleSubmit = async () => {
    const { register } = useAuth();
    setIsLoading(true);
    
    try {
      // Create user data from the form
      const userData = {
        email,
        password,
        firstName,
        lastName,
        phone,
        location,
        role: accountType === 'seller' ? 'seller' : 'customer',
        marketingConsent: agreeMarketing
      };
      
      // Use auth context register
      await register(userData);
      
      // Redirect based on account type
      if (accountType === 'seller') {
        router.push('/dashboard');
      } else {
        router.push('/listings');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create Your Account
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {step === 1 
                ? 'Set up your account credentials' 
                : 'Tell us a bit about yourself'}
            </p>
          </div>
          
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className={`h-1 w-16 sm:w-32 ${
                step >= 2 ? 'bg-blue-600' : 'bg-gray-200'
              }`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
            </div>
            <div className="flex justify-center mt-2">
              <div className="text-xs text-gray-500 dark:text-gray-400 w-20 sm:w-40 text-center">
                Account Setup
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 w-20 sm:w-40 text-center">
                Personal Info
              </div>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          <form className="space-y-6">
            {step === 1 && (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    How will you use Tailors?
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                      className={`p-4 border rounded-lg cursor-pointer ${
                        accountType === 'customer' 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                      onClick={() => setAccountType('customer')}
                    >
                      <div className="flex items-start">
                        <div className={`w-5 h-5 rounded-full border-2 mt-0.5 mr-3 flex-shrink-0 ${
                          accountType === 'customer' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}></div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            I'm a Customer
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Looking for tailors to create or alter clothing
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className={`p-4 border rounded-lg cursor-pointer ${
                        accountType === 'seller' 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                      onClick={() => setAccountType('seller')}
                    >
                      <div className="flex items-start">
                        <div className={`w-5 h-5 rounded-full border-2 mt-0.5 mr-3 flex-shrink-0 ${
                          accountType === 'seller' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}></div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            I'm a Tailor
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Offering sewing services and custom clothing
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Input
                  id="email"
                  label="Email Address"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  helpText="We'll use this for login and important notifications"
                />
                
                <Input
                  id="password"
                  label="Password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  helpText="Use at least 8 characters with letters and numbers"
                />
                
                <Input
                  id="confirm-password"
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </>
            )}
            
            {step === 2 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="first-name"
                    label="First Name"
                    type="text"
                    placeholder="Your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                  
                  <Input
                    id="last-name"
                    label="Last Name"
                    type="text"
                    placeholder="Your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
                
                <Input
                  id="phone"
                  label="Phone Number (optional)"
                  type="tel"
                  placeholder="Your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  helpText="We'll only use this for order-related communication"
                />
                
                <Input
                  id="location"
                  label="Location (optional)"
                  type="text"
                  placeholder="City, State"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  helpText="Helps us connect you with nearby services"
                />
                
                <Checkbox
                  id="agree-terms"
                  label={
                    <>
                      I agree to the{' '}
                      <Link 
                        href="/terms" 
                        className="text-blue-600 hover:underline dark:text-blue-400"
                        target="_blank"
                      >
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link 
                        href="/privacy" 
                        className="text-blue-600 hover:underline dark:text-blue-400"
                        target="_blank"
                      >
                        Privacy Policy
                      </Link>
                    </>
                  }
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  error={!agreeTerms && error.includes('Terms') ? 'You must agree to continue' : undefined}
                />
                
                <Checkbox
                  id="agree-marketing"
                  label="I'd like to receive promotions, tips, and updates via email"
                  checked={agreeMarketing}
                  onChange={(e) => setAgreeMarketing(e.target.checked)}
                  helpText="You can unsubscribe at any time"
                />
              </>
            )}
            
            <div className={`flex ${step === 1 ? 'justify-end' : 'justify-between'} mt-8`}>
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPreviousStep}
                  disabled={isLoading}
                >
                  Back
                </Button>
              )}
              
              <Button
                type="button"
                variant="primary"
                onClick={goToNextStep}
                disabled={isLoading}
              >
                {isLoading 
                  ? 'Please wait...' 
                  : step < 2 
                    ? 'Continue' 
                    : accountType === 'seller' 
                      ? 'Create Seller Account' 
                      : 'Create Account'}
              </Button>
            </div>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
