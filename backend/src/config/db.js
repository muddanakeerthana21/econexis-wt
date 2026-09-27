import mongoose from 'mongoose';

let cachedConnection = null;

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('[MongoDB] MONGO_URI is missing');
    return null;
  }

  try {
    if (cachedConnection && mongoose.connection.readyState === 1) {
      return cachedConnection;
    }

    if (mongoose.connection.readyState === 1) {
      cachedConnection = mongoose.connection;
      return cachedConnection;
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    cachedConnection = conn;

    console.log(
      `[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`
    );

    return conn;
  } catch (error) {
    console.error('[MongoDB] CONNECTION FAILED');
    console.error(error);

    // Do not crash the Vercel function.
    return null;
  }
};

export default connectDB;