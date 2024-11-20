import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const ProductContext = createContext();

export const useProducts = () => {
  return useContext(ProductContext);
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load products from API on initial mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log('Fetching products from API...');
        const response = await fetch('/api/products');
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch products');
        }
        
        const { success, data } = await response.json();
        if (!success) {
          throw new Error('Failed to fetch products');
        }
        
        console.log('Products fetched successfully:', data.length);
        setProducts(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Load selected products from localStorage
  useEffect(() => {
    const savedSelectedProducts = localStorage.getItem('selectedProducts');
    if (savedSelectedProducts) {
      setSelectedProducts(JSON.parse(savedSelectedProducts));
    }
  }, []);

  // Save selected products to localStorage
  useEffect(() => {
    localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));
  }, [selectedProducts]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    
    const query = searchQuery.toLowerCase();
    return products.filter(product => 
      product.name?.toLowerCase().includes(query) ||
      product.dimensions?.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const uploadProducts = async (formData) => {
    setIsProcessing(true);
    setError(null);
    try {
      console.log('Uploading CSV file...');
      const response = await fetch('/api/products/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload products');
      }
      
      const result = await response.json();
      console.log('Products uploaded successfully:', result.count);
      
      // Refresh the products list
      const productsResponse = await fetch('/api/products');
      if (!productsResponse.ok) {
        throw new Error('Failed to fetch updated products');
      }
      const { success, data: updatedProducts } = await productsResponse.json();
      if (!success) {
        throw new Error('Failed to fetch updated products');
      }
      setProducts(updatedProducts);
      setError(null);
      return result;
    } catch (error) {
      console.error('Error uploading products:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const addProduct = (product) => {
    try {
      // Check if product is already in the list
      if (selectedProducts.some(p => p._id === product._id)) {
        console.log('Product already in list:', product.name);
        return;
      }
      
      // Add to selected products
      setSelectedProducts([...selectedProducts, product]);
      console.log('Added product to list:', product.name);
    } catch (error) {
      console.error('Error adding product to list:', error);
      throw new Error('Failed to add product to list');
    }
  };

  const removeProduct = (product) => {
    try {
      setSelectedProducts(selectedProducts.filter(p => p._id !== product._id));
      console.log('Removed product from list:', product.name);
    } catch (error) {
      console.error('Error removing product from list:', error);
      throw new Error('Failed to remove product from list');
    }
  };

  const updateProduct = async (productId, productData) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update product');
      }

      const updatedProduct = await response.json();
      setProducts(products.map(p => p._id === productId ? updatedProduct : p));
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const getProduct = async (productId) => {
    try {
      const response = await fetch(`/api/products/${productId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch product');
      }

      const product = await response.json();
      return product;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  };

  const deleteProduct = async (productId) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete product');
      }

      // Use _id consistently for both filters
      setProducts(products.filter(p => p._id !== productId));
      setSelectedProducts(selectedProducts.filter(p => p._id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const value = {
    products: filteredProducts,
    selectedProducts,
    isProcessing,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    uploadProducts,
    addProduct,
    removeProduct,
    deleteProduct,
    updateProduct,
    getProduct
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export default ProductContext;
