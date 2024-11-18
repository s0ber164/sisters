import React from 'react';
import { useCategories } from '../context/CategoryContext';

const CategoryFilter = ({ activeCategory, onCategoryChange }) => {
  const { categories } = useCategories();
  const mainCategories = [
    { id: 'all', name: 'All' },
    ...(categories?.filter(cat => !cat.parent) || [])
  ];

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2">
        {mainCategories.map((category) => (
          <button
            key={category.id || category._id}
            onClick={() => onCategoryChange(category.id || category._id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${activeCategory === (category.id || category._id)
                ? 'bg-primary-600 text-white'
                : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
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
