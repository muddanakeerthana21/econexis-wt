import express from 'express';
import {
  getDeliveries,
  getDeliveryById,
  createDelivery,
  verifyDeliveryScan,
} from '../controllers/deliveryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /deliveries:
 *   get:
 *     summary: Retrieve delivery logs & assignments (Delivery/Admin)
 *     tags: [Deliveries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of delivery logs
 *   post:
 *     summary: Create / record a delivery log
 *     tags: [Deliveries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Delivery record created
 */
router.route('/')
  .get(protect, authorize('delivery', 'admin'), getDeliveries)
  .post(protect, authorize('delivery', 'admin'), createDelivery);

/**
 * @swagger
 * /deliveries/verify:
 *   post:
 *     summary: Verify QR and finalize doorstep handover
 *     tags: [Deliveries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pickupId]
 *             properties:
 *               pickupId:
 *                 type: string
 *               measuredWeight:
 *                 type: number
 *               pointsAwarded:
 *                 type: number
 *     responses:
 *       200:
 *         description: Handover verified and EcoPoints awarded
 */
router.post('/verify', protect, authorize('delivery', 'admin'), verifyDeliveryScan);

/**
 * @swagger
 * /deliveries/{id}:
 *   get:
 *     summary: Get delivery record by ID
 *     tags: [Deliveries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delivery details
 */
router.route('/:id')
  .get(protect, authorize('delivery', 'admin'), getDeliveryById);

export default router;
