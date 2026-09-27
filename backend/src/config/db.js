import mongoose from 'mongoose';

let cachedConnection = null;

/**
 * Connect to MongoDB using Mongoose.
 * Reuses the existing connection when running on Vercel/serverless.
 */
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not configured');
    }

    // Reuse an existing connection
    if (cachedConnection && mongoose.connection.readyState === 1) {
      return cachedConnection;
    }

    // Reuse an existing mongoose connection if available
    if (mongoose.connection.readyState === 1) {
      cachedConnection = mongoose.connection;
      return cachedConnection;
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    cachedConnection = conn;

    console.log(
      `[MongoDB] Database connected successfully: ${conn.connection.host}/${conn.connection.name}`
    );

    return conn;
  } catch (error) {
    console.error(`[MongoDB] Database connection error: ${error.message}`);
    throw error;
  }
};

export default connectDB;