import React, { useState, useEffect } from 'react';
import { config } from '../utils/config';

const CategoryFilter = ({ onCategoryChange }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${config.baseUrl}/api/categories`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json().catch(() => ({ success: false }));
        if (!data.success) {
          throw new Error('Failed to fetch categories');
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

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm">
        Error loading categories. Please try again later.
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3 text-gray-700">Categories</h2>
      <div className="space-y-2">
        <button
          onClick={() => onCategoryChange('all')}
          className="w-full text-left px-3 py-2 rounded hover:bg-primary-50 transition-colors duration-150 text-gray-700 hover:text-primary-600"
        >
          All Categories
        </button>
        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => onCategoryChange(category._id)}
            className="w-full text-left px-3 py-2 rounded hover:bg-primary-50 transition-colors duration-150 text-gray-700 hover:text-primary-600"
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
