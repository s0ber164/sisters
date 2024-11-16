import connectDB from '../../../lib/mongodb';
import Product from '../../../models/Product';

export default async function handler(req, res) {
  console.log('API route hit:', req.method);
  
  try {
    console.log('Attempting to connect to MongoDB...');
    await connectDB();
    console.log('Connected to MongoDB in API route');

    switch (req.method) {
      case 'GET':
        try {
          console.log('Fetching products...');
          const products = await Product.find({}).sort({ createdAt: -1 });
          console.log('Products fetched:', products.length);
          res.status(200).json(products);
        } catch (error) {
          console.error('Error fetching products:', error);
          res.status(500).json({ 
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
          const createdProducts = await Product.create(products);
          console.log('Products created:', createdProducts.length);
          res.status(201).json(createdProducts);
        } catch (error) {
          console.error('Error creating products:', error);
          res.status(400).json({ 
            error: 'Failed to create products',
            details: error.message 
          });
        }
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
