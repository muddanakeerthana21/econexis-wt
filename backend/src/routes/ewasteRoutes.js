import express from 'express';
import {
  getEwaste,
  getMyEwaste,
  getEwasteByObjectId,
  getEwasteById,
  createEwaste,
  confirmPickup,
  updateEwaste,
  deleteEwaste,
  getUserStats,
  getAdminStats,
  recycleEwasteObject,
} from '../controllers/ewasteController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /ewaste/stats:
 *   get:
 *     summary: Retrieve real-time calculated statistics for authenticated user from MongoDB
 *     tags: [E-Waste]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', protect, getUserStats);

/**
 * @swagger
 * /ewaste/stats/admin:
 *   get:
 *     summary: Retrieve master system-wide statistics from MongoDB for Admin
 *     tags: [E-Waste]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats/admin', protect, authorize('admin'), getAdminStats);

/**
 * @swagger
 * /ewaste/object/{objectId}/recycle:
 *   put:
 *     summary: Mark e-waste object as Recycled in MongoDB (Admin)
 *     tags: [E-Waste]
 *     security:
 *       - bearerAuth: []
 */
router.put('/object/:objectId/recycle', protect, authorize('admin'), recycleEwasteObject);

/**
 * @swagger
 * /ewaste:
 *   get:
 *     summary: Retrieve all e-waste records from MongoDB
 *     tags: [E-Waste]
 *     responses:
 *       200:
 *         description: List of e-waste objects
 *   post:
 *     summary: Register newly detected e-waste object & generate atomic objectId
 *     tags: [E-Waste]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: E-waste object registered
 */
router.route('/')
  .get(getEwaste)
  .post(protect, createEwaste);

/**
 * @swagger
 * /ewaste/my:
 *   get:
 *     summary: Retrieve e-waste objects registered by current authenticated user
 *     tags: [E-Waste]
 *     security:
 *       - bearerAuth: []
 */
router.get('/my', protect, getMyEwaste);

/**
 * @swagger
 * /ewaste/object/{objectId}:
 *   get:
 *     summary: Retrieve e-waste object details by exact objectId (e.g. OBJ-000001)
 *     tags: [E-Waste]
 *     parameters:
 *       - in: path
 *         name: objectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: E-waste object details
 *       404:
 *         description: Object not found
 */
router.get('/object/:objectId', getEwasteByObjectId);

/**
 * @swagger
 * /ewaste/object/{objectId}/pickup:
 *   post:
 *     summary: Delivery partner verifies and confirms e-waste object pickup
 *     tags: [E-Waste]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: objectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pickup status updated to Picked Up
 */
router.route('/object/:objectId/pickup')
  .post(protect, authorize('delivery', 'admin'), confirmPickup)
  .put(protect, authorize('delivery', 'admin'), confirmPickup);

/**
 * @swagger
 * /ewaste/{id}:
 *   get:
 *     summary: Get e-waste item by ID
 *     tags: [E-Waste]
 *   put:
 *     summary: Update e-waste item (Admin)
 *     tags: [E-Waste]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Delete e-waste item (Admin)
 *     tags: [E-Waste]
 *     security:
 *       - bearerAuth: []
 */
router.route('/:id')
  .get(getEwasteById)
  .put(protect, authorize('admin'), updateEwaste)
  .delete(protect, authorize('admin'), deleteEwaste);

export default router;
