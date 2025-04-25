import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is not logged in, redirect to login page
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Tailors Platform</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">
              Welcome, {user.name || user.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">
            {!user.phoneVerified && (
              <span className="block text-red-600 font-medium">
                Your phone number is not verified. Please verify it to access all features.
              </span>
            )}
          </p>
        </div>

        {/* Role-specific content */}
        {renderRoleContent(user.role)}
      </div>
    </div>
  );
};

// Helper function to render role-specific content
const renderRoleContent = (role?: string) => {
  switch (role) {
    case 'buyer':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Your Orders</h3>
            <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Browse Tailors
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Saved Measurements</h3>
            <p className="text-gray-600 mb-4">No saved measurements found.</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Add Measurements
            </button>
          </div>
        </div>
      );
    
    case 'seller':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Your Orders</h3>
            <p className="text-gray-600 mb-4">You don't have any orders yet.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Completion</h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div className="bg-blue-600 h-2.5 rounded-full w-1/4"></div>
            </div>
            <p className="text-gray-600 mb-4">Complete your profile to attract more clients.</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Complete Profile
            </button>
          </div>
        </div>
      );

    case 'admin':
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Users</h3>
            <p className="text-3xl font-bold text-gray-800">127</p>
            <p className="text-green-600 text-sm">+12 this week</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Orders</h3>
            <p className="text-3xl font-bold text-gray-800">53</p>
            <p className="text-green-600 text-sm">+8 this week</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue</h3>
            <p className="text-3xl font-bold text-gray-800">$1,248</p>
            <p className="text-green-600 text-sm">+15% this month</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow md:col-span-3">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                <li className="py-3">New user registered: John Doe</li>
                <li className="py-3">Order #1234 completed</li>
                <li className="py-3">New seller verification request</li>
                <li className="py-3">Payment processed: $240</li>
              </ul>
            </div>
          </div>
        </div>
      );
      
    default:
      return (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Welcome to Tailors Platform</h3>
          <p className="text-gray-600 mb-4">Complete your profile to get started.</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Update Profile
          </button>
        </div>
      );
  }
};

export default Dashboard; 