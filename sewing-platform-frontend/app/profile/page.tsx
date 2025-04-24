'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/FormElements';

// Mock user data
const MOCK_USER = {
  id: 'user-123',
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@example.com',
  phone: '+1 (555) 123-4567',
  role: 'customer',
  address: {
    street: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States'
  },
  profileImage: '/images/avatars/default.jpg',
  bio: 'I love custom-made clothes that fit perfectly. Looking for talented tailors to help with my wardrobe.',
  preferences: {
    darkMode: false,
    newsletter: true,
    notifications: {
      email: true,
      sms: false,
      app: true
    }
  },
  memberSince: '2022-09-15'
};

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(MOCK_USER);
  const [activeTab, setActiveTab] = useState('personal'); // personal, address, preferences, security
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...MOCK_USER });
  const [successMessage, setSuccessMessage] = useState('');
  
  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  // Handle nested notification preferences
  const handleNotificationChange = (type, checked) => {
    setFormData({
      ...formData,
      preferences: {
        ...formData.preferences,
        notifications: {
          ...formData.preferences.notifications,
          [type]: checked
        }
      }
    });
  };

  // Save profile changes
  const handleSaveProfile = (e) => {
    e.preventDefault();
    
    // Simulate API call to update profile
    setTimeout(() => {
      setUser(formData);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }, 1000);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setFormData({ ...user });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <img 
                  src={user.profileImage || '/images/avatars/default.jpg'} 
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.role === 'customer' ? 'Customer' : 'Tailor'} • Member since {new Date(user.memberSince).toLocaleDateString()}
                </p>
              </div>
            </div>
            {!isEditing && (
              <Button
                variant="primary"
                onClick={() => setIsEditing(true)}
                className="mt-4 sm:mt-0"
              >
                Edit Profile
              </Button>
            )}
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 dark:bg-green-900/30 p-4 border-l-4 border-green-500">
              <p className="text-green-700 dark:text-green-300">{successMessage}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'personal'
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Personal Info
            </button>
            <button
              onClick={() => setActiveTab('address')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'address'
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Address
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'preferences'
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Preferences
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'security'
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Password & Security
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSaveProfile}>
            <div className="p-6">
              {/* Personal Information */}
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 disabled:dark:bg-gray-800 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 disabled:dark:bg-gray-800 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 disabled:dark:bg-gray-800 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 disabled:dark:bg-gray-800 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 disabled:dark:bg-gray-800 disabled:cursor-not-allowed"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Address */}
              {activeTab === 'address' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Address Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label htmlFor="street" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        id="street"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 disabled:dark:bg-gray-800 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 disabled:dark:bg-gray-800 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        State / Province
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 disabled:dark:bg-gray-800 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        ZIP / Postal Code
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        name="address.zipCode"
                        value={formData.address.zipCode}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 disabled:dark:bg-gray-800 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        id="country"
                        name="address.country"
                        value={formData.address.country}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 disabled:dark:bg-gray-800 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Preferences
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="darkMode"
                        name="preferences.darkMode"
                        checked={formData.preferences.darkMode}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                      />
                      <label htmlFor="darkMode" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Enable dark mode
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="newsletter"
                        name="preferences.newsletter"
                        checked={formData.preferences.newsletter}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                      />
                      <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Subscribe to newsletter
                      </label>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                      Notification Preferences
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="emailNotifications"
                          checked={formData.preferences.notifications.email}
                          onChange={(e) => handleNotificationChange('email', e.target.checked)}
                          disabled={!isEditing}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                        />
                        <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Email notifications
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="smsNotifications"
                          checked={formData.preferences.notifications.sms}
                          onChange={(e) => handleNotificationChange('sms', e.target.checked)}
                          disabled={!isEditing}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                        />
                        <label htmlFor="smsNotifications" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          SMS notifications
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="appNotifications"
                          checked={formData.preferences.notifications.app}
                          onChange={(e) => handleNotificationChange('app', e.target.checked)}
                          disabled={!isEditing}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                        />
                        <label htmlFor="appNotifications" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          In-app notifications
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Password & Security
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        disabled={!isEditing}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 disabled:dark:bg-gray-800 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        disabled={!isEditing}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 disabled:dark:bg-gray-800 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        disabled={!isEditing}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 disabled:dark:bg-gray-800 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="mt-6">
                      <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                        Two-Factor Authentication
                      </h3>
                      <div className="flex items-center">
                        <div className="flex-1">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            Add an extra layer of security by enabling two-factor authentication
                          </p>
                        </div>
                        <div>
                          <Button
                            variant="outline"
                            disabled={!isEditing}
                            type="button"
                          >
                            Setup 2FA
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            {isEditing && (
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                >
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
