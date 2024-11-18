import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import QuoteRequestModal from './QuoteRequestModal';

export default function WishlistSidebar({ isOpen, onClose }) {
  const { selectedProducts, removeProduct } = useProducts();
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const totalItems = selectedProducts.length;
  const totalPrice = selectedProducts.reduce((sum, product) => sum + product.price, 0);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-primary-900 bg-opacity-50 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-primary-900">Selected Items</h2>
              <button onClick={onClose} className="text-primary-400 hover:text-primary-500">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4">
            {selectedProducts.length === 0 ? (
              <p className="text-primary-500 text-center">No items selected</p>
            ) : (
              <div className="space-y-4">
                {selectedProducts.map((product) => (
                  <div key={product._id} className="flex items-center space-x-4 bg-primary-50 p-3 rounded-lg">
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-20 h-20 bg-primary-200 rounded-md overflow-hidden">
                      <img
                        src={product.images?.[0] || '/placeholder.png'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-grow min-w-0">
                      <h3 className="font-medium text-primary-900 truncate">{product.name}</h3>
                      <p className="text-sm text-primary-500 truncate">{product.dimensions}</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-primary-600">Price:</span>
                        <span className="font-semibold">${product.price?.toFixed(2) || '0.00'}/week</span>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeProduct(product)}
                      className="flex-shrink-0 text-primary-500 hover:text-primary-600"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary and Actions */}
          <div className="border-t p-4 bg-primary-50">
            <div className="space-y-4">
              <div className="flex justify-between mb-4">
                <span className="text-primary-600">Total Items:</span>
                <span className="font-medium">{totalItems}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-4">
                <span className="text-lg font-medium text-primary-900">Total</span>
                <span className="text-lg font-bold text-primary-900">${totalPrice.toFixed(2)}/week</span>
              </div>
              <button
                className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={selectedProducts.length === 0}
                onClick={() => setShowQuoteModal(true)}
              >
                Request Quote
              </button>
            </div>
          </div>
        </div>
      </div>

      <QuoteRequestModal 
        isOpen={showQuoteModal} 
        onClose={() => setShowQuoteModal(false)} 
      />
    </>
  );
}
