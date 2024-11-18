import { useState } from 'react';

export const BatchProcessor = ({ onBatchProcessed }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processedImages, setProcessedImages] = useState([]);
  const [progress, setProgress] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setError('File size must be less than 50MB');
        return;
      }
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setError('Please select a CSV file');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setProcessedImages([]);
      setProgress('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    setProgress('Starting batch processing...');

    try {
      if (!selectedFile) {
        throw new Error('Please select a CSV file');
      }

      const formData = new FormData();
      formData.append('csv', selectedFile, selectedFile.name);

      setProgress('Uploading CSV file...');
      console.log('Uploading file:', selectedFile.name);
      
      const response = await fetch('/api/process-rembg', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('API Response:', result);
      
      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to process batch');
      }

      setProcessedImages(result.processed || []);
      setProgress('Processing complete!');
      
      if (onBatchProcessed) {
        onBatchProcessed(result);
      }
    } catch (error) {
      console.error('Processing error:', error);
      setError(error.message || 'Failed to process images');
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Batch Image Processing</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload CSV File with Image URLs
          </label>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          <p className="mt-1 text-sm text-gray-500">
            CSV should contain one image URL per row with header 'image_url'
          </p>
        </div>

        {error && (
          <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
            Error: {error}
          </div>
        )}

        {progress && (
          <div className="text-blue-600 text-sm p-2 bg-blue-50 rounded">
            {progress}
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedFile || loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${loading || !selectedFile 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Processing...' : 'Process Images'}
        </button>
      </form>

      {processedImages.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Processed Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {processedImages.map((url, index) => (
              <div key={url} className="relative aspect-square">
                <img
                  src={url}
                  alt={`Processed image ${index + 1}`}
                  className="rounded-lg object-contain w-full h-full"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
