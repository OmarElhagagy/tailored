import React from 'react';
import Link from 'next/link';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';

const FeaturedSellers = ({ sellers, loading }) => {
  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((item) => (
          <div key={item} className="animate-pulse bg-gray-100 rounded-lg p-6 h-64"></div>
        ))}
      </div>
    );
  }

  if (!sellers || sellers.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No featured tailors available at the moment.</p>
      </div>
    );
  }

  const renderStarRating = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`mr-1 ${
              star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {sellers.map((seller) => (
        <Link href={`/sellers/${seller._id}`} key={seller._id} legacyBehavior>
          <a className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="p-6">
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-3">
                  {seller.businessName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{seller.businessName}</h3>
                  {seller.location && (
                    <div className="text-gray-500 text-sm flex items-center mt-1">
                      <FaMapMarkerAlt className="mr-1" />
                      {seller.location.city}, {seller.location.country}
                    </div>
                  )}
                </div>
              </div>
              
              {seller.rating && (
                <div className="mb-3">
                  {renderStarRating(seller.rating.average)}
                  <span className="text-sm text-gray-500 ml-2">
                    {seller.rating.count} reviews
                  </span>
                </div>
              )}
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {seller.businessDescription || 'No description available'}
              </p>
              
              {seller.specialties && seller.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {seller.specialties.slice(0, 3).map((specialty, index) => (
                    <span
                      key={index}
                      className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded"
                    >
                      {specialty}
                    </span>
                  ))}
                  {seller.specialties.length > 3 && (
                    <span className="inline-block text-xs px-2 py-1 text-gray-500">
                      +{seller.specialties.length - 3} more
                    </span>
                  )}
                </div>
              )}
              
              <div className="text-blue-600 text-sm font-medium hover:underline">
                View Tailor Profile →
              </div>
            </div>
          </a>
        </Link>
      ))}
    </div>
  );
};

export default FeaturedSellers; 