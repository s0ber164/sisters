import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import WishlistSidebar from '../components/WishlistSidebar';
import { useProducts } from '../context/ProductContext';

const Home = () => {
  const { products, addProduct, searchQuery, loading, error, selectedProducts } = useProducts();
  const [activeCategory, setActiveCategory] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  useEffect(() => {
    if (products) {
      const filtered = Array.isArray(products) ? products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (product.dimensions && product.dimensions.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesCategory = 
          activeCategory === 'all' || 
          product.category?._id === activeCategory || 
          product.category === activeCategory ||
          (product.subcategories && product.subcategories.some(sub => 
            sub._id === activeCategory || sub === activeCategory
          ));
        
        return matchesSearch && matchesCategory;
      }) : [];
      setFilteredProducts(filtered);
    }
  }, [products, searchQuery, activeCategory]);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-primary-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center text-red-600 p-4 rounded-lg bg-white shadow-lg">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50">
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
                className="flex items-center space-x-2 px-4 py-2 bg-primary-100 rounded-lg hover:bg-primary-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <span className="font-medium">Wishlist ({selectedProducts.length})</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-[500px] bg-primary-900">
        <img
          src="/C5D1A4EF-80F3-466B-BE7C-15A9A62FCBDC_1_105_c.JPEG"
          alt="SIS Props Hero Image"
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/50 to-transparent">
          <div className="container mx-auto px-4 h-full flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white max-w-2xl">
              Premium Props for Your Production
            </h2>
            <p className="mt-4 text-xl text-white/90 max-w-xl">
              Discover our extensive collection of high-quality furniture and props 
              for film, television, and theatrical productions.
            </p>
            <div className="mt-8 max-w-2xl w-full bg-white/10 backdrop-blur-md rounded-lg p-2">
              <SearchBar />
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
          <div className="w-full md:w-auto">
            <h2 className="text-3xl font-bold text-primary-900 mb-4">
              Available Props {filteredProducts.length > 0 && `(${filteredProducts.length})`}
            </h2>
            <CategoryFilter 
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
              className="w-full md:w-auto"
            />
          </div>
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="text-center text-primary-600 mt-8">
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

      {/* Wishlist Sidebar */}
      <WishlistSidebar 
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
      />
    </div>
  );
};

export default Home;
