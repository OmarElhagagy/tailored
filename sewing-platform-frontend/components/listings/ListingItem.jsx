import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '@/src/utils/formatters';

const ListingItem = ({ listing }) => {
  const {
    _id,
    title,
    description,
    price,
    mainPhoto,
    rating,
    status,
    category,
    customizable,
    tags
  } = listing;

  // Determine status badge
  const statusBadge = () => {
    switch (status) {
      case 'active':
        return null; // No badge for active listings
      case 'sold':
        return (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            Sold
          </div>
        );
      case 'inactive':
        return (
          <div className="absolute top-2 right-2 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded">
            Inactive
          </div>
        );
      default:
        return null;
    }
  };

  // Format the description to limit length
  const truncatedDescription = description.length > 100
    ? `${description.substring(0, 100)}...`
    : description;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col">
      <div className="relative h-48">
        <Image
          src={mainPhoto || '/images/placeholder.jpg'}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {statusBadge()}
        {customizable && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
            Customizable
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-1">
          <span className="text-sm text-gray-500 dark:text-gray-400">{category}</span>
        </div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          {title}
        </h3>

        {rating && (
          <div className="flex items-center mb-3">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill={i < Math.floor(rating.average) ? "currentColor" : "none"}
                  stroke="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">
              ({rating.count})
            </span>
          </div>
        )}

        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm line-clamp-3 flex-grow">
          {truncatedDescription}
        </p>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-2 py-0.5 text-xs"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-2 py-0.5 text-xs">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(price)}
            </div>
            <Link
              href={`/listings/${_id}`}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
            >
              View Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingItem; 