import { useState } from 'react';
import { useRouter } from 'next/router';
import { useProducts } from '../../../context/ProductContext';
import ProductForm from '../../../components/ProductForm';
import AdminLayout from '../../../components/AdminLayout';

export default function AddProduct() {
  const router = useRouter();
  const { addProduct } = useProducts();
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    try {
      await addProduct(formData);
      router.push('/admin/dashboard');
    } catch (err) {
      setError('Failed to add product. Please try again.');
      console.error('Error adding product:', err);
    }
  };

  const handleCancel = () => {
    router.push('/admin/dashboard');
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Add New Product
            </h2>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <ProductForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
