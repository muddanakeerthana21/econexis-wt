import Reward from '../models/Reward.js';
import User from '../models/User.js';

/**
 * @desc    Get all available rewards
 * @route   GET /api/rewards
 * @access  Public / Protected
 */
export const getRewards = async (req, res, next) => {
  try {
    const rewards = await Reward.find().sort({ points: 1 });

    return res.status(200).json({
      success: true,
      count: rewards.length,
      data: rewards,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get reward by ID
 * @route   GET /api/rewards/:id
 * @access  Public / Protected
 */
export const getRewardById = async (req, res, next) => {
  try {
    const reward = await Reward.findById(req.params.id);

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: reward,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new reward item (Admin)
 * @route   POST /api/rewards
 * @access  Admin
 */
export const createReward = async (req, res, next) => {
  try {
    const { title, points, category, icon, description } = req.body;

    if (!title || !points || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, points, and category for reward.',
      });
    }

    const reward = await Reward.create({
      title,
      points: Number(points),
      category,
      icon: icon || 'Gift',
      description: description || '',
    });

    return res.status(201).json({
      success: true,
      message: 'Reward item created successfully.',
      data: reward,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Redeem reward for current user
 * @route   POST /api/rewards/:id/redeem
 * @access  Private
 */
export const redeemReward = async (req, res, next) => {
  try {
    const reward = await Reward.findById(req.params.id);

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward item not found.',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    if (user.ecoPoints < reward.points) {
      return res.status(400).json({
        success: false,
        message: `Insufficient EcoPoints. Required: ${reward.points}, Current Balance: ${user.ecoPoints}`,
      });
    }

    // Deduct points
    user.ecoPoints -= reward.points;
    await user.save();

    // Generate voucher code
    const voucherCode = `ECO-VOUCHER-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    reward.redemptions.push({
      user: user._id,
      userName: user.name,
      userEmail: user.email,
      voucherCode,
      redeemedAt: new Date(),
    });
    await reward.save();

    return res.status(200).json({
      success: true,
      message: `Successfully redeemed "${reward.title}" for ${reward.points} EcoPoints!`,
      voucherCode,
      remainingPoints: user.ecoPoints,
    });
  } catch (error) {
    next(error);
  }
};
