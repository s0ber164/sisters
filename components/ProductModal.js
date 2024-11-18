import React from 'react';
import Image from 'next/image';

const ProductModal = ({ product, onClose, onAddOrRemove, isSelected }) => {
  // Helper function to get the full image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "https://via.placeholder.com/800x800?text=No+Image";
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${window.location.origin}${imageUrl}`;
  };

  // Prevent clicks inside the modal from closing it
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={handleModalClick}
      >
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image section */}
            <div className="relative w-full pt-[100%]">
              <Image
                src={getImageUrl(product.images?.[0])}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Product details section */}
            <div className="p-6 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
              
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">Quantity:</span> {product.quantity}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Dimensions:</span> {product.dimensions || 'N/A'}
                </p>
                {product.description && (
                  <p className="text-gray-600">
                    <span className="font-medium">Description:</span><br />
                    {product.description}
                  </p>
                )}
              </div>

              <button
                onClick={onAddOrRemove}
                className={`mt-4 px-6 py-2 rounded-md font-medium transition-colors ${
                  isSelected
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isSelected ? 'Remove from Selection' : 'Add to Selection'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
