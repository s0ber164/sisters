import { useState, useEffect } from 'react';
import { useCategories } from '../../../context/CategoryContext';
import AdminLayout from '../../../components/AdminLayout';

export default function Categories() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const [newCategory, setNewCategory] = useState({ name: '', parent: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState(null);

  const mainCategories = categories.filter(cat => !cat.parent);
  const subCategories = categories.filter(cat => cat.parent);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory(editingCategory._id, newCategory);
        setEditingCategory(null);
      } else {
        await addCategory(newCategory);
      }
      setNewCategory({ name: '', parent: '' });
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      parent: category.parent || ''
    });
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(categoryId);
        setError(null);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Category Management
            </h2>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Category Form */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Category Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="parent" className="block text-sm font-medium text-gray-700">
                  Parent Category (Optional)
                </label>
                <select
                  id="parent"
                  value={newCategory.parent}
                  onChange={(e) => setNewCategory({ ...newCategory, parent: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="">None (Main Category)</option>
                  {mainCategories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end">
                {editingCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(null);
                      setNewCategory({ name: '', parent: '' });
                    }}
                    className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Categories List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Main Categories</h3>
            <div className="space-y-4">
              {mainCategories.map((category) => (
                <div key={category._id} className="flex items-center justify-between border-b pb-2">
                  <span className="text-gray-900">{category.name}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="text-lg font-medium text-gray-900 mt-8 mb-4">Subcategories</h3>
            <div className="space-y-4">
              {subCategories.map((category) => {
                const parentCategory = categories.find(c => c._id === category.parent);
                return (
                  <div key={category._id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <span className="text-gray-900">{category.name}</span>
                      <span className="text-gray-500 text-sm ml-2">
                        (under {parentCategory?.name})
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
