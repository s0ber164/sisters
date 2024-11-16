import React, { useState } from 'react';
import Image from 'next/image';
import ProductModal from './ProductModal';

const ProductCard = ({ product, onAdd }) => {
  const [showModal, setShowModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Get the first image or use a placeholder
  const imageUrl = !imageError && product.images?.[0] 
    ? product.images[0] 
    : 'https://via.placeholder.com/300x400?text=No+Image';

  return (
    <>
      <div 
        className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl h-[32rem] flex flex-col cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        <div className="relative w-full pt-[133.33%]">
          <div className="absolute inset-0">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              onError={() => setImageError(true)}
              priority={false}
            />
          </div>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold text-primary-900 mb-3 line-clamp-2">{product.name}</h3>
          
          <div className="space-y-2 flex-grow">
            {/* Price with icon */}
            <div className="flex items-center text-gray-700">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <span className="font-medium">
                ${typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}
                <span className="text-sm text-gray-500 ml-1">per week</span>
              </span>
            </div>

            {/* Dimensions with icon */}
            <div className="flex items-center text-gray-700">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" 
                />
              </svg>
              <span className="text-sm line-clamp-1">{product.dimensions}</span>
            </div>

            {/* Quantity with icon */}
            <div className="flex items-center text-gray-700">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
                />
              </svg>
              <span className="text-sm">
                {product.quantity} available
              </span>
            </div>
          </div>

          <button 
            className="mt-4 w-full bg-primary-500 text-white py-2 rounded-md hover:bg-primary-600 transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              onAdd(product);
            }}
          >
            Request Quote
          </button>
        </div>
      </div>

      {showModal && (
        <ProductModal
          product={product}
          onClose={() => setShowModal(false)}
          onAdd={onAdd}
        />
      )}
    </>
  );
};

export default ProductCard;
