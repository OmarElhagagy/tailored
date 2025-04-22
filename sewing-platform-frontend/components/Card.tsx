import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface CardProps {
  title: string;
  description: string;
  imageSrc?: string;
  rating?: number;
  reviewCount?: number;
  price?: string;
  linkHref: string;
  linkText: string;
  tags?: string[];
  highlightTag?: string;
}

const Card: React.FC<CardProps> = ({
  title,
  description,
  imageSrc,
  rating,
  reviewCount,
  price,
  linkHref,
  linkText,
  tags,
  highlightTag
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      {imageSrc && (
        <div className="relative h-48">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover"
          />
          {highlightTag && (
            <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
              {highlightTag}
            </div>
          )}
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
          {title}
        </h3>
        
        {rating !== undefined && (
          <div className="flex items-center mb-3">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <svg 
                  key={i} 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  viewBox="0 0 20 20" 
                  fill={i < Math.floor(rating) ? "currentColor" : "none"}
                  stroke="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            {reviewCount !== undefined && (
              <span className="ml-2 text-gray-600 dark:text-gray-300">
                ({reviewCount} reviews)
              </span>
            )}
          </div>
        )}
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {description}
        </p>
        
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag, index) => (
              <span 
                key={index} 
                className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full px-3 py-1 text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {price && (
          <div className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            {price}
          </div>
        )}
        
        <Link
          href={linkHref}
          className="block text-center w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
        >
          {linkText}
        </Link>
      </div>
    </div>
  );
};

export default Card; 