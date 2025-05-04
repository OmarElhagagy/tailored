import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const PopularCategories = ({ categories, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="animate-pulse bg-gray-100 rounded-lg p-6 h-40"></div>
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No categories available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {categories.map((category) => (
        <Link href={`/products?category=${category.name}`} key={category.id} legacyBehavior>
          <a className="group relative block aspect-square overflow-hidden rounded-lg">
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/0 z-10"></div>
            
            {/* Image with fallback */}
            <div className="w-full h-full relative">
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  layout="fill"
                  objectFit="cover"
                  className="group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300?text=' + category.name;
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-400">{category.name}</span>
                </div>
              )}
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20 text-white">
              <h3 className="font-medium text-lg">{category.name}</h3>
              <p className="text-sm text-white/80">{category.count} items</p>
            </div>
          </a>
        </Link>
      ))}
    </div>
  );
};

export default PopularCategories; 