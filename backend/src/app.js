import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
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

// Enable CORS with support for development origins
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Swagger UI Documentation
setupSwagger(app);

/**
 * Health Check Endpoint
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

// Mount Resource Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/ewaste', ewasteRoutes);

// Root redirect / greeting
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to EcoNexis API. Documentation available at /api-docs',
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export default app;
