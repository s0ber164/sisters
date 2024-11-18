import { connectToDatabase } from '../../../utils/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    
    // Delete all products from the collection
    const result = await db.collection('products').deleteMany({});
    
    console.log(`Deleted ${result.deletedCount} products`);
    
    res.status(200).json({ 
      message: 'All products deleted successfully',
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Delete all products error:', error);
    res.status(500).json({ message: 'Error deleting products', error: error.message });
  }
}
