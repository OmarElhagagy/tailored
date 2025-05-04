import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function DashboardProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    notificationSettings: {
      orderUpdates: true,
      promotions: false,
      newsletter: true
    }
  });
  
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        const userObj = JSON.parse(storedUser);
        setUser(userObj);
        
        // Initialize form data with user data
        setFormData({
          name: userObj.name || '',
          email: userObj.email || '',
          phone: userObj.phone || '',
          address: userObj.address || '',
          bio: userObj.bio || '',
          notificationSettings: userObj.notificationSettings || {
            orderUpdates: true,
            promotions: false,
            newsletter: true
          }
        });
        
        setLoading(false);
      } else {
        // Redirect to login page if not authenticated
        router.push('/login?redirect=/dashboard/profile');
      }
    } catch (err) {
      console.error('Error parsing user data:', err);
      router.push('/login?redirect=/dashboard/profile');
    }
  }, [router]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      notificationSettings: {
        ...formData.notificationSettings,
        [name]: checked
      }
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would make an API call to update the user profile
    console.log('Updated profile data:', formData);
    
    // Update the user in localStorage for demo purposes
    const updatedUser = { ...user, ...formData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    setIsEditing(false);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Profile Settings
            </h1>
          </div>
          
          <div className="mt-4 flex md:mt-0 md:ml-4">
            {isEditing ? (
              <button
                type="button"
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-6">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="address"
                        id="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  {user.role === 'seller' && (
                    <div className="sm:col-span-6">
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                        Bio
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="bio"
                          name="bio"
                          rows={3}
                          value={formData.bio}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Write a few sentences about yourself or your business.
                      </p>
                    </div>
                  )}
                  
                  <div className="sm:col-span-6">
                    <fieldset>
                      <legend className="text-base font-medium text-gray-700">Notification Settings</legend>
                      <div className="mt-4 space-y-4">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="orderUpdates"
                              name="orderUpdates"
                              type="checkbox"
                              checked={formData.notificationSettings.orderUpdates}
                              onChange={handleCheckboxChange}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="orderUpdates" className="font-medium text-gray-700">
                              Order Updates
                            </label>
                            <p className="text-gray-500">Get notified about your order status changes.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="promotions"
                              name="promotions"
                              type="checkbox"
                              checked={formData.notificationSettings.promotions}
                              onChange={handleCheckboxChange}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="promotions" className="font-medium text-gray-700">
                              Promotions
                            </label>
                            <p className="text-gray-500">Receive emails about new promotions and discounts.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="newsletter"
                              name="newsletter"
                              type="checkbox"
                              checked={formData.notificationSettings.newsletter}
                              onChange={handleCheckboxChange}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="newsletter" className="font-medium text-gray-700">
                              Newsletter
                            </label>
                            <p className="text-gray-500">Get weekly newsletter with tailoring tips and trends.</p>
                          </div>
                        </div>
                      </div>
                    </fieldset>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Full name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.name || 'Not provided'}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Email address</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.email}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Phone number</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.phone || 'Not provided'}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.address || 'Not provided'}</dd>
                </div>
                {user.role === 'seller' && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Bio</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.bio || 'Not provided'}</dd>
                  </div>
                )}
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Account type</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.role === 'seller' ? 'Seller Account' : 'Buyer Account'}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Notification preferences</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                      <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                        <div className="w-0 flex-1 flex items-center">
                          <span className="flex-1 w-0 truncate">Order Updates</span>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <span className={`${formData.notificationSettings.orderUpdates ? 'text-green-600' : 'text-gray-500'}`}>
                            {formData.notificationSettings.orderUpdates ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </li>
                      <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                        <div className="w-0 flex-1 flex items-center">
                          <span className="flex-1 w-0 truncate">Promotions</span>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <span className={`${formData.notificationSettings.promotions ? 'text-green-600' : 'text-gray-500'}`}>
                            {formData.notificationSettings.promotions ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </li>
                      <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                        <div className="w-0 flex-1 flex items-center">
                          <span className="flex-1 w-0 truncate">Newsletter</span>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <span className={`${formData.notificationSettings.newsletter ? 'text-green-600' : 'text-gray-500'}`}>
                            {formData.notificationSettings.newsletter ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </li>
                    </ul>
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 