import { useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Checkbox, FormControlLabel, Box, Typography, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AdminLayout from '../../components/AdminLayout';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [useRembg, setUseRembg] = useState(true);
  const router = useRouter();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    console.log('File selected:', selectedFile);
    
    if (selectedFile && selectedFile.type === 'text/csv') {
      console.log('Valid CSV file selected:', {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      });
      setFile(selectedFile);
      setError(null);
    } else {
      console.log('Invalid file selected:', selectedFile?.type);
      setFile(null);
      setError('Please select a valid CSV file');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file, file.name);
      formData.append('useRembg', useRembg.toString());

      console.log('Uploading file:', {
        name: file.name,
        size: file.size,
        type: file.type,
        useRembg: useRembg
      });

      console.log('Form data being sent:', {
        fileName: file.name,
        useRembg: useRembg,
        useRembgString: useRembg.toString()
      });

      for (let [key, value] of formData.entries()) {
        console.log('FormData entry:', key, '=', value);
      }

      const response = await fetch('/api/products/upload', {
        method: 'POST',
        body: formData
      });

      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText
      });
      
      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Server response was not in the expected format. Please try again.');
      }

      if (!response.ok) {
        const errorMessage = data.error ? 
          `${data.error}${data.details ? `: ${data.details}` : ''}` : 
          'An error occurred while uploading the file';
        throw new Error(errorMessage);
      }

      setSuccess(`Successfully uploaded ${data.count} products`);
      setFile(null);
      event.target.reset();
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message || 'An unexpected error occurred while uploading the file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Upload Products
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <input
              accept=".csv"
              style={{ display: 'none' }}
              id="csv-upload"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="csv-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<CloudUploadIcon />}
                sx={{ mb: 2 }}
              >
                Select CSV File
              </Button>
            </label>
            {file && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected file: {file.name}
              </Typography>
            )}
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={useRembg}
                onChange={(e) => setUseRembg(e.target.checked)}
              />
            }
            label="Process images with rembg (remove background)"
          />

          <Box sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!file || loading}
              sx={{ mr: 2 }}
            >
              {loading ? 'Uploading...' : 'Upload'}
            </Button>
          </Box>
        </form>
      </Box>
    </AdminLayout>
  );
}
