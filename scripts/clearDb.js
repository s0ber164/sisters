const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

async function clearDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(MONGODB_DB);
    
    console.log('Clearing products collection...');
    await db.collection('products').deleteMany({});
    console.log('Products collection cleared successfully');
    
    await client.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
}

clearDatabase();
