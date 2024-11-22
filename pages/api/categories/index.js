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
          let categories = await Category.find({})
            .select('name description slug parent') // Include all required fields
            .populate({
              path: 'subcategories',
              select: 'name slug',
            })
            .lean()
            .maxTimeMS(5000);
          
          // If no categories exist, create default ones
          if (categories.length === 0) {
            console.log('No categories found, creating defaults...');
            const defaultCategories = [
              {
                name: 'Film & TV',
                slug: 'film-tv',
                subcategories: [
                  { name: 'Period Drama', slug: 'period-drama' },
                  { name: 'Contemporary', slug: 'contemporary' },
                  { name: 'Sci-Fi', slug: 'sci-fi' }
                ]
              },
              {
                name: 'Theatre',
                slug: 'theatre',
                subcategories: [
                  { name: 'Stage Props', slug: 'stage-props' },
                  { name: 'Set Design', slug: 'set-design' }
                ]
              },
              {
                name: 'Events',
                slug: 'events',
                subcategories: [
                  { name: 'Corporate', slug: 'corporate' },
                  { name: 'Wedding', slug: 'wedding' },
                  { name: 'Party', slug: 'party' }
                ]
              }
            ];

            // First create main categories
            const mainCats = await Category.insertMany(
              defaultCategories.map(({ name, slug }) => ({ name, slug }))
            );

            // Then create subcategories with proper parent references
            for (let i = 0; i < defaultCategories.length; i++) {
              const mainCat = mainCats[i];
              const subCats = defaultCategories[i].subcategories;
              
              await Category.insertMany(
                subCats.map(sub => ({
                  ...sub,
                  parent: mainCat._id
                }))
              );
            }

            // Fetch the newly created categories with their subcategories
            categories = await Category.find({})
              .select('name description slug parent')
              .populate({
                path: 'subcategories',
                select: 'name slug',
              })
              .lean()
              .maxTimeMS(5000);
          }
          
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
    console.error('Unhandled error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}
