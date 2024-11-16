import React, { useState } from 'react';
import ProductModal from './ProductModal';

const ProductCard = ({ product, onAdd }) => {
  const [showModal, setShowModal] = useState(false);
  // Get the first image or use a placeholder
  const imageUrl = product.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image';

  return (
    <>
      <div 
        className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl h-[32rem] flex flex-col cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        <div className="relative h-48 flex-shrink-0">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x200?text=Image+Error';
            }}
          />
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
                  d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" 
                />
              </svg>
              <span className="text-sm">{product.quantity} available</span>
            </div>
          </div>

          <button
            onClick={() => onAdd(product)}
            className="w-full mt-4 bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600 transition-colors duration-200 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
              />
            </svg>
            Add to List
          </button>
        </div>
      </div>

      {/* Product Modal */}
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
