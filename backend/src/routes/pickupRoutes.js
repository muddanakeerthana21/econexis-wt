import express from 'express';
import {
  getPickups,
  getPickupById,
  createPickup,
  updatePickup,
  deletePickup,
} from '../controllers/pickupController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /pickups:
 *   get:
 *     summary: Get doorstep pickups (Scoped to role)
 *     tags: [Pickups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter pickups by status (Pending, Assigned, In Progress, Completed, Cancelled)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of pickups
 *   post:
 *     summary: Schedule a new doorstep pickup
 *     tags: [Pickups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userName, userPhone, pickupAddress, item, pickupDate]
 *             properties:
 *               userName:
 *                 type: string
 *               userPhone:
 *                 type: string
 *               pickupAddress:
 *                 type: string
 *               item:
 *                 type: string
 *               pickupDate:
 *                 type: string
 *               pickupTime:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pickup created successfully
 */
router.route('/')
  .get(protect, getPickups)
  .post(protect, createPickup);

/**
 * @swagger
 * /pickups/{id}:
 *   get:
 *     summary: Get pickup by ID
 *     tags: [Pickups]
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
 *         description: Pickup details
 *       404:
 *         description: Pickup not found
 *   put:
 *     summary: Update pickup status, assign delivery driver, log weights
 *     tags: [Pickups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               deliveryAgent:
 *                 type: string
 *               measuredWeight:
 *                 type: number
 *               pointsAwarded:
 *                 type: number
 *     responses:
 *       200:
 *         description: Pickup updated successfully
 *   delete:
 *     summary: Cancel / delete pickup
 *     tags: [Pickups]
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
 *         description: Pickup cancelled
 */
router.route('/:id')
  .get(protect, getPickupById)
  .put(protect, updatePickup)
  .delete(protect, deletePickup);

export default router;
