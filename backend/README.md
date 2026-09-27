# EcoNexis Backend API

A production-grade RESTful API for the **EcoNexis WT** sustainable e-waste management platform. Built with **Node.js, Express.js, MongoDB (Mongoose), JWT Authentication, bcryptjs, and Swagger**.

---

## 🚀 Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose ODM)
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs password hashing
- **API Documentation**: Swagger UI & OpenAPI 3.0 (`swagger-jsdoc`, `swagger-ui-express`)
- **Security & Config**: CORS, dotenv

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js             # MongoDB Mongoose connection
│   │   └── seed.js           # Auto-seeder for demo accounts & records
│   ├── controllers/
│   │   ├── authController.js     # Auth logic (register, login, getMe, profile)
│   │   ├── userController.js     # User management CRUD
│   │   ├── pickupController.js   # Doorstep pickup logistics CRUD
│   │   ├── donationController.js # Usable gadget donation CRUD
│   │   ├── deliveryController.js # Driver fleet & QR handover verification
│   │   ├── rewardController.js   # EcoRewards catalogue & points redemption
│   │   └── ewasteController.js   # E-Waste inventory tracking
│   ├── docs/
│   │   └── swagger.js        # Swagger JSDoc OpenAPI specification
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Bearer verification & role guards
│   │   └── errorMiddleware.js    # Not found & global JSON error handler
│   ├── models/
│   │   ├── User.js           # User schema (roles: user, admin, delivery)
│   │   ├── Pickup.js         # Pickup requests schema
│   │   ├── Donation.js       # Device donation schema
│   │   ├── Delivery.js       # Delivery log & QR verification schema
│   │   ├── Reward.js         # EcoRewards schema & redemptions
│   │   └── Ewaste.js         # E-waste inventory schema
│   ├── routes/
│   │   ├── authRoutes.js     # /api/auth
│   │   ├── userRoutes.js     # /api/users
│   │   ├── pickupRoutes.js   # /api/pickups
│   │   ├── donationRoutes.js # /api/donations
│   │   ├── deliveryRoutes.js # /api/deliveries
│   │   ├── rewardRoutes.js   # /api/rewards
│   │   └── ewasteRoutes.js   # /api/ewaste
│   ├── utils/
│   │   └── generateToken.js  # JWT signing utility
│   └── app.js                # Express app configuration & middleware
├── server.js                 # Server entry point
├── package.json              # Dependencies and scripts
├── .env                      # Environment configuration
├── .env.example              # Environment variables template
└── README.md
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js** v18+ installed
- **MongoDB** running locally on port `27017`

### 2. Environment Configuration
Verify or create `.env` in `backend/`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/econexis
JWT_SECRET=econexis_jwt_super_secure_secret_key_2026_jwt_token_auth
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Installation
```bash
cd backend
npm install
```

### 4. Running the Server
```bash
# Production mode
npm start

# Development mode (with live reload)
npm run dev
```

---

## 📋 Pre-Seeded Accounts for Testing

The database automatically seeds standard demo accounts upon first start:

| Role | Email | Password | EcoPoints | Purpose |
|------|-------|----------|-----------|---------|
| **User** | `user@econexis.com` | `Password123` | 1,250 | General Student / Faculty User |
| **Admin** | `admin@econexis.com` | `Password123` | 9,800 | Sustainability Admin Console |
| **Delivery** | `delivery@econexis.com` | `Password123` | 3,400 | Fleet Driver & QR Scanner |

*(Passwords are securely hashed using `bcryptjs` in MongoDB).*

---

## 🌐 API Endpoints & Swagger

- **Base URL**: `http://localhost:5000/api`
- **Interactive Swagger UI**: `http://localhost:5000/api-docs`
- **Health Check**: `http://localhost:5000/api/health`

### Key Routes Overview:
- `POST /api/auth/register` - Create account & return JWT
- `POST /api/auth/login` - Authenticate & return JWT + User details
- `GET /api/auth/me` - Retrieve authenticated user info (Bearer token)
- `GET, POST, PUT, DELETE /api/pickups` - Manage doorstep pickup logistics
- `GET, POST, PUT, DELETE /api/donations` - Manage usable gadget donations
- `GET, POST, PUT /api/deliveries` - Manage driver fleet assignments & QR verification
- `GET, POST /api/rewards` & `POST /api/rewards/:id/redeem` - EcoRewards store
- `GET, POST, PUT, DELETE /api/users` - Admin user management
