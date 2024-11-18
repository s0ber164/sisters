import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import WishlistSidebar from '../components/WishlistSidebar';
import ImageProcessor from '../components/ImageProcessor';
import BatchProcessor from '../components/BatchProcessor';
import { useProducts } from '../context/ProductContext';

const Home = () => {
  const { products, addProduct, searchQuery, loading, error, selectedProducts } = useProducts();
  const [activeCategory, setActiveCategory] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isImageProcessorOpen, setIsImageProcessorOpen] = useState(false);
  const [isBatchProcessorOpen, setIsBatchProcessorOpen] = useState(false);

  useEffect(() => {
    if (products) {
      const filtered = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.dimensions.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'all' || product.category?.toLowerCase() === activeCategory;
        return matchesSearch && matchesCategory;
      });
      setFilteredProducts(filtered);
    }
  }, [products, searchQuery, activeCategory]);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  if (error) {
    return <div className="text-center text-red-600 mt-8">Error loading products: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>SIS Props - Product Catalog</title>
        <meta name="description" content="Browse our collection of props for film and theater" />
      </Head>

      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl text-primary-900 font-libre">
              <span className="font-bold">SIS</span>{' '}
              <span className="font-normal">PROPS</span>
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsWishlistOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <span className="font-medium">Wishlist ({selectedProducts.length})</span>
              </button>
              <a
                href="/admin/products"
                className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Manage Products
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-[500px] bg-gray-900">
        <img
          src="https://images.unsplash.com/photo-1618220179428-22790b461013?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
          alt="Vintage Furniture Collection"
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent">
          <div className="container mx-auto px-4 h-full flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white max-w-2xl">
              Premium Props for Your Production
            </h2>
            <p className="mt-4 text-xl text-white/90 max-w-xl">
              Discover our extensive collection of high-quality furniture and props 
              for film, television, and theatrical productions.
            </p>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-primary-900">
            Available Props
          </h2>
          <div className="flex space-x-4">
            <button
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              onClick={() => setIsImageProcessorOpen(true)}
            >
              Process Single Image
            </button>
            <button
              className="px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-500"
              onClick={() => setIsBatchProcessorOpen(true)}
            >
              Process Batch (CSV)
            </button>
          </div>
        </div>
        
        <CategoryFilter 
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />

        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center text-gray-600 mt-8">
            <p>No products found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product._id} className="w-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Image Processing Modal */}
      {isImageProcessorOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-lg w-full mx-4">
            <div className="flex justify-end p-2">
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsImageProcessorOpen(false)}
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ImageProcessor
              onImageProcessed={(url) => {
                setIsImageProcessorOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Batch Processing Modal */}
      {isBatchProcessorOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-lg w-full mx-4">
            <div className="flex justify-end p-2">
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsBatchProcessorOpen(false)}
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <BatchProcessor
              onBatchProcessed={(result) => {
                setIsBatchProcessorOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Wishlist Sidebar */}
      <WishlistSidebar 
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
      />
    </div>
  );
};

export default Home;
