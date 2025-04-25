import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

enum ResetStage {
  REQUEST = 'request',
  VERIFY_CODE = 'verify_code',
  NEW_PASSWORD = 'new_password',
  SUCCESS = 'success'
}

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [stage, setStage] = useState<ResetStage>(ResetStage.REQUEST);
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword, verifyResetCode, resetPasswordConfirm, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Handle reset password request
  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    try {
      setIsLoading(true);
      clearError();
      await resetPassword(email);
      setStage(ResetStage.VERIFY_CODE);
    } catch (err) {
      console.error('Reset request failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verification code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !resetCode) return;
    
    try {
      setIsLoading(true);
      clearError();
      const token = await verifyResetCode(phone, resetCode);
      if (token) {
        setResetToken(token);
        setStage(ResetStage.NEW_PASSWORD);
      }
    } catch (err) {
      console.error('Code verification failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password !== confirmPassword) return;
    
    try {
      setIsLoading(true);
      clearError();
      await resetPasswordConfirm(resetToken, password);
      setStage(ResetStage.SUCCESS);
    } catch (err) {
      console.error('Password reset failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to login
  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  // Render error message if present
  const renderError = () => {
    if (!error) return null;
    
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <span>{error}</span>
        <button 
          className="float-right font-bold"
          onClick={clearError}
        >
          ×
        </button>
      </div>
    );
  };

  // Render stage-specific form
  const renderStageContent = () => {
    switch (stage) {
      case ResetStage.REQUEST:
        return (
          <form onSubmit={handleResetRequest}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
              <p className="mt-2 text-sm text-gray-600">
                We'll send instructions to reset your password.
              </p>
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300"
              disabled={isLoading || !email}
            >
              {isLoading ? 'Sending...' : 'Reset Password'}
            </button>
          </form>
        );
      
      case ResetStage.VERIFY_CODE:
        return (
          <form onSubmit={handleVerifyCode}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="phone">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="code">
                Verification Code
              </label>
              <input
                id="code"
                type="text"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="Enter verification code"
                required
              />
              <p className="mt-2 text-sm text-gray-600">
                Enter the code we sent to your phone.
              </p>
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300"
              disabled={isLoading || !phone || !resetCode}
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>
        );
      
      case ResetStage.NEW_PASSWORD:
        return (
          <form onSubmit={handlePasswordReset}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="password">
                New Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                minLength={8}
              />
              <p className="mt-2 text-sm text-gray-600">
                Password must be at least 8 characters with uppercase, lowercase, number and special characters.
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
              {password !== confirmPassword && confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  Passwords do not match
                </p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300"
              disabled={isLoading || !password || password !== confirmPassword}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        );
      
      case ResetStage.SUCCESS:
        return (
          <div className="text-center">
            <div className="mb-6">
              <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <h2 className="mt-4 text-xl font-bold">Password Reset Successful</h2>
              <p className="mt-2">Your password has been reset successfully.</p>
            </div>
            
            <button
              onClick={handleNavigateToLogin}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Go to Login
            </button>
          </div>
        );
    }
  };

  return (
    <div className="reset-password-page">
      <div className="container mx-auto px-4 py-8 max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Reset Password</h1>
        
        {renderError()}
        
        <div className="bg-white p-6 rounded shadow">
          {renderStageContent()}
        </div>
        
        {stage !== ResetStage.SUCCESS && (
          <div className="mt-4 text-center">
            <button
              onClick={handleNavigateToLogin}
              className="text-blue-500 hover:text-blue-700"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword; 