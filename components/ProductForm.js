import { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import CategorySelect from './CategorySelect';

export default function ProductForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    quantity: initialData?.quantity || '1',
    dimensions: initialData?.dimensions || '',
    category: initialData?.category || '',
    subcategories: initialData?.subcategories || [],
    images: initialData?.images || []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleCategoryChange = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      category: categoryId,
      subcategories: [] // Reset subcategories when category changes
    }));
  };

  const handleSubcategoriesChange = (subcategories) => {
    setFormData(prev => ({
      ...prev,
      subcategories
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (!formData.category) newErrors.category = 'Category is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to submit form. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Input */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Product Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Description Input */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      {/* Price Input */}
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          Price per Week
        </label>
        <div className="relative mt-1 rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            step="0.01"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 pl-7 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>
        {errors.price && (
          <p className="mt-1 text-sm text-red-600">{errors.price}</p>
        )}
      </div>

      {/* Quantity Input */}
      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
          Quantity
        </label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          min="1"
          value={formData.quantity}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        />
      </div>

      {/* Dimensions Input */}
      <div>
        <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700">
          Dimensions
        </label>
        <input
          type="text"
          id="dimensions"
          name="dimensions"
          value={formData.dimensions}
          onChange={handleChange}
          placeholder="e.g., 24"W x 36"H x 18"D"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        />
      </div>

      {/* Category Selection */}
      <div>
        <CategorySelect
          selectedCategory={formData.category}
          selectedSubcategories={formData.subcategories}
          onCategoryChange={handleCategoryChange}
          onSubcategoriesChange={handleSubcategoriesChange}
        />
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category}</p>
        )}
      </div>

      {/* Submit and Cancel Buttons */}
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Product'}
        </button>
      </div>

      {/* General Error Message */}
      {errors.submit && (
        <p className="mt-2 text-sm text-red-600">{errors.submit}</p>
      )}
    </form>
  );
}
