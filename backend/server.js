import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import { seedDatabase } from './src/config/seed.js';
import app from './src/app.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB & start server
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`[EcoNexis Server] Running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
      console.log(`[EcoNexis Docs] Swagger API documentation available at http://localhost:${PORT}/api-docs`);
      console.log(`[EcoNexis Health] Health check endpoint at http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error(`[EcoNexis Server Error] Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
