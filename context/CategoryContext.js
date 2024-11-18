import { createContext, useContext, useState, useEffect } from 'react';

const CategoryContext = createContext();

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data);
        setError(null);
      } else {
        setError('Failed to fetch categories');
      }
    } catch (err) {
      setError('Error loading categories');
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (categoryData) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });
      const data = await response.json();
      
      if (data.success) {
        await fetchCategories(); // Refresh the categories list
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to add category');
      }
    } catch (err) {
      console.error('Error adding category:', err);
      throw err;
    }
  };

  const updateCategory = async (categoryId, categoryData) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });
      const data = await response.json();
      
      if (data.success) {
        await fetchCategories(); // Refresh the categories list
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to update category');
      }
    } catch (err) {
      console.error('Error updating category:', err);
      throw err;
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        await fetchCategories(); // Refresh the categories list
        return true;
      } else {
        throw new Error(data.error || 'Failed to delete category');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      throw err;
    }
  };

  // Get subcategories for a given category ID
  const getSubcategories = (categoryId) => {
    return categories.filter(cat => cat.parent === categoryId);
  };

  // Get main categories (those without a parent)
  const getMainCategories = () => {
    return categories.filter(cat => !cat.parent);
  };

  // Get category by ID
  const getCategoryById = (categoryId) => {
    return categories.find(cat => cat._id === categoryId);
  };

  const value = {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    getSubcategories,
    getMainCategories,
    getCategoryById,
    refreshCategories: fetchCategories,
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
}
