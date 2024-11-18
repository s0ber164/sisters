import { useState } from 'react';
import { ProductUploader } from '../components/ProductUploader';

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Product Upload Section */}
      <div className="bg-gray-100 rounded-lg p-6">
        <ProductUploader />
      </div>
    </div>
  );
}
