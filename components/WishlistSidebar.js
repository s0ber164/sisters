import React from 'react';
import Image from 'next/image';
import { useProducts } from '../context/ProductContext';

const WishlistSidebar = ({ isOpen, onClose }) => {
  const { selectedProducts, removeProduct } = useProducts();

  const totalItems = selectedProducts.length;
  const totalPrice = selectedProducts.reduce((sum, product) => sum + (product.price || 0), 0);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Your Wishlist</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Close wishlist"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-180px)] overflow-y-auto p-4">
          {selectedProducts.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
                />
              </svg>
              <p>Your wishlist is empty</p>
              <p className="text-sm mt-2">Add items by clicking "Add to List" on any product</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedProducts.map((product) => (
                <div key={product._id} className="flex gap-4 p-3 bg-white rounded-lg border">
                  {/* Product Image */}
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                      src={product.images?.[0] || "https://via.placeholder.com/80x80?text=No+Image"}
                      alt={product.name}
                      fill
                      className="object-cover rounded-md"
                      sizes="80px"
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-grow min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{product.dimensions}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-semibold">${product.price?.toFixed(2) || '0.00'}/week</span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeProduct(product)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    <svg className="w-5 h-5 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="flex justify-between mb-4">
            <span className="text-gray-600">Total Items:</span>
            <span className="font-medium">{totalItems}</span>
          </div>
          <div className="flex justify-between mb-4">
            <span className="text-gray-600">Total Price:</span>
            <span className="font-medium">${totalPrice.toFixed(2)}/week</span>
          </div>
          <div className="flex justify-between items-center border-t pt-4">
            <span className="text-lg font-medium">Total</span>
            <span className="text-lg font-bold">${totalPrice.toFixed(2)}/week</span>
          </div>
          <button
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selectedProducts.length === 0}
            onClick={() => {
              // Here you can implement the checkout or quote request logic
              alert('Request sent! We will contact you soon.');
              onClose();
            }}
          >
            Request Quote
          </button>
        </div>
      </div>
    </>
  );
};

export default WishlistSidebar;
