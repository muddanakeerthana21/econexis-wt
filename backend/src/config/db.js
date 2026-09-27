import mongoose from 'mongoose';

/**
 * Connect to MongoDB instance using Mongoose
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/econexis');
    console.log(`[MongoDB] Database connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Database connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
