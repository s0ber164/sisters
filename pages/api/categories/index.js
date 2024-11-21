import dbConnect from '../../../utils/dbConnect';
import Category from '../../../models/Category';

// Add caching
let categoriesCache = {
  data: null,
  lastFetched: null
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export default async function handler(req, res) {
  const { method } = req;

  console.log('Starting categories API request:', method);
  
  // Check if we have the required environment variables
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not defined');
    return res.status(500).json({
      success: false,
      message: 'Database configuration error'
    });
  }

  try {
    await dbConnect();
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database connection failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }

  switch (method) {
    case 'GET':
      try {
        // Check cache first
        if (categoriesCache.data && categoriesCache.lastFetched && 
            (Date.now() - categoriesCache.lastFetched) < CACHE_DURATION) {
          console.log('Returning cached categories data');
          return res.status(200).json({
            success: true,
            data: categoriesCache.data
          });
        }

        console.log('Executing categories query...');
        const categories = await Category.find({})
          .select('name level subcategories') // Only select needed fields
          .populate('subcategories', 'name level')
          .lean() // Convert to plain JavaScript objects
          .maxTimeMS(2000); // Reduced timeout
        
        // Update cache
        categoriesCache.data = categories;
        categoriesCache.lastFetched = Date.now();
        
        console.log(`Query successful, found ${categories.length} categories`);
        return res.status(200).json({
          success: true,
          data: categories
        });
      } catch (error) {
        console.error('Error fetching categories:', error);
        // If cache exists but query failed, return cached data
        if (categoriesCache.data) {
          console.log('Returning stale cache after error');
          return res.status(200).json({
            success: true,
            data: categoriesCache.data,
            warning: 'Data may be stale'
          });
        }
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch categories',
          error: error.message
        });
      }

    case 'POST':
      try {
        const category = await Category.create(req.body);
        // Invalidate cache when new category is created
        categoriesCache.data = null;
        categoriesCache.lastFetched = null;
        return res.status(201).json({
          success: true,
          data: category
        });
      } catch (error) {
        console.error('Error creating category:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to create category',
          error: error.message
        });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }
}
