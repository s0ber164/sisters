import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import QuoteRequestForm from './QuoteRequestForm';

const WishlistPanel = () => {
  const { selectedProducts, removeProduct } = useProducts();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  const totalItems = selectedProducts.length;

  if (totalItems === 0) return null;

  const handleQuoteRequest = () => {
    setIsExpanded(true);
    setShowQuoteForm(true);
  };

  return (
    <>
      {/* Quote Request Form Modal */}
      {showQuoteForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowQuoteForm(false)}
            ></div>

            <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg relative">
              <QuoteRequestForm onClose={() => setShowQuoteForm(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Wishlist Panel */}
      <div className={`fixed bottom-0 right-0 w-96 bg-white shadow-lg transition-transform duration-300 transform ${
        isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-3.5rem)]'
      } z-40`}>
        {/* Header */}
        <div 
          className="p-4 bg-primary-600 text-white cursor-pointer flex justify-between items-center"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
            <span className="font-medium">Wishlist ({totalItems})</span>
          </div>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Content */}
        <div className="max-h-[400px] overflow-y-auto">
          {selectedProducts.map((product) => (
            <div 
              key={product._id} 
              className="p-4 border-b flex justify-between items-center"
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500">${product.price}/week</p>
                </div>
              </div>
              <button
                onClick={() => removeProduct(product)}
                className="text-red-500 hover:text-red-700"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Footer with Quote Button */}
        <div className="p-4 bg-gray-50 border-t">
          <button 
            onClick={handleQuoteRequest}
            className="w-full py-2 px-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            Request Quote
          </button>
        </div>
      </div>
    </>
  );
};

export default WishlistPanel;
