import { useState } from 'react';

export function ProductUploader() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setError('');
    } else {
      setFile(null);
      setError('Please select a CSV file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a CSV file');
      return;
    }

    setIsUploading(true);
    setMessage('');
    setProgress('Uploading and processing products...');
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/products/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error uploading products');
      }

      setMessage(`Successfully processed ${data.count} products with their images!`);
      setProgress('');
      setFile(null);
      // Reset file input
      e.target.reset();
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'Error uploading products');
      setProgress('');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Upload Products</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product CSV File
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            disabled={isUploading}
          />
          <p className="mt-1 text-sm text-gray-500">
            Upload a CSV file with product details including image URLs. All product images will automatically have backgrounds removed.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Required CSV columns: name, description, price, image_url (can contain multiple URLs separated by commas)
          </p>
        </div>

        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}

        {progress && (
          <div className="text-blue-500 text-sm mt-2">
            {progress}
          </div>
        )}

        {message && (
          <div className="text-green-500 text-sm mt-2">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={!file || isUploading}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${!file || isUploading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isUploading ? 'Processing...' : 'Upload Products'}
        </button>
      </form>
    </div>
  );
}
