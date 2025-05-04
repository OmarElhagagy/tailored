import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaStar, FaShoppingBag } from 'react-icons/fa';

const SellerSpotlight = ({ seller }) => {
  if (!seller) {
    return null;
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
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
        <h3 className="text-2xl font-bold mb-2">{seller.businessName}</h3>
        {seller.rating && (
          <div className="mb-2">
            {renderStarRating(seller.rating.average)}
            <span className="text-white ml-2">
              {seller.rating.count} verified reviews
            </span>
          </div>
        )}
        <p className="text-white/90">
          {seller.businessDescription || 'No description available'}
        </p>
        <Link href={`/sellers/${seller._id}`} legacyBehavior>
          <a className="inline-block mt-4 bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded font-medium">
            Visit Tailor Profile
          </a>
        </Link>
      </div>

      {seller.featuredProducts && seller.featuredProducts.length > 0 && (
        <div className="p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <FaShoppingBag className="mr-2 text-blue-600" />
            Featured Products
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {seller.featuredProducts.map((product) => (
              <Link
                href={`/sellers/${seller._id}/products/${product._id}`}
                key={product._id}
                legacyBehavior
              >
                <a className="group block bg-gray-50 hover:bg-gray-100 rounded-lg overflow-hidden transition-colors duration-300">
                  <div className="aspect-square relative">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.title}
                        layout="fill"
                        objectFit="cover"
                        className="group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300?text=Product';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h5 className="font-medium text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-300">
                      {product.title}
                    </h5>
                    <p className="text-blue-600 font-semibold">${product.price.toFixed(2)}</p>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerSpotlight; 