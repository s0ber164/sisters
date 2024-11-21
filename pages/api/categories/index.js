import dbConnect from '../../../utils/dbConnect';
import Category from '../../../models/Category';
import cors from '../../../utils/cors';

export default async function handler(req, res) {
  try {
    // Run the CORS middleware
    await cors(req, res);

    const { method } = req;
    console.log(`Processing ${method} request to /api/categories`);

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
          console.log('Executing categories query...');
          const categories = await Category.find({})
            .select('name description') // Only select needed fields
            .lean() // Convert to plain JavaScript objects
            .maxTimeMS(5000);
          
          console.log(`Query successful, found ${categories.length} categories`);
          return res.status(200).json({
            success: true,
            data: categories
          });
        } catch (error) {
          console.error('Error fetching categories:', error);
          return res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
          });
        }

      case 'POST':
        try {
          const categoryData = req.body;
          
          if (!categoryData.name) {
            return res.status(400).json({
              success: false,
              message: 'Category name is required'
            });
          }

          // Set default values for optional fields
          categoryData.description = categoryData.description || '';

          const category = await Category.create(categoryData);
          return res.status(201).json({
            success: true,
            data: category
          });
        } catch (error) {
          console.error('Error creating category:', error);
          return res.status(500).json({
            success: false,
            message: 'Failed to create category',
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
    console.error('Unhandled error in categories API:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}
