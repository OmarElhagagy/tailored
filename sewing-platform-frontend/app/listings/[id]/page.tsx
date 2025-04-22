'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button, Textarea } from '../../../components/FormElements';
import { useParams, useRouter } from 'next/navigation';

// Mock data - in a real app, this would be fetched from an API
const MOCK_LISTING = {
  id: '1',
  title: 'Custom Tailored Suits',
  description: 'Professional tailor with over 15 years of experience specializing in bespoke suits for all occasions. I can create custom suits for weddings, business, formal events, and more. Using only the finest materials and traditional tailoring techniques to ensure a perfect fit and exceptional quality.',
  images: [
    '/images/tailor-1.jpg',
    '/images/tailor-detail-1.jpg',
    '/images/tailor-detail-2.jpg',
    '/images/tailor-detail-3.jpg',
  ],
  rating: 4.9,
  reviewCount: 127,
  price: 'From $299',
  tags: ['Suits', 'Formal Wear', 'Custom Fit', 'Weddings'],
  location: 'New York, NY',
  deliveryDays: 14,
  seller: {
    id: 'seller-123',
    name: 'James Thompson',
    image: '/images/seller-1.jpg',
    memberSince: 'January 2015',
    responseTime: 'Usually responds within 2 hours',
    completedOrders: 532,
    rating: 4.9
  },
  services: [
    {
      name: 'Basic Suit',
      price: '$299',
      description: 'Custom-fitted basic suit with standard fabric options.',
      deliveryTime: '14 days'
    },
    {
      name: 'Premium Suit',
      price: '$599',
      description: 'Premium suit with high-quality fabrics and additional customization options.',
      deliveryTime: '18 days'
    },
    {
      name: 'Luxury Suit',
      price: '$999+',
      description: 'Luxury suit made with the finest materials and full customization.',
      deliveryTime: '21 days'
    },
    {
      name: 'Alterations',
      price: '$75+',
      description: 'Alterations to existing suits for a better fit.',
      deliveryTime: '7 days'
    }
  ],
  reviews: [
    {
      id: 'review-1',
      user: 'Robert C.',
      rating: 5,
      date: '2 months ago',
      comment: 'James created a perfect wedding suit for me. The fit was impeccable and the quality outstanding. Highly recommend!'
    },
    {
      id: 'review-2',
      user: 'Michael T.',
      rating: 5,
      date: '3 months ago',
      comment: 'Excellent craftsmanship and attention to detail. My suit fits perfectly and arrived ahead of schedule.'
    },
    {
      id: 'review-3',
      user: 'David L.',
      rating: 4,
      date: '5 months ago',
      comment: 'Great quality suit and very good communication throughout the process. Would use again.'
    }
  ]
};

export default function ListingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const listing = MOCK_LISTING; // In a real app, this would be fetched based on params.id
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  
  // In a real app, this would send a message to the seller
  const handleContactSeller = () => {
    if (!message.trim()) {
      alert('Please enter a message to the seller');
      return;
    }
    
    // This would be an API call in a real app
    alert('Your message has been sent to the seller.');
    setMessage('');
  };

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Listing Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          The listing you're looking for doesn't exist or has been removed.
        </p>
        <Button
          onClick={() => router.push('/listings')}
          variant="primary"
        >
          Back to Listings
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                  </svg>
                  <Link href="/listings" className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2 dark:text-gray-400 dark:hover:text-white">
                    Listings
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400">
                    {listing.title}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
        
        {/* Main content: split into left (images) and right (details) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Images */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              {/* Main image */}
              <div className="relative h-96 w-full">
                <Image
                  src={listing.images[selectedImage]}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
              </div>
              
              {/* Thumbnail gallery */}
              <div className="p-4 flex space-x-4 overflow-x-auto">
                {listing.images.map((image, index) => (
                  <div
                    key={index}
                    className={`relative h-20 w-20 flex-shrink-0 cursor-pointer rounded-md overflow-hidden ${
                      selectedImage === index ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <Image
                      src={image}
                      alt={`${listing.title} - image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Tabs for Description, Services, Reviews */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex">
                  {['description', 'services', 'reviews'].map((tab) => (
                    <button
                      key={tab}
                      className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                        activeTab === tab 
                          ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-500' 
                          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>
              
              <div className="p-6">
                {activeTab === 'description' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      About This Service
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {listing.description}
                    </p>
                    
                    <div className="mt-6">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                        Details
                      </h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <li className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-gray-700 dark:text-gray-300">
                            Location: {listing.location}
                          </span>
                        </li>
                        <li className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-700 dark:text-gray-300">
                            Average Delivery: {listing.deliveryDays} days
                          </span>
                        </li>
                        <li className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          <span className="text-gray-700 dark:text-gray-300">
                            Starting Price: {listing.price}
                          </span>
                        </li>
                        <li className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700 dark:text-gray-300">
                            Completed Orders: {listing.seller.completedOrders}
                          </span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                        Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {listing.tags.map((tag, index) => (
                          <span 
                            key={index} 
                            className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full px-3 py-1 text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'services' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Services Offered
                    </h3>
                    <div className="space-y-6">
                      {listing.services.map((service, index) => (
                        <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0 last:pb-0">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                              {service.name}
                            </h4>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                              {service.price}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 mb-2">
                            {service.description}
                          </p>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Delivery in {service.deliveryTime}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {activeTab === 'reviews' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Customer Reviews
                      </h3>
                      <div className="flex items-center">
                        <div className="flex text-yellow-400 mr-2">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill={i < Math.floor(listing.rating) ? "currentColor" : "none"} stroke="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {listing.rating} ({listing.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      {listing.reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0 last:pb-0">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {review.user}
                            </h4>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {review.date}
                            </span>
                          </div>
                          <div className="flex text-yellow-400 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill={i < review.rating ? "currentColor" : "none"} stroke="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">
                            {review.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right column - Seller info and contact form */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {listing.title}
              </h2>
              
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400 mr-2">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill={i < Math.floor(listing.rating) ? "currentColor" : "none"} stroke="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-700 dark:text-gray-300">
                  {listing.rating} ({listing.reviewCount} reviews)
                </span>
              </div>
              
              {/* Price range */}
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                {listing.price}
              </div>
              
              {/* Seller info */}
              <div className="border-t border-b border-gray-200 dark:border-gray-700 py-6 mb-6">
                <div className="flex items-center mb-4">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4">
                    <Image
                      src={listing.seller.image}
                      alt={listing.seller.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {listing.seller.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Member since {listing.seller.memberSince}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  {listing.seller.responseTime}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {listing.seller.completedOrders} orders completed
                </p>
              </div>
              
              {/* Contact form */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Contact the Seller
                </h3>
                <Textarea
                  id="message"
                  label="Message"
                  placeholder="Describe what you're looking for, ask about pricing, or request more information..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  required
                />
                <Button
                  variant="primary"
                  onClick={handleContactSeller}
                  fullWidth
                  className="mt-4"
                >
                  Send Message
                </Button>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Free to contact. You'll only pay if you place an order.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 