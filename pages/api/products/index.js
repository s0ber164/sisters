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
      message: 'Database connection failed'
    });
  }

  switch (method) {
    case 'GET':
      try {
        const products = await Product.find({})
          .populate('category')
          .populate('subcategories')
          .sort({ createdAt: -1 })
          .maxTimeMS(5000);
        
        return res.status(200).json({
          success: true,
          data: products
        });
      } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch products'
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
          message: 'Failed to create product'
        });
      }

    default:
      return res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
  }
}
