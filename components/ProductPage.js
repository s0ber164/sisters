import React from 'react';

const ProductPage = ({ product }) => {
  return (
    <div className="product-page">
      <h1>{product.name}</h1>
      <div className="image-carousel">
        {/* Image carousel will be implemented here */}
        <img src={product.image} alt={product.name} />
      </div>
      <p>Price: ${product.price}/week</p>
      <p>Dimensions: {product.dimensions}</p>
      <p>Available: {product.quantity}</p>
      <button>Add to List</button>
    </div>
  );
};

export default ProductPage;
