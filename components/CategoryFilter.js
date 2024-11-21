import React, { useState, useEffect } from 'react';

const CategoryFilter = ({ onCategoryChange }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Categories response:', data); // Debug log

        if (!data.success || !Array.isArray(data.data)) {
          throw new Error('Invalid response format');
        }

        setCategories(data.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    onCategoryChange(categoryId);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm p-4 bg-red-50 rounded-lg">
        <p>Error loading categories: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="text-red-600 hover:text-red-700 underline mt-2"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!categories.length) {
    return (
      <div className="text-gray-500 text-sm p-4 bg-gray-50 rounded-lg">
        No categories available
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3 text-gray-700">Categories</h2>
      <div className="space-y-2">
        <button
          onClick={() => handleCategoryClick('all')}
          className={`w-full text-left px-3 py-2 rounded transition-colors duration-150 ${
            selectedCategory === 'all'
              ? 'bg-primary-50 text-primary-600'
              : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
          }`}
        >
          All Categories
        </button>
        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => handleCategoryClick(category._id)}
            className={`w-full text-left px-3 py-2 rounded transition-colors duration-150 ${
              selectedCategory === category._id
                ? 'bg-primary-50 text-primary-600'
                : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
