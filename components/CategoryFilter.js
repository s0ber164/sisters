import React, { useState } from 'react';
import { useCategories } from '../context/CategoryContext';

const CategoryFilter = ({ activeCategory, onCategoryChange }) => {
  const { categories, getSubcategories } = useCategories();
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  
  const mainCategories = [
    { id: 'all', name: 'All' },
    ...(categories?.filter(cat => !cat.parent) || [])
  ];

  const handleMainCategoryClick = (category) => {
    if (category.id === 'all') {
      setSelectedMainCategory(null);
      onCategoryChange('all');
      return;
    }

    if (selectedMainCategory === category._id) {
      setSelectedMainCategory(null);
      onCategoryChange('all');
    } else {
      setSelectedMainCategory(category._id);
      onCategoryChange(category._id);
    }
  };

  const subcategories = selectedMainCategory ? getSubcategories(selectedMainCategory) : [];

  return (
    <div className="mb-8 space-y-4">
      {/* Main Categories */}
      <div className="flex flex-wrap gap-2">
        {mainCategories.map((category) => (
          <button
            key={category.id || category._id}
            onClick={() => handleMainCategoryClick(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${(activeCategory === (category.id || category._id) || selectedMainCategory === category._id)
                ? 'bg-primary-600 text-white'
                : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
              }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Subcategories */}
      {subcategories.length > 0 && (
        <div className="flex flex-wrap gap-2 pl-4 border-l-2 border-primary-200">
          {subcategories.map((subcategory) => (
            <button
              key={subcategory._id}
              onClick={() => onCategoryChange(subcategory._id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                ${activeCategory === subcategory._id
                  ? 'bg-primary-500 text-white'
                  : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                }`}
            >
              {subcategory.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;
