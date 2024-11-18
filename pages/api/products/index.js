import { connectToDatabase } from '../../../utils/mongodb';

export default async function handler(req, res) {
  console.log('API route hit:', req.method);
  
  try {
    console.log('Attempting to connect to MongoDB...');
    const { db } = await connectToDatabase();
    console.log('Connected to MongoDB in API route');

    switch (req.method) {
      case 'GET':
        try {
          console.log('Fetching products...');
          const products = await db.collection('products')
            .find({})
            .sort({ createdAt: -1 })
            .toArray();
          
          console.log('Products fetched:', products.length);
          return res.status(200).json(products || []);
        } catch (error) {
          console.error('Error fetching products:', error);
          return res.status(500).json({ 
            error: 'Failed to fetch products',
            details: error.message 
          });
        }
        break;

      case 'POST':
        try {
          if (!req.body) {
            throw new Error('No request body provided');
          }
          
          console.log('Received POST request with body:', JSON.stringify(req.body, null, 2));
          const products = Array.isArray(req.body) ? req.body : [req.body];
          
          if (products.length === 0) {
            throw new Error('No products provided');
          }

          // Validate products before insertion
          products.forEach((product, index) => {
            if (!product.name) throw new Error(`Product at index ${index} missing name`);
            if (!product.price) throw new Error(`Product at index ${index} missing price`);
            if (!product.dimensions) throw new Error(`Product at index ${index} missing dimensions`);
            if (!product.quantity) throw new Error(`Product at index ${index} missing quantity`);
          });

          console.log('Processing products:', products.length);
          const result = await db.collection('products').insertMany(products);
          console.log('Products created:', result.insertedCount);
          return res.status(201).json({ 
            message: 'Products created successfully',
            count: result.insertedCount,
            products: result.ops
          });
        } catch (error) {
          console.error('Error creating products:', error);
          return res.status(400).json({ 
            error: 'Failed to create products',
            details: error.message 
          });
        }
        break;

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
