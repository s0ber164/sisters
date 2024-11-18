import dbConnect from '../../../utils/dbConnect';
import Product from '../../../models/Product';

export default async function handler(req, res) {
  await dbConnect();

  try {
    switch (req.method) {
      case 'GET':
        try {
          const products = await Product.find({})
            .populate('category')
            .populate('subcategories')
            .sort({ createdAt: -1 });
          
          return res.status(200).json(products);
        } catch (error) {
          console.error('Error fetching products:', error);
          return res.status(500).json({ 
            error: 'Failed to fetch products',
            details: error.message 
          });
        }

      case 'POST':
        try {
          const productData = req.body;
          
          // Validate required fields
          if (!productData.name) throw new Error('Product name is required');
          if (!productData.description) throw new Error('Product description is required');
          if (!productData.price) throw new Error('Product price is required');
          if (!productData.category) throw new Error('Product category is required');

          const product = await Product.create(productData);
          const populatedProduct = await product
            .populate('category')
            .populate('subcategories')
            .execPopulate();

          return res.status(201).json(populatedProduct);
        } catch (error) {
          console.error('Error creating product:', error);
          return res.status(400).json({ 
            error: 'Failed to create product',
            details: error.message 
          });
        }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}
