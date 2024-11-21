import dbConnect from '../../../utils/dbConnect';
import Category from '../../../models/Category';

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
        const categories = await Category.find({})
          .populate('subcategories')
          .sort({ level: 1, name: 1 })
          .maxTimeMS(5000); // Add timeout for query
        res.status(200).json({ success: true, data: categories });
      } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(error.name === 'MongooseError' ? 500 : 400).json({ 
          success: false, 
          error: 'Failed to fetch categories',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
      break;

    case 'POST':
      try {
        const category = await Category.create(req.body);
        res.status(201).json({ success: true, data: category });
      } catch (error) {
        console.error('Error creating category:', error);
        res.status(error.name === 'MongooseError' ? 500 : 400).json({ 
          success: false, 
          error: 'Failed to create category',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
      break;

    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
      break;
  }
}
