import dbConnect from '../../../utils/dbConnect';
import Product from '../../../models/Product';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      await dbConnect();
      const products = await Product.find({})
        .populate('category')
        .populate('subcategories')
        .sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: products });
    } catch (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({ success: false, error: 'Error fetching products' });
    }
  } else {
    await dbConnect();

    try {
      switch (req.method) {
        case 'POST':
          try {
            const productData = req.body;
            
            // Validate required fields
            if (!productData.name) throw new Error('Product name is required');
            if (!productData.price && productData.price !== 0) throw new Error('Product price is required');
            if (!productData.category) throw new Error('Product category is required');

            // Set default values for optional fields
            productData.description = productData.description || '';
            productData.quantity = productData.quantity || 1;
            productData.dimensions = productData.dimensions || '';
            productData.subcategories = productData.subcategories || [];
            productData.images = productData.images || [];

            const product = await Product.create(productData);
            const populatedProduct = await Product.findById(product._id)
              .populate('category')
              .populate('subcategories');

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
}
