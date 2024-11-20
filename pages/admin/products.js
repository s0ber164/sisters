import React, { useState, useEffect } from 'react';
import { useProducts } from '../../context/ProductContext';
import Image from 'next/image';
import AdminLayout from '../../components/AdminLayout';
import SearchBar from '../../components/SearchBar';
import { Box, Typography, Button, Card, CardContent, CardActions, Grid, Paper } from '@mui/material';

const AdminProducts = () => {
  const { products, loading, error } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    dimensions: '',
    quantity: '',
    images: []
  });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  if (loading) {
    return (
      <AdminLayout>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Loading products...
          </Typography>
        </Box>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom color="error">
            Error loading products
          </Typography>
          <Typography color="error">{error}</Typography>
        </Box>
      </AdminLayout>
    );
  }

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      dimensions: product.dimensions,
      quantity: product.quantity,
      images: product.images || []
    });
    setEditMode(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          window.location.reload();
        } else {
          alert('Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/products/${selectedProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (response.ok) {
        setEditMode(false);
        setSelectedProduct(null);
        window.location.reload();
      } else {
        alert(data.error || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product: ' + error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'quantity' ? Number(value) : value
    }));
  };

  const handleAddImage = () => {
    if (newImageUrl && newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()]
      }));
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);
      const response = await fetch('/api/products/export');
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      // Get the CSV content
      const blob = await response.blob();
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'products.csv';
      
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export products');
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('⚠️ WARNING: This will permanently delete ALL products. Are you absolutely sure?')) {
      return;
    }
    
    if (!window.confirm('⚠️ FINAL WARNING: This action CANNOT be undone. Do you really want to delete ALL products?')) {
      return;
    }

    try {
      setDeleteLoading(true);
      const response = await fetch('/api/products/delete-all', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete products');
      }

      const result = await response.json();
      alert(`Successfully deleted ${result.deletedCount} products`);
      window.location.reload();
    } catch (error) {
      console.error('Error deleting all products:', error);
      alert('Failed to delete products');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Products
          </Typography>
          <Box sx={{ my: 3, maxWidth: 600 }}>
            <SearchBar />
          </Box>
          <Box sx={{ mt: 2, mb: 3 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleExport} 
              disabled={exportLoading}
              sx={{ mr: 2 }}
            >
              {exportLoading ? 'Exporting...' : 'Export Products'}
            </Button>
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleDeleteAll} 
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete All Products'}
            </Button>
          </Box>
        </Box>

        {editMode ? (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Edit Product</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dimensions</label>
                <input
                  type="text"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
                <div className="space-y-2">
                  {formData.images.map((url, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="relative w-16 h-16">
                        <Image
                          src={url}
                          alt={`Product image ${index + 1}`}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <input
                        type="text"
                        value={url}
                        readOnly
                        className="flex-1 rounded-md border-gray-300 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="Enter image URL"
                      className="flex-1 rounded-md border-gray-300 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddImage}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Add Image
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setSelectedProduct(null);
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        ) : (
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                <Card>
                  <Box sx={{ position: 'relative', pt: '100%' }}>
                    {product.images && product.images[0] && (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        layout="fill"
                        objectFit="cover"
                      />
                    )}
                  </Box>
                  <CardContent>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {product.name}
                    </Typography>
                    <Typography color="text.secondary" gutterBottom>
                      Price: ${product.price}
                    </Typography>
                    {product.dimensions && (
                      <Typography color="text.secondary" gutterBottom>
                        Dimensions: {product.dimensions}
                      </Typography>
                    )}
                    <Typography color="text.secondary">
                      Quantity: {product.quantity}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => handleEdit(product)}>
                      Edit
                    </Button>
                    <Button size="small" color="error" onClick={() => handleDelete(product._id)}>
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </AdminLayout>
  );
};

export default AdminProducts;
