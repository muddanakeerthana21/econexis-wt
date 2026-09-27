import express from 'express';
import {
  getRewards,
  getRewardById,
  createReward,
  redeemReward,
} from '../controllers/rewardController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /rewards:
 *   get:
 *     summary: Retrieve available EcoRewards catalogue
 *     tags: [Rewards]
 *     responses:
 *       200:
 *         description: List of rewards
 *   post:
 *     summary: Create a new reward item (Admin)
 *     tags: [Rewards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Reward created
 */
router.route('/')
  .get(getRewards)
  .post(protect, authorize('admin'), createReward);

/**
 * @swagger
 * /rewards/{id}/redeem:
 *   post:
 *     summary: Redeem an EcoReward with user points
 *     tags: [Rewards]
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
 *         description: Reward redeemed successfully
 */
router.post('/:id/redeem', protect, redeemReward);

/**
 * @swagger
 * /rewards/{id}:
 *   get:
 *     summary: Get reward by ID
 *     tags: [Rewards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reward details
 */
router.route('/:id')
  .get(getRewardById);

export default router;
