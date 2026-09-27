import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EcoNexis REST API Documentation',
      version: '1.0.0',
      description:
        'Official API documentation for the EcoNexis E-Waste and Sustainability Platform. Built with Express.js, MongoDB (Mongoose), JWT authentication, and REST principles.',
      contact: {
        name: 'EcoNexis Engineering',
        email: 'admin@econexis.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Local Express Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token obtained from /auth/login or /auth/register',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '65f123456789abcdef012345' },
            name: { type: 'string', example: 'Aarav Sharma' },
            email: { type: 'string', example: 'user@econexis.com' },
            role: { type: 'string', enum: ['user', 'admin', 'delivery'], example: 'user' },
            phone: { type: 'string', example: '+91 98765 43210' },
            college: { type: 'string', example: 'National Institute of Technology' },
            address: { type: 'string', example: 'Room 304, Block B, Campus Hostel' },
            ecoPoints: { type: 'number', example: 1250 },
            recycledKg: { type: 'number', example: 24.5 },
            co2SavedKg: { type: 'number', example: 18.2 },
            greenLevel: { type: 'string', example: 'Eco Hero' },
            status: { type: 'string', example: 'Active' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Pickup: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '65f123456789abcdef012346' },
            trackingId: { type: 'string', example: 'ECO-1024' },
            userName: { type: 'string', example: 'Aarav Sharma' },
            userPhone: { type: 'string', example: '+91 98765 43210' },
            pickupAddress: { type: 'string', example: 'Room 304, Block B, Campus Hostel' },
            item: { type: 'string', example: 'Laptop & 3 Power Adapters' },
            category: { type: 'string', example: 'Smartphones & Laptops' },
            quantity: { type: 'number', example: 1 },
            pickupDate: { type: 'string', example: '2026-08-25' },
            pickupTime: { type: 'string', example: '02:00 PM - 04:00 PM' },
            notes: { type: 'string', example: 'Call when arriving at Gate 3' },
            status: { type: 'string', enum: ['Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled'], example: 'Pending' },
            deliveryAgent: { type: 'string', example: 'Vikram Singh' },
            measuredWeight: { type: 'number', example: 3.5 },
            pointsAwarded: { type: 'number', example: 100 },
          },
        },
        Donation: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '65f123456789abcdef012347' },
            donationId: { type: 'string', example: 'DON-1001' },
            userName: { type: 'string', example: 'Keerthana' },
            item: { type: 'string', example: 'Lenovo ThinkPad Yoga' },
            category: { type: 'string', example: 'Laptops' },
            condition: { type: 'string', example: 'Good' },
            deliveryMethod: { type: 'string', example: 'Doorstep Pickup' },
            beneficiaryOption: { type: 'string', example: 'Underserved School Students' },
            status: { type: 'string', example: 'Received' },
          },
        },
        Reward: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '65f123456789abcdef012348' },
            rewardCode: { type: 'string', example: 'REW-101' },
            title: { type: 'string', example: 'Eco Badge (Verified Recycler)' },
            points: { type: 'number', example: 200 },
            category: { type: 'string', example: 'Digital' },
            icon: { type: 'string', example: 'Award' },
            description: { type: 'string', example: 'Display an exclusive eco-warrior badge on your profile' },
            claimed: { type: 'boolean', example: false },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation completed successfully' },
            data: { type: 'object' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { background-color: #065f46; }',
    customSiteTitle: 'EcoNexis API Documentation',
  }));

  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};

export default swaggerSpec;
