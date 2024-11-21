import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  try {
    if (cached.conn) {
      console.log('Using cached database connection');
      return cached.conn;
    }

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000, // Increased timeout
        socketTimeoutMS: 45000, // Increased timeout
        family: 4,
        maxPoolSize: 5,
        connectTimeoutMS: 10000,
        heartbeatFrequencyMS: 30000,
        retryWrites: true,
        w: 'majority',
        retryReads: true,
      };

      console.log('Initiating MongoDB connection...');
      console.log('MongoDB URI format check:', MONGODB_URI.startsWith('mongodb'));

      cached.promise = mongoose
        .connect(MONGODB_URI, opts)
        .then((mongoose) => {
          console.log('MongoDB connected successfully');
          return mongoose;
        })
        .catch((error) => {
          console.error('MongoDB connection error details:', {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack
          });
          cached.promise = null;
          throw error;
        });
    }

    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (e) {
      console.error('Error resolving MongoDB connection:', e);
      cached.promise = null;
      throw e;
    }
  } catch (error) {
    console.error('Database connection error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
}

export default dbConnect;
