import React, { useState } from 'react';
import Image from 'next/image';
import ProductModal from './ProductModal';
import { useProducts } from '../context/ProductContext';

const ProductCard = ({ product }) => {
  const [showModal, setShowModal] = useState(false);
  const { addProduct, removeProduct, selectedProducts } = useProducts();
  
  const isSelected = selectedProducts.some(p => p._id === product._id);

  const handleAddOrRemove = () => {
    if (isSelected) {
      removeProduct(product);
    } else {
      addProduct(product);
    }
  };

  // Helper function to get the full image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "/placeholder-image.png";
    if (imageUrl.startsWith('http')) return imageUrl;
    // For local files (processed images), ensure they're served from the correct path
    return imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  };

  // Get the first valid image URL
  const imageUrl = product.images && product.images.length > 0 
    ? getImageUrl(product.images[0])
    : "/placeholder-image.png";

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden w-full max-w-sm">
        {/* Image container with 1:1 aspect ratio - clickable */}
        <div 
          className="relative w-full pt-[100%] cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => setShowModal(true)}
        >
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        
        {/* Product info section */}
        <div className="p-4 space-y-3">
          <h3 className="text-lg font-semibold text-primary-800 truncate">{product.name}</h3>
          
          {/* Product details grid */}
          <div className="grid grid-cols-2 gap-2 text-sm text-primary-600">
            <div>
              <span className="font-medium">Quantity:</span>
              <span className="ml-1">{product.quantity}</span>
            </div>
            <div className="col-span-2">
              <span className="font-medium">Dimensions:</span>
              <span className="ml-1">{product.dimensions || 'N/A'}</span>
            </div>
          </div>

          <div className="mt-2">
            <p className="text-lg font-semibold text-primary-900">
              ${typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}{' '}
              <span className="text-sm font-normal text-primary-600">per week</span>
            </p>
          </div>

          {/* Add/Remove from List button */}
          <button 
            className={`w-full mt-4 py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2
              ${isSelected 
                ? 'bg-primary-700 hover:bg-primary-800 text-white' 
                : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
            onClick={handleAddOrRemove}
          >
            <span>{isSelected ? 'Remove from List' : 'Add to List'}</span>
          </button>
        </div>
      </div>

      {/* Product Modal */}
      {showModal && (
        <ProductModal
          product={product}
          onClose={() => setShowModal(false)}
          onAdd={handleAddOrRemove}
          isSelected={isSelected}
        />
      )}
    </>
  );
};

export default ProductCard;
