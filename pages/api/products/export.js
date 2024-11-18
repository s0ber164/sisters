import { connectToDatabase } from '../../../utils/mongodb';
import { stringify } from 'csv-stringify';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const products = await db.collection('products').find({}).toArray();

    // Transform products into CSV format
    const records = products.map(product => ({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      image_url: (product.images || []).join(', ') // Join multiple image URLs with commas
    }));

    // Generate CSV
    const csv = stringify(records, {
      header: true,
      columns: {
        name: 'name',
        description: 'description',
        price: 'price',
        image_url: 'image_url'
      }
    });

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
    
    res.status(200).send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Error exporting products', error: error.message });
  }
}
