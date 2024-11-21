import dbConnect from '../../../utils/dbConnect';
import Product from '../../../models/Product';
import cors from '../../../utils/cors';

export default async function handler(req, res) {
  try {
    // Run the CORS middleware
    await cors(req, res);

    const { method } = req;
    console.log(`Processing ${method} request to /api/products`);

    try {
      console.log('Attempting database connection...');
      await dbConnect();
      console.log('Database connection successful');
    } catch (error) {
      console.error('Database connection failed:', error);
      return res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }

    switch (method) {
      case 'GET':
        try {
          console.log('Executing products query...');
          const products = await Product.find({})
            .select('name description price category subcategories images') // Only select needed fields
            .populate('category', 'name')
            .populate('subcategories', 'name')
            .lean() // Convert to plain JavaScript objects
            .maxTimeMS(5000);
          
          console.log(`Query successful, found ${products.length} products`);
          return res.status(200).json({
            success: true,
            data: products
          });
        } catch (error) {
          console.error('Error fetching products:', error);
          return res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
          });
        }

      case 'POST':
        try {
          const productData = req.body;
        
          // Validate required fields
          if (!productData.name) {
            return res.status(400).json({
              success: false,
              message: 'Product name is required'
            });
          }
          if (!productData.price && productData.price !== 0) {
            return res.status(400).json({
              success: false,
              message: 'Product price is required'
            });
          }
          if (!productData.category) {
            return res.status(400).json({
              success: false,
              message: 'Product category is required'
            });
          }

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

          return res.status(201).json({
            success: true,
            data: populatedProduct
          });
        } catch (error) {
          console.error('Error creating product:', error);
          return res.status(500).json({
            success: false,
            message: 'Failed to create product',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
          });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({
          success: false,
          message: `Method ${method} Not Allowed`
        });
    }
  } catch (error) {
    console.error('Unhandled error in products API:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}
