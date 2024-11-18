import { removeBackground, replaceBackground, enhanceImage } from '../../utils/photoroom';
import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  console.log('API route called: /api/process-image');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Create uploads directory if it doesn't exist
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  try {
    await fs.access(uploadDir);
    console.log('Uploads directory exists:', uploadDir);
  } catch {
    console.log('Creating uploads directory:', uploadDir);
    await fs.mkdir(uploadDir, { recursive: true });
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
  });

  try {
    console.log('Parsing form data...');
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

    console.log('Fields received:', fields);
    console.log('Files received:', files);

    if (!files || !files.image) {
      console.error('No image file received');
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const file = files.image;
    console.log('Processing file:', file.filepath);

    // Read the file into a buffer
    const imageBuffer = await fs.readFile(file.filepath);
    console.log('Image buffer size:', imageBuffer.length);

    // Process the image
    console.log('Sending to PhotoRoom API...');
    const processedImageBuffer = await removeBackground(imageBuffer);
    console.log('Received processed image, size:', processedImageBuffer.length);

    // Generate unique filename for the processed image
    const filename = `processed-${Date.now()}.png`;
    const outputPath = path.join(uploadDir, filename);

    // Save processed image
    await fs.writeFile(outputPath, processedImageBuffer);
    console.log('Processed image saved to:', outputPath);

    // Clean up temporary file
    await fs.unlink(file.filepath).catch(error => {
      console.error('Error cleaning up temporary file:', error);
    });

    // Return the URL path relative to the public directory
    const responseUrl = `/uploads/${filename}`;
    console.log('Returning URL:', responseUrl);
    
    res.status(200).json({
      message: 'Image processed successfully',
      url: responseUrl,
    });
  } catch (error) {
    console.error('Error in process-image API route:', error);
    
    // Send a more detailed error response
    res.status(500).json({
      message: 'Error processing image',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}
