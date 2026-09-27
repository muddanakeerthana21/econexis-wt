import express from 'express';
import {
  getDonations,
  getDonationById,
  createDonation,
  updateDonation,
  deleteDonation,
} from '../controllers/donationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /donations:
 *   get:
 *     summary: Get usable device donations (Role-scoped)
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of donations
 *   post:
 *     summary: Submit a new device donation pledge
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [item]
 *             properties:
 *               userName:
 *                 type: string
 *               item:
 *                 type: string
 *               category:
 *                 type: string
 *               condition:
 *                 type: string
 *               deliveryMethod:
 *                 type: string
 *               beneficiaryOption:
 *                 type: string
 *     responses:
 *       201:
 *         description: Donation pledge created (+150 EcoPoints)
 */
router.route('/')
  .get(protect, getDonations)
  .post(protect, createDonation);

/**
 * @swagger
 * /donations/{id}:
 *   get:
 *     summary: Get donation by ID
 *     tags: [Donations]
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
 *         description: Donation details
 *   put:
 *     summary: Update donation status
 *     tags: [Donations]
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
 *         description: Donation updated
 *   delete:
 *     summary: Delete donation record
 *     tags: [Donations]
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
 *         description: Donation deleted
 */
router.route('/:id')
  .get(protect, getDonationById)
  .put(protect, updateDonation)
  .delete(protect, deleteDonation);

export default router;
