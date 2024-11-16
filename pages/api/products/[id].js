import { connectToDatabase } from '../../../utils/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  try {
    const { db } = await connectToDatabase();

    switch (method) {
      case 'DELETE':
        try {
          if (!id) {
            return res.status(400).json({ 
              success: false, 
              message: 'Product ID is required' 
            });
          }

          if (!ObjectId.isValid(id)) {
            return res.status(400).json({ 
              success: false, 
              message: 'Invalid product ID format' 
            });
          }

          const result = await db.collection('products').deleteOne({
            _id: new ObjectId(id)
          });

          if (result.deletedCount === 0) {
            return res.status(404).json({ 
              success: false, 
              message: 'Product not found' 
            });
          }

          res.status(200).json({ 
            success: true, 
            message: 'Product deleted successfully' 
          });
        } catch (error) {
          console.error('Error deleting product:', error);
          res.status(500).json({ 
            success: false, 
            message: 'Error deleting product: ' + error.message 
          });
        }
        break;

      default:
        res.setHeader('Allow', ['DELETE']);
        res.status(405).json({ 
          success: false, 
          message: `Method ${method} Not Allowed` 
        });
    }
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Database connection error: ' + error.message 
    });
  }
}
