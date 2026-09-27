import Pickup from '../models/Pickup.js';
import User from '../models/User.js';

/**
 * @desc    Get all pickups with optional status/search filters
 * @route   GET /api/pickups
 * @access  Public / Protected
 */
export const getPickups = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    // Role-based data scoping
    if (req.user) {
      const userRole = (req.user.role || '').toUpperCase();
      if (userRole === 'USER') {
        // Standard user sees ONLY their own pickups
        query.$or = [
          { user: req.user._id },
          { userPhone: req.user.phone },
          { userName: req.user.name },
        ];
      } else if (userRole === 'DELIVERY') {
        // Delivery agents see pickups assigned to them or unassigned/pending stops
        query.$or = [
          { deliveryAgent: req.user.name },
          { deliveryAgentId: req.user._id },
          { deliveryAgent: 'Unassigned' },
          { status: 'Pending' },
          { status: 'Assigned' },
        ];
      }
      // Admin sees all pickups without restriction
    }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          {
            $or: [
              { trackingId: searchRegex },
              { userName: searchRegex },
              { item: searchRegex },
              { pickupAddress: searchRegex },
            ],
          },
        ];
        delete query.$or;
      } else {
        query.$or = [
          { trackingId: searchRegex },
          { userName: searchRegex },
          { item: searchRegex },
          { pickupAddress: searchRegex },
        ];
      }
    }

    const pickups = await Pickup.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: pickups.length,
      data: pickups,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get pickup by ID
 * @route   GET /api/pickups/:id
 * @access  Protected (Scoped)
 */
export const getPickupById = async (req, res, next) => {
  try {
    const pickup = await Pickup.findById(req.params.id);

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup request not found.',
      });
    }

    // Role check: Normal users can only see their own pickup
    if (req.user && (req.user.role || '').toUpperCase() === 'USER') {
      const isOwner =
        (pickup.user && pickup.user.toString() === req.user._id.toString()) ||
        pickup.userPhone === req.user.phone ||
        pickup.userName === req.user.name;

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have permission to view this pickup record.',
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: pickup,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new pickup request
 * @route   POST /api/pickups
 * @access  Protected
 */
export const createPickup = async (req, res, next) => {
  try {
    const {
      userName,
      userPhone,
      item,
      category,
      quantity,
      pickupAddress,
      pickupDate,
      pickupTime,
      notes,
    } = req.body;

    const contactName = req.user?.name || userName;
    const contactPhone = req.user?.phone || userPhone;
    const contactAddress = pickupAddress || req.user?.address;

    if (!contactName || !contactPhone || !contactAddress || !item || !pickupDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, phone, address, item, and date.',
      });
    }

    const pickup = await Pickup.create({
      user: req.user?._id,
      userName: contactName,
      userPhone: contactPhone,
      pickupAddress: contactAddress,
      item,
      category: category || item,
      quantity: Number(quantity) || 1,
      pickupDate,
      pickupTime: pickupTime || '02:00 PM - 04:00 PM',
      notes: notes || '',
      status: 'Pending',
      deliveryAgent: 'Unassigned',
    });

    return res.status(201).json({
      success: true,
      message: 'Doorstep pickup request scheduled successfully.',
      data: pickup,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update pickup (status, assign driver, measured weight, points)
 * @route   PUT /api/pickups/:id
 * @access  Protected
 */
export const updatePickup = async (req, res, next) => {
  try {
    const pickup = await Pickup.findById(req.params.id);

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup request not found.',
      });
    }

    const userRole = (req.user?.role || '').toUpperCase();
    const isAdmin = userRole === 'ADMIN';
    const isDelivery = userRole === 'DELIVERY';
    const isOwner =
      (pickup.user && pickup.user.toString() === req.user?._id.toString()) ||
      pickup.userPhone === req.user?.phone;

    if (!isAdmin && !isDelivery && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to update this pickup record.',
      });
    }

    const {
      status,
      deliveryAgent,
      deliveryAgentId,
      measuredWeight,
      pointsAwarded,
      batteryChecked,
      dataWipeConfirmed,
      notes,
      pickupDate,
      pickupTime,
      pickupAddress,
    } = req.body;

    // Normal user modifications (date, time, address, notes, cancellation)
    if (isOwner && !isAdmin && !isDelivery) {
      if (pickup.status !== 'Pending') {
        return res.status(400).json({
          success: false,
          message: 'Cannot modify a pickup that is already assigned or in progress.',
        });
      }
      if (pickupDate) pickup.pickupDate = pickupDate;
      if (pickupTime) pickup.pickupTime = pickupTime;
      if (pickupAddress) pickup.pickupAddress = pickupAddress;
      if (notes !== undefined) pickup.notes = notes;
      if (status === 'Cancelled') pickup.status = 'Cancelled';
    }

    // Delivery agent / Admin modifications
    if (isAdmin || isDelivery) {
      if (status) pickup.status = status;
      if (deliveryAgent !== undefined) pickup.deliveryAgent = deliveryAgent;
      if (deliveryAgentId) pickup.deliveryAgentId = deliveryAgentId;
      if (measuredWeight !== undefined) pickup.measuredWeight = Number(measuredWeight);
      if (pointsAwarded !== undefined) pickup.pointsAwarded = Number(pointsAwarded);
      if (batteryChecked !== undefined) pickup.batteryChecked = Boolean(batteryChecked);
      if (dataWipeConfirmed !== undefined) pickup.dataWipeConfirmed = Boolean(dataWipeConfirmed);
      if (notes !== undefined) pickup.notes = notes;
      if (pickupDate) pickup.pickupDate = pickupDate;
      if (pickupTime) pickup.pickupTime = pickupTime;
      if (pickupAddress) pickup.pickupAddress = pickupAddress;
    }

    const updated = await pickup.save();

    // If completed and points were awarded, optionally credit the user's account
    if (status === 'Completed' && pointsAwarded && pickup.user) {
      await User.findByIdAndUpdate(pickup.user, {
        $inc: {
          ecoPoints: Number(pointsAwarded),
          recycledKg: Number(measuredWeight || 1),
          co2SavedKg: Number(((Number(measuredWeight) || 1) * 0.75).toFixed(1)),
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Pickup updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete pickup
 * @route   DELETE /api/pickups/:id
 * @access  Admin or Owner (if Pending)
 */
export const deletePickup = async (req, res, next) => {
  try {
    const pickup = await Pickup.findById(req.params.id);

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup request not found.',
      });
    }

    const isAdmin = req.user?.role === 'admin';
    const isOwner =
      pickup.user && req.user?._id && pickup.user.toString() === req.user._id.toString();

    if (!isAdmin && (!isOwner || pickup.status !== 'Pending')) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only cancel your own pending pickup requests.',
      });
    }

    await Pickup.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Pickup request cancelled/deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
