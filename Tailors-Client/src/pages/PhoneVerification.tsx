import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PhoneVerification: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [phone, setPhone] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { verifyPhoneCode, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract phone from state or query params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const phoneParam = searchParams.get('phone');
    
    if (phoneParam) {
      setPhone(phoneParam);
    } else if (location.state && location.state.phone) {
      setPhone(location.state.phone);
    }
  }, [location]);

  // Countdown timer for resend code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle code verification
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !verificationCode) return;
    
    try {
      setIsVerifying(true);
      await verifyPhoneCode(phone, verificationCode);
      
      // Redirect to dashboard after successful verification
      navigate('/dashboard');
    } catch (err) {
      console.error('Verification failed:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle resend code
  const handleResend = async () => {
    if (isResending || countdown > 0) return;
    
    try {
      setIsResending(true);
      // Call API to resend code (needs to be implemented in auth context)
      // await resendVerificationCode(phone);
      
      // Reset countdown
      setCountdown(60);
    } catch (err) {
      console.error('Failed to resend code:', err);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="phone-verification-page">
      <div className="container mx-auto px-4 py-8 max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Verify Your Phone</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <span>{error}</span>
            <button 
              className="float-right font-bold"
              onClick={clearError}
            >
              ×
            </button>
          </div>
        )}
        
        <p className="mb-6 text-center">
          We've sent a verification code to {phone || 'your phone'}. 
          Please enter it below to verify your account.
        </p>
        
        <form onSubmit={handleVerify} className="mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="code">
              Verification Code
            </label>
            <input
              id="code"
              type="text"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter your verification code"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300"
            disabled={isVerifying || !verificationCode}
          >
            {isVerifying ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>
        
        <div className="text-center">
          <button
            onClick={handleResend}
            className="text-blue-500 hover:text-blue-700 disabled:text-gray-400"
            disabled={countdown > 0 || isResending}
          >
            {countdown > 0 
              ? `Resend code in ${countdown}s` 
              : isResending 
                ? 'Sending...' 
                : 'Resend code'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhoneVerification; 