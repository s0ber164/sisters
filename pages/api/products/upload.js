import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import { parse } from 'csv-parse/sync';
import { connectToDatabase } from '../../../utils/mongodb';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Parse form data
    const form = new IncomingForm();
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
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
    
    // Format records with required fields
    const products = records.map(record => ({
      name: record.name || '',
      description: record.description || '',
      category: record.category || 'Uncategorized',
      price: parseFloat(record.price) || 0,
      quantity: parseInt(record.quantity) || 0,
      dimensions: record.dimensions || '',
      images: record.images ? record.images.split(',').map(url => url.trim()) : [],
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    // Validate products
    if (products.length === 0) {
      return res.status(400).json({ error: 'No valid products found in CSV' });
    }

    // Insert products
    const result = await db.collection('products').insertMany(products);

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
