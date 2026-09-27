import Delivery from '../models/Delivery.js';
import Pickup from '../models/Pickup.js';
import User from '../models/User.js';

/**
 * @desc    Get all delivery tasks
 * @route   GET /api/deliveries
 * @access  Public / Protected
 */
export const getDeliveries = async (req, res, next) => {
  try {
    const { agent, status } = req.query;
    const query = {};

    if (req.user && (req.user.role || '').toUpperCase() === 'DELIVERY') {
      query.$or = [{ agent: req.user._id }, { agentName: req.user.name }];
    } else if (agent) {
      query.agent = agent;
    }

    if (status) query.verificationStatus = status;

    const deliveries = await Delivery.find(query)
      .populate('pickup')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: deliveries.length,
      data: deliveries,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get delivery by ID
 * @route   GET /api/deliveries/:id
 * @access  Public / Protected
 */
export const getDeliveryById = async (req, res, next) => {
  try {
    const delivery = await Delivery.findById(req.params.id).populate('pickup');

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery record not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: delivery,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create / record a delivery log
 * @route   POST /api/deliveries
 * @access  Public / Protected
 */
export const createDelivery = async (req, res, next) => {
  try {
    const {
      pickupId,
      pickupTrackingId,
      agentName,
      vehicleNumber,
      assignedArea,
      measuredWeight,
      pointsAwarded,
      batteryChecked,
      dataWipeConfirmed,
      verificationStatus,
    } = req.body;

    const delivery = await Delivery.create({
      pickup: pickupId || undefined,
      pickupTrackingId,
      agent: req.user?._id || undefined,
      agentName: agentName || req.user?.name || 'Vikram Singh',
      vehicleNumber: vehicleNumber || 'EV-VAN-4022',
      assignedArea: assignedArea || 'North City Campus Hub',
      measuredWeight: Number(measuredWeight) || 0,
      pointsAwarded: Number(pointsAwarded) || 0,
      batteryChecked: Boolean(batteryChecked),
      dataWipeConfirmed: Boolean(dataWipeConfirmed),
      verificationStatus: verificationStatus || 'Pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Delivery record created.',
      data: delivery,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify QR and complete doorstep handover
 * @route   PUT /api/deliveries/:id/verify
 * @access  Public / Protected
 */
export const verifyDeliveryScan = async (req, res, next) => {
  try {
    const { pickupId, measuredWeight, pointsAwarded, batteryChecked, dataWipeConfirmed } = req.body;

    // Look for matching pickup
    let targetPickup = null;
    if (pickupId) {
      targetPickup = await Pickup.findOne({
        $or: [{ _id: pickupId.length === 24 ? pickupId : null }, { trackingId: pickupId }],
      });
    }

    if (targetPickup) {
      targetPickup.status = 'Completed';
      targetPickup.measuredWeight = Number(measuredWeight || 3.5);
      targetPickup.pointsAwarded = Number(pointsAwarded || 100);
      targetPickup.batteryChecked = Boolean(batteryChecked);
      targetPickup.dataWipeConfirmed = Boolean(dataWipeConfirmed);
      await targetPickup.save();

      // If user exists, award points
      if (targetPickup.user) {
        await User.findByIdAndUpdate(targetPickup.user, {
          $inc: {
            ecoPoints: Number(pointsAwarded || 100),
            recycledKg: Number(measuredWeight || 3.5),
            co2SavedKg: Number((Number(measuredWeight || 3.5) * 0.75).toFixed(1)),
          },
        });
      }
    }

    const delivery = await Delivery.create({
      pickup: targetPickup?._id || undefined,
      pickupTrackingId: targetPickup?.trackingId || pickupId,
      agent: req.user?._id || undefined,
      agentName: req.user?.name || 'Vikram Singh',
      measuredWeight: Number(measuredWeight || 3.5),
      pointsAwarded: Number(pointsAwarded || 100),
      batteryChecked: Boolean(batteryChecked),
      dataWipeConfirmed: Boolean(dataWipeConfirmed),
      verificationStatus: 'Completed',
      completedAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: `Handover verified and completed. +${pointsAwarded || 100} EcoPoints credited.`,
      data: delivery,
    });
  } catch (error) {
    next(error);
  }
};
