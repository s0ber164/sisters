import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';

export default function ImageProcessor({ onImageProcessed }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [operation, setOperation] = useState('remove-background');
  const [background, setBackground] = useState('#ffffff');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!selectedFile) {
        throw new Error('Please select an image file');
      }

      const formData = new FormData();
      formData.append('image', selectedFile, selectedFile.name); 
      formData.append('operation', operation.toLowerCase());
      if (operation === 'replace-background') {
        formData.append('background', background);
      }

      console.log('Sending request to process image...', {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        operation: operation.toLowerCase(),
        background: operation === 'replace-background' ? background : undefined
      });
      
      const response = await fetch('/api/process-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.message || 'Failed to process image');
      }

      const data = await response.json();
      console.log('Image processed successfully:', data);
      setProcessedImageUrl(data.url);
      onImageProcessed?.(data.url);
    } catch (error) {
      console.error('Error processing image:', error);
      setError(error.message || 'Failed to process image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-violet-50 file:text-violet-700
              hover:file:bg-violet-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Operation
          </label>
          <select
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="remove-background">Remove Background</option>
            <option value="replace-background">Replace Background</option>
            <option value="enhance">Enhance Image</option>
          </select>
        </div>

        {operation === 'replace-background' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Background Color
            </label>
            <div className="mt-1 relative">
              <div
                className="w-8 h-8 rounded border cursor-pointer"
                style={{ backgroundColor: background }}
                onClick={() => setShowColorPicker(!showColorPicker)}
              />
              {showColorPicker && (
                <div className="absolute mt-2 z-10">
                  <HexColorPicker color={background} onChange={setBackground} />
                </div>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedFile || loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            loading || !selectedFile
              ? 'bg-indigo-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {loading ? 'Processing...' : 'Process Image'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {processedImageUrl && !error && (
        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-900">Processed Image</h3>
          <div className="mt-2">
            <img
              src={processedImageUrl}
              alt="Processed"
              className="max-w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
