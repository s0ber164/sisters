import dbConnect from '../../../utils/dbConnect';
import Product from '../../../models/Product';

export default async function handler(req, res) {
  const { method } = req;

  try {
    await dbConnect();
  } catch (error) {
    console.error('Database connection failed:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Database connection failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  switch (method) {
    case 'GET':
      try {
        const products = await Product.find({})
          .populate('category')
          .populate('subcategories')
          .sort({ createdAt: -1 })
          .maxTimeMS(5000); // Add timeout for query
        return res.status(200).json({ success: true, data: products });
      } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(error.name === 'MongooseError' ? 500 : 400).json({ 
          success: false, 
          error: 'Failed to fetch products',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }

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
        return res.status(error.name === 'MongooseError' ? 500 : 400).json({ 
          success: false, 
          error: 'Failed to create product',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }

    default:
      return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
