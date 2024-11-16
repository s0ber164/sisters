import React from 'react';
import ImageCarousel from './ImageCarousel';

const ProductModal = ({ product, onClose, onAdd, isSelected }) => {
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

          <ImageCarousel images={product.images} />
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Details</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="font-medium text-gray-700">Price</dt>
                  <dd className="text-gray-900">${typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700">Dimensions</dt>
                  <dd className="text-gray-900">{product.dimensions || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700">Quantity Available</dt>
                  <dd className="text-gray-900">{product.quantity}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700">Category</dt>
                  <dd className="text-gray-900 capitalize">{product.category || 'N/A'}</dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700">{product.description || 'No description available.'}</p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={() => {
                onAdd(product);
                onClose();
              }}
              className={`px-6 py-2 rounded-md transition-colors
                ${isSelected 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
              {isSelected ? 'Remove from List' : 'Add to List'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
