import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import connectDB from './config/db.js';
import { setupSwagger } from './docs/swagger.js';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import pickupRoutes from './routes/pickupRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import rewardRoutes from './routes/rewardRoutes.js';
import ewasteRoutes from './routes/ewasteRoutes.js';

const app = express();

app.use(
  cors({
   origin: [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://econexis-wt-kqpq.vercel.app',
  'https://econexis-wt-asp8.vercel.app',
  'https://econexis-wt-asp8-lqno3d7zi-no-aff7.vercel.app',
],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
 * MongoDB connection middleware
 *
 * Vercel runs the Express app as a serverless function.
 * Therefore, make sure MongoDB is connected before
 * processing any /api/... request.
 */
app.use(async (req, res, next) => {
  const isApiRequest =
    req.path === '/api' || req.path.startsWith('/api/');

  // Swagger and root page do not require MongoDB.
  if (!isApiRequest) {
    return next();
  }

  try {
    const connection = await connectDB();

    if (!connection || mongoose.connection.readyState !== 1) {
      console.error('[MongoDB Middleware] Database is not connected');

      return res.status(503).json({
        success: false,
        message: 'MongoDB connection unavailable',
        database: 'MongoDB',
        dbStatus: 'Disconnected',
      });
    }

    next();
  } catch (error) {
    console.error(
      `[MongoDB Middleware] Connection error: ${error.message}`
    );

    return res.status(503).json({
      success: false,
      message: 'MongoDB connection unavailable',
      database: 'MongoDB',
      dbStatus: 'Disconnected',
    });
  }
});

setupSwagger(app);

/*
 * Health Check
 */
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;

  return res.status(200).json({
    success: true,
    message: 'Econexis backend is running',
    database: 'MongoDB',
    dbStatus: isConnected ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
  });
});

/*
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/ewaste', ewasteRoutes);

/*
 * Root endpoint
 */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message:
      'Welcome to EcoNexis API. Documentation available at /api-docs',
  });
});

/*
 * Error handling
 */
app.use(notFound);
app.use(errorHandler);

export default app;