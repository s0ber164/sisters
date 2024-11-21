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
      message: 'Database connection failed'
    });
  }

  switch (method) {
    case 'GET':
      try {
        const categories = await Category.find({})
          .populate('subcategories')
          .sort({ level: 1, name: 1 })
          .maxTimeMS(5000);
        
        return res.status(200).json({
          success: true,
          data: categories
        });
      } catch (error) {
        console.error('Error fetching categories:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch categories'
        });
      }

    case 'POST':
      try {
        const category = await Category.create(req.body);
        return res.status(201).json({
          success: true,
          data: category
        });
      } catch (error) {
        console.error('Error creating category:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to create category'
        });
      }

    default:
      return res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
  }
}
