import { useState } from 'react';
import { BatchProcessor } from '../components/BatchProcessor';

export default function AdminPage() {
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Main admin content can go here */}
      <div className="space-y-8">
        {/* Other admin sections */}
        
        {/* REMBG Section */}
        <div className="mt-16 p-6 bg-gray-100 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">REMBG HERE</h2>
          <BatchProcessor />
        </div>
      </div>

      {/* Status Messages */}
      {message && (
        <div className="mt-4 p-4 rounded">
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}
