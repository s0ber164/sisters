import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import csv from 'csv-parse';
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
    const form = new IncomingForm();
    
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'Error parsing form data' });
      }

      const file = files.file[0];
      const fileContent = await fs.readFile(file.filepath, 'utf-8');

      // Parse CSV
      csv.parse(fileContent, {
        columns: true,
        skip_empty_lines: true
      }, async (error, records) => {
        if (error) {
          return res.status(400).json({ error: 'Error parsing CSV file' });
        }

        try {
          const { db } = await connectToDatabase();
          
          // Format records
          const products = records.map(record => ({
            name: record.name,
            description: record.description,
            category: record.category,
            price: parseFloat(record.price) || 0,
            quantity: parseInt(record.quantity) || 0,
            imageUrl: record.imageUrl || '',
            createdAt: new Date(),
            updatedAt: new Date()
          }));

          // Insert products
          await db.collection('products').insertMany(products);

          res.status(200).json({ 
            message: 'Products uploaded successfully',
            count: products.length 
          });
        } catch (dbError) {
          console.error('Database error:', dbError);
          res.status(500).json({ error: 'Error saving to database' });
        }
      });
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
