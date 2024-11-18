import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import { parse } from 'csv-parse/sync';
import { connectToDatabase } from '../../../utils/mongodb';
import { removeBackground } from '../../../utils/photoroom';
import fetch from 'node-fetch';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function downloadImage(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    console.error('Error downloading image:', error);
    return null;
  }
}

async function processProductImage(imageUrl, uploadDir) {
  try {
    console.log('Processing image:', imageUrl);
    
    // Download the image
    const imageBuffer = await downloadImage(imageUrl);
    if (!imageBuffer) {
      console.error('Failed to download image:', imageUrl);
      return imageUrl; // Return original URL if download fails
    }

    // Process the image with PhotoRoom
    console.log('Processing image with PhotoRoom (removing background and setting gray background)...');
    const processedBuffer = await removeBackground(imageBuffer);

    // Generate unique filename
    const filename = `processed-${Date.now()}${path.extname(imageUrl) || '.png'}`;
    const filePath = path.join(uploadDir, filename);

    // Save the processed image
    await fs.writeFile(filePath, processedBuffer);
    
    // Return the public URL
    return `/uploads/${filename}`;
  } catch (error) {
    console.error('Error processing image:', error);
    return imageUrl; // Return original URL if processing fails
  }
}

export default async function handler(req, res) {
  console.log('API route called: /api/products/upload');
  
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

  const form = new IncomingForm({
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

    if (!files.file || !files.file[0]) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read file content
    const file = files.file[0];
    const fileContent = await fs.readFile(file.filepath, 'utf-8');

    // Parse CSV synchronously
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    // Connect to database
    const { db } = await connectToDatabase();
    
    // Process each product's images
    const processedProducts = await Promise.all(records.map(async (record) => {
      const images = record.images ? record.images.split(',').map(url => url.trim()) : [];
      
      // Process each image
      const processedImages = await Promise.all(
        images.map(url => processProductImage(url, uploadDir))
      );

      return {
        name: record.name || '',
        description: record.description || '',
        price: parseFloat(record.price) || 0,
        quantity: parseInt(record.quantity) || 0,
        dimensions: record.dimensions || '',
        images: processedImages.filter(url => url), // Remove any failed URLs
        category: record.category ? record.category.toLowerCase() : 'decor',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }));

    // Validate products
    if (processedProducts.length === 0) {
      return res.status(400).json({ error: 'No valid products found in CSV' });
    }

    // Insert products
    const result = await db.collection('products').insertMany(processedProducts);

    // Return success response
    return res.status(200).json({ 
      message: 'Products uploaded successfully',
      count: result.insertedCount 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      error: 'Error processing upload',
      details: error.message 
    });
  }
}
