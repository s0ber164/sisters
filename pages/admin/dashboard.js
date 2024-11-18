import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ProductUploader } from '../../components/ProductUploader';

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/admin');
    } catch (error) {
      console.error('Logout error:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Admin Dashboard - SIS Props</title>
      </Head>

      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                {isLoading ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Products</h2>
            <ProductUploader />
            <div className="mt-6 border-t pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Product Management</h3>
                  <p className="text-sm text-gray-500">View, edit, or delete your existing products</p>
                </div>
                <a
                  href="/admin/products"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Manage Products
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
