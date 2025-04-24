'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/FormElements';

// Mock data and service
const createListing = async (data: any) => {
  console.log('Creating listing:', data);
  return new Promise((resolve) => setTimeout(() => {
    resolve({ success: true, id: 'listing-' + Date.now() });
  }, 1000));
};

export default function AddListingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Authentication check
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Get form data
      const formData = new FormData(e.currentTarget);
      const listingData = {
        title: formData.get('title'),
        category: formData.get('category'),
        description: formData.get('description'),
        price: formData.get('price'),
        deliveryTime: formData.get('deliveryTime'),
        materials: formData.get('materials'),
        customizable: formData.get('customizable') === 'on',
        inStock: formData.get('inStock') === 'on'
      };

      // Call mock API
      const result = await createListing(listingData);
      if (result.success) {
        setSuccessMessage('Listing created successfully! Redirecting to your listings...');
        e.currentTarget.reset();
        // Simulate redirect after success
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      }
    } catch (error) {
      setErrorMessage('An error occurred while creating the listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create New Listing
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Add a new service or product to your tailor shop
            </p>
          </div>

          {successMessage && (
            <div className="bg-green-50 dark:bg-green-900/30 p-4 border-l-4 border-green-500">
              <p className="text-green-700 dark:text-green-300">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 dark:bg-red-900/30 p-4 border-l-4 border-red-500">
              <p className="text-red-700 dark:text-red-300">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Basic Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Listing Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    placeholder="e.g., Custom Tailored Suit, Dress Alterations"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    <option value="suits">Suits</option>
                    <option value="dresses">Dresses</option>
                    <option value="alterations">Alterations</option>
                    <option value="repairs">Repairs</option>
                    <option value="custom">Custom Designs</option>
                    <option value="kids">Children's Wear</option>
                    <option value="costumes">Costumes</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={5}
                    required
                    placeholder="Describe your service or product in detail. Include information about materials, process, and what makes your work unique."
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Minimum 50 characters recommended for better visibility.
                  </p>
                </div>

                <div>
                  <label htmlFor="materials" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Materials Used
                  </label>
                  <input
                    type="text"
                    id="materials"
                    name="materials"
                    placeholder="e.g., Italian wool, Egyptian cotton, etc."
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Delivery */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Pricing & Delivery
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    min="0"
                    step="0.01"
                    required
                    placeholder="Enter price"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estimated Delivery Time *
                  </label>
                  <select
                    id="deliveryTime"
                    name="deliveryTime"
                    required
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select delivery time</option>
                    <option value="3-5">3-5 days</option>
                    <option value="1-2">1-2 weeks</option>
                    <option value="2-3">2-3 weeks</option>
                    <option value="3-4">3-4 weeks</option>
                    <option value="custom">Custom timeframe</option>
                  </select>
                </div>

                <div className="flex space-x-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="customizable"
                      name="customizable"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="customizable" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Customizable
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="inStock"
                      name="inStock"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="inStock" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      In Stock / Available Now
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Photos */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Photos
              </h2>
              
              <div className="bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <div className="space-y-2">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Drag and drop image files, or <span className="text-blue-600 dark:text-blue-400">browse</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                * Photo upload is not functional in this demo version
              </p>
            </div>

            {/* Submit */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex justify-end space-x-4">
              <Link href="/dashboard">
                <Button
                  variant="outline"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Listing'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
