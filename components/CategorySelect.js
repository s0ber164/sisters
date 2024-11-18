import { useState, useEffect } from 'react';
import { useCategories } from '../context/CategoryContext';

export default function CategorySelect({ 
  selectedCategory, 
  selectedSubcategories = [], 
  onCategoryChange, 
  onSubcategoriesChange 
}) {
  const { categories, getMainCategories, getSubcategories } = useCategories();
  const [mainCategories, setMainCategories] = useState([]);
  const [availableSubcategories, setAvailableSubcategories] = useState([]);

  useEffect(() => {
    setMainCategories(getMainCategories());
  }, [categories, getMainCategories]);

  useEffect(() => {
    if (selectedCategory) {
      setAvailableSubcategories(getSubcategories(selectedCategory));
    } else {
      setAvailableSubcategories([]);
    }
  }, [selectedCategory, categories, getSubcategories]);

  const handleMainCategoryChange = (e) => {
    const categoryId = e.target.value;
    onCategoryChange(categoryId);
    onSubcategoriesChange([]); // Reset subcategories when main category changes
  };

  const handleSubcategoryChange = (subcategoryId) => {
    const updatedSubcategories = selectedSubcategories.includes(subcategoryId)
      ? selectedSubcategories.filter(id => id !== subcategoryId)
      : [...selectedSubcategories, subcategoryId];
    onSubcategoriesChange(updatedSubcategories);
  };

  return (
    <div className="space-y-4">
      {/* Main Category Select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          value={selectedCategory || ''}
          onChange={handleMainCategoryChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
        >
          <option value="">Select a category</option>
          {mainCategories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Subcategories Checkboxes */}
      {selectedCategory && availableSubcategories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subcategories
          </label>
          <div className="space-y-2">
            {availableSubcategories.map((subcategory) => (
              <div key={subcategory._id} className="flex items-center">
                <input
                  type="checkbox"
                  id={subcategory._id}
                  checked={selectedSubcategories.includes(subcategory._id)}
                  onChange={() => handleSubcategoryChange(subcategory._id)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  htmlFor={subcategory._id}
                  className="ml-2 block text-sm text-gray-900"
                >
                  {subcategory.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
