import dbConnect from '../../../utils/dbConnect';
import Product from '../../../models/Product';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  await dbConnect();

  try {
    switch (method) {
      case 'GET':
        try {
          const product = await Product.findById(id)
            .populate('category')
            .populate('subcategories');

          if (!product) {
            return res.status(404).json({ 
              success: false, 
              error: 'Product not found' 
            });
          }

          return res.status(200).json({ 
            success: true, 
            data: product 
          });
        } catch (error) {
          console.error('Error fetching product:', error);
          return res.status(500).json({ 
            success: false, 
            error: 'Error fetching product' 
          });
        }

      case 'PUT':
        try {
          const productData = req.body;
          
          // Only validate name and price
          if (!productData.name) {
            return res.status(400).json({
              success: false,
              error: 'Product name is required'
            });
          }
          if (productData.price === undefined || productData.price === '') {
            return res.status(400).json({
              success: false,
              error: 'Product price is required'
            });
          }

          const product = await Product.findByIdAndUpdate(
            id,
            productData,
            { 
              new: true,
              runValidators: true
            }
          );

          if (!product) {
            return res.status(404).json({ 
              success: false, 
              error: 'Product not found' 
            });
          }

          return res.status(200).json({ 
            success: true, 
            data: product 
          });
        } catch (error) {
          console.error('Error updating product:', error);
          return res.status(400).json({ 
            success: false, 
            error: error.message || 'Error updating product' 
          });
        }

      case 'DELETE':
        try {
          const product = await Product.findByIdAndDelete(id);

          if (!product) {
            return res.status(404).json({ 
              error: 'Product not found' 
            });
          }

          return res.status(200).json({ 
            message: 'Product deleted successfully' 
          });
        } catch (error) {
          console.error('Error deleting product:', error);
          return res.status(500).json({ 
            error: 'Failed to delete product',
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
