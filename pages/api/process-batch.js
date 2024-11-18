import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Create uploads directory if it doesn't exist
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }

  const form = new formidable.IncomingForm({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024, // 50MB limit for CSV
  });

  try {
    // Parse the incoming form data
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Form parsing error:', err);
          reject(err);
          return;
        }
        resolve([fields, files]);
      });
    });

    if (!files || !files.csv || !files.csv.filepath) {
      return res.status(400).json({ message: 'No CSV file uploaded' });
    }

    const csvFile = files.csv;
    console.log('CSV file received:', {
      name: csvFile.originalFilename,
      size: csvFile.size,
      path: csvFile.filepath,
      type: csvFile.mimetype
    });

    // Read the file content
    const csvBuffer = await fs.readFile(csvFile.filepath);
    console.log('CSV buffer size:', csvBuffer.length);

    // Create form data for PhotoRoom API
    const formData = new FormData();
    formData.append('file', csvBuffer, {
      filename: csvFile.originalFilename || 'batch.csv',
      contentType: 'text/csv',
    });

    console.log('Sending to PhotoRoom API...');
    
    // Send to PhotoRoom Batch API
    const response = await fetch('https://api.photoroom.com/v1/batch', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.PHOTOROOM_API_KEY || '',
        'Accept': 'application/json',
      },
      body: formData
    });

    console.log('PhotoRoom API response status:', response.status);
    console.log('PhotoRoom API response headers:', response.headers.raw());

    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      console.error('Unexpected response type:', contentType);
      console.error('Response text:', text);
      throw new Error('Received non-JSON response from PhotoRoom API');
    }

    if (!response.ok) {
      console.error('PhotoRoom API error:', responseData);
      throw new Error(responseData.message || 'Failed to process batch');
    }

    console.log('PhotoRoom API response:', responseData);

    // Clean up the temporary CSV file
    try {
      await fs.unlink(csvFile.filepath);
    } catch (error) {
      console.error('Error cleaning up temporary file:', error);
    }

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Batch processing error:', error);
    return res.status(500).json({ 
      message: error.message,
      details: error.stack
    });
  }
}
