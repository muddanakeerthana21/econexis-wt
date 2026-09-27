import Ewaste from '../models/Ewaste.js';
import Counter from '../models/Counter.js';
import User from '../models/User.js';
import Pickup from '../models/Pickup.js';

/**
 * Atomic unique objectId generator: OBJ-000001, OBJ-000002, etc.
 * Uses atomic findByIdAndUpdate with $inc to guarantee zero race conditions and zero duplicates.
 */
export const generateNextObjectId = async () => {
  // Sync counter if initializing
  const counterDoc = await Counter.findById('ewasteObjectId');
  if (!counterDoc) {
    // Check if any existing OBJ-XXXXXX items exist
    const latestItem = await Ewaste.findOne({ objectId: /^OBJ-\d+$/i }).sort({ createdAt: -1 });
    let highestSeq = 0;
    if (latestItem && latestItem.objectId) {
      const match = latestItem.objectId.match(/OBJ-(\d+)/i);
      if (match && match[1]) {
        highestSeq = parseInt(match[1], 10);
      }
    }
    await Counter.create({ _id: 'ewasteObjectId', seq: highestSeq });
  }

  const updatedCounter = await Counter.findByIdAndUpdate(
    'ewasteObjectId',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return `OBJ-${String(updatedCounter.seq).padStart(6, '0')}`;
};

/**
 * @desc    Get all e-waste inventory records
 * @route   GET /api/ewaste
 * @access  Public / Protected
 */
export const getEwaste = async (req, res, next) => {
  try {
    const { category, status, pickupStatus, recyclingStatus, search } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.$or = [{ category }, { type: category }];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (pickupStatus && pickupStatus !== 'All') {
      query.pickupStatus = pickupStatus;
    }

    if (recyclingStatus && recyclingStatus !== 'All') {
      query.recyclingStatus = recyclingStatus;
    }

    if (search) {
      query.$or = [
        { objectId: { $regex: search, $options: 'i' } },
        { itemId: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
        { itemName: { $regex: search, $options: 'i' } },
        { aiDetection: { $regex: search, $options: 'i' } },
        { owner: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
      ];
    }

    const items = await Ewaste.find(query)
      .populate('ownerId', 'name email phone role')
      .populate('deliveryPartner', 'name email phone vehicleNumber')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items,
      objects: items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get e-waste items registered by currently logged-in user
 * @route   GET /api/ewaste/my
 * @access  Protected (User)
 */
export const getMyEwaste = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const items = await Ewaste.find({
      $or: [{ ownerId: userId }, { user: userId }],
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items,
      objects: items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get e-waste item by unique permanent objectId (e.g. OBJ-000001)
 * @route   GET /api/ewaste/object/:objectId
 * @access  Public / Protected / Delivery
 */
export const getEwasteByObjectId = async (req, res, next) => {
  try {
    const { objectId } = req.params;

    if (!objectId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an object ID.',
      });
    }

    // Search by objectId or itemId (case-insensitive)
    const item = await Ewaste.findOne({
      $or: [
        { objectId: new RegExp(`^${objectId.trim()}$`, 'i') },
        { itemId: new RegExp(`^${objectId.trim()}$`, 'i') },
      ],
    })
      .populate('ownerId', 'name email phone college address')
      .populate('deliveryPartner', 'name email phone vehicleNumber assignedArea');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `E-Waste object with ID '${objectId}' not found in EcoNexis database.`,
      });
    }

    return res.status(200).json({
      success: true,
      object: item,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get e-waste item by Mongo _id or objectId
 * @route   GET /api/ewaste/:id
 * @access  Public / Protected
 */
export const getEwasteById = async (req, res, next) => {
  try {
    let item = null;

    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      item = await Ewaste.findById(req.params.id)
        .populate('ownerId', 'name email phone')
        .populate('deliveryPartner', 'name email phone');
    }

    if (!item) {
      item = await Ewaste.findOne({
        $or: [
          { objectId: req.params.id },
          { itemId: req.params.id },
        ],
      })
        .populate('ownerId', 'name email phone')
        .populate('deliveryPartner', 'name email phone');
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'E-Waste item not found.',
      });
    }

    return res.status(200).json({
      success: true,
      object: item,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register new e-waste object with AI detection result & atomic objectId
 * @route   POST /api/ewaste
 * @access  Protected (User / Admin)
 */
export const createEwaste = async (req, res, next) => {
  try {
    const {
      type,
      itemName,
      category,
      aiDetection,
      aiConfidence,
      quantity,
      condition,
      recyclingStatus,
      weightKg,
      notes,
    } = req.body;

    const resolvedType = type || itemName || aiDetection;

    if (!resolvedType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide e-waste object type or valid AI detection result.',
      });
    }

    // Atomic permanent objectId generation (e.g. OBJ-000001)
    const permanentObjectId = await generateNextObjectId();

    // Normalize confidence percentage / ratio
    let confidenceVal = Number(aiConfidence) || 0.0;
    if (confidenceVal > 0 && confidenceVal <= 1.0) {
      confidenceVal = Math.round(confidenceVal * 100);
    }

    const ewaste = await Ewaste.create({
      objectId: permanentObjectId,
      itemId: permanentObjectId,
      type: resolvedType,
      itemName: itemName || resolvedType,
      category: category || resolvedType,
      aiDetection: aiDetection || resolvedType,
      aiConfidence: confidenceVal,
      quantity: quantity ? Number(quantity) : 1,
      condition: condition || 'Scrap',
      status: 'Registered',
      pickupStatus: 'Pending',
      recyclingStatus: recyclingStatus || 'Pending',
      weightKg: weightKg ? Number(weightKg) : 1.0,
      notes: notes || '',
      owner: req.user?.name || 'Eco Contributor',
      ownerId: req.user?._id || undefined,
      user: req.user?._id || undefined,
      userName: req.user?.name || 'Eco Contributor',
      deliveryPartner: null,
      deliveryPartnerName: '',
    });

    return res.status(201).json({
      success: true,
      message: 'E-Waste object registered successfully.',
      object: {
        objectId: ewaste.objectId,
        type: ewaste.type,
        aiDetection: ewaste.aiDetection,
        aiConfidence: ewaste.aiConfidence,
        status: ewaste.status,
        pickupStatus: ewaste.pickupStatus,
        owner: ewaste.owner,
        ownerId: ewaste.ownerId,
        createdAt: ewaste.createdAt,
      },
      data: ewaste,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delivery partner confirms pickup of e-waste object
 * @route   POST /api/ewaste/object/:objectId/pickup
 * @access  Protected (Delivery / Admin)
 */
export const confirmPickup = async (req, res, next) => {
  try {
    const { objectId } = req.params;
    const { notes } = req.body;

    const item = await Ewaste.findOne({
      $or: [
        { objectId: new RegExp(`^${objectId.trim()}$`, 'i') },
        { itemId: new RegExp(`^${objectId.trim()}$`, 'i') },
      ],
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `E-Waste object with ID '${objectId}' not found.`,
      });
    }

    // Update MongoDB status
    item.status = 'Picked Up';
    item.pickupStatus = 'Picked Up';
    item.recyclingStatus = 'Collected';
    item.deliveryPartner = req.user._id;
    item.deliveryPartnerName = req.user.name || 'Delivery Partner';
    item.pickupConfirmedAt = new Date();
    if (notes) {
      item.notes = item.notes ? `${item.notes}; ${notes}` : notes;
    }

    const updatedItem = await item.save();

    return res.status(200).json({
      success: true,
      message: `Pickup confirmed for e-waste object ${item.objectId}.`,
      object: updatedItem,
      data: updatedItem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update e-waste item
 * @route   PUT /api/ewaste/:id
 * @access  Protected / Admin
 */
export const updateEwaste = async (req, res, next) => {
  try {
    let item = null;

    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      item = await Ewaste.findById(req.params.id);
    }
    if (!item) {
      item = await Ewaste.findOne({
        $or: [{ objectId: req.params.id }, { itemId: req.params.id }],
      });
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'E-Waste item not found.',
      });
    }

    const {
      type,
      itemName,
      category,
      quantity,
      condition,
      status,
      pickupStatus,
      recyclingStatus,
      weightKg,
      notes,
    } = req.body;

    if (type) item.type = type;
    if (itemName) item.itemName = itemName;
    if (category) item.category = category;
    if (quantity !== undefined) item.quantity = Number(quantity);
    if (condition) item.condition = condition;
    if (status) item.status = status;
    if (pickupStatus) item.pickupStatus = pickupStatus;
    if (recyclingStatus) item.recyclingStatus = recyclingStatus;
    if (weightKg !== undefined) item.weightKg = Number(weightKg);
    if (notes !== undefined) item.notes = notes;

    // If status is being marked as Recycled, update recycling lifecycle
    if (status === 'Recycled' || recyclingStatus === 'Recycled') {
      item.status = 'Recycled';
      item.recyclingStatus = 'Recycled';
      if (item.pickupStatus === 'Pending') {
        item.pickupStatus = 'Picked Up';
      }
      // Credit owner's recycled kg in User document
      if (item.ownerId) {
        await User.findByIdAndUpdate(item.ownerId, {
          $inc: {
            recycledKg: Number(item.weightKg || 1.0),
            ecoPoints: 50,
          },
        });
      }
    }

    const updated = await item.save();

    return res.status(200).json({
      success: true,
      message: 'E-Waste item updated successfully.',
      object: updated,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin marks e-waste item as Recycled
 * @route   PUT /api/ewaste/object/:objectId/recycle
 * @access  Protected (Admin)
 */
export const recycleEwasteObject = async (req, res, next) => {
  try {
    const { objectId } = req.params;

    const item = await Ewaste.findOne({
      $or: [
        { objectId: new RegExp(`^${objectId.trim()}$`, 'i') },
        { itemId: new RegExp(`^${objectId.trim()}$`, 'i') },
      ],
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `E-Waste object '${objectId}' not found.`,
      });
    }

    item.status = 'Recycled';
    item.recyclingStatus = 'Recycled';
    if (item.pickupStatus === 'Pending') {
      item.pickupStatus = 'Picked Up';
    }

    const updated = await item.save();

    // Credit owner in MongoDB
    if (item.ownerId) {
      await User.findByIdAndUpdate(item.ownerId, {
        $inc: {
          recycledKg: Number(item.weightKg || 1.0),
          ecoPoints: 50,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: `E-Waste object ${item.objectId} marked as Recycled in MongoDB.`,
      object: updated,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get real-time statistics for current authenticated user calculated from MongoDB
 * @route   GET /api/ewaste/stats
 * @access  Protected (User)
 */
export const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Fetch user's registered e-waste objects
    const ewasteItems = await Ewaste.find({
      $or: [{ ownerId: userId }, { user: userId }],
    }).sort({ createdAt: -1 });

    // 2. Fetch user's pickups
    const pickups = await Pickup.find({
      $or: [{ user: userId }, { userPhone: req.user.phone }, { userName: req.user.name }],
    }).sort({ createdAt: -1 });

    // 3. User document for points
    const userDoc = await User.findById(userId);

    const totalRegistered = ewasteItems.length;
    const pendingCount = ewasteItems.filter(
      (item) => item.pickupStatus === 'Pending' || item.status === 'Registered'
    ).length;
    const pickedUpCount = ewasteItems.filter(
      (item) => item.pickupStatus === 'Picked Up' || item.status === 'Picked Up'
    ).length;
    const recycledCount = ewasteItems.filter(
      (item) => item.status === 'Recycled' || item.recyclingStatus === 'Recycled'
    ).length;

    // Calculate actual weights
    const totalWeightKg = Number(
      ewasteItems.reduce((sum, item) => sum + (Number(item.weightKg) || 1.0), 0).toFixed(1)
    );
    const recycledWeightKg = Number(
      ewasteItems
        .filter((item) => item.status === 'Recycled' || item.recyclingStatus === 'Recycled')
        .reduce((sum, item) => sum + (Number(item.weightKg) || 1.0), 0)
        .toFixed(1)
    );

    // CO2 saved: 0.75 kg CO2 per kg recycled (or for picked up if in progress)
    const effectiveRecycledWeight = recycledWeightKg > 0 ? recycledWeightKg : (pickedUpCount * 1.5);
    const co2SavedKg = Number((effectiveRecycledWeight * 0.75).toFixed(1));

    const ecoPoints = userDoc?.ecoPoints ?? 100;

    // Dynamic green level tier
    let greenLevel = 'Eco Novice';
    if (ecoPoints >= 5000 || recycledCount >= 20) {
      greenLevel = 'Eco Legend';
    } else if (ecoPoints >= 2000 || recycledCount >= 10) {
      greenLevel = 'Eco Champion';
    } else if (ecoPoints >= 1000 || recycledCount >= 5) {
      greenLevel = 'Eco Hero';
    } else if (ecoPoints >= 500 || recycledCount >= 2) {
      greenLevel = 'Eco Warrior';
    } else if (ecoPoints >= 200 || recycledCount >= 1) {
      greenLevel = 'Eco Starter';
    }

    // Real activity combining e-waste and pickups
    const activity = [];
    ewasteItems.forEach((ew) => {
      activity.push({
        id: ew.objectId || ew.itemId,
        type: 'ewaste',
        title: `${ew.type} (${ew.objectId})`,
        status: ew.status,
        pickupStatus: ew.pickupStatus,
        date: ew.createdAt,
        ecoPoints: ew.aiConfidence ? Math.round(ew.aiConfidence * 0.5) : 50,
      });
    });

    pickups.forEach((p) => {
      activity.push({
        id: p.trackingId || p._id,
        type: 'pickup',
        title: `Doorstep Pickup: ${p.item}`,
        status: p.status,
        date: p.pickupDate || p.createdAt,
        ecoPoints: p.pointsAwarded || 100,
      });
    });

    activity.sort((a, b) => new Date(b.date) - new Date(a.date));

    const statsData = {
      totalRegistered,
      pendingCount,
      pickedUpCount,
      recycledCount,
      totalWeightKg,
      recycledWeightKg,
      co2SavedKg,
      ecoPoints,
      greenLevel,
    };

    return res.status(200).json({
      success: true,
      stats: statsData,
      data: statsData,
      recentActivity: activity.slice(0, 6),
      items: ewasteItems,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get master admin dashboard statistics calculated directly from MongoDB
 * @route   GET /api/ewaste/stats/admin
 * @access  Protected (Admin)
 */
export const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalDelivery,
      totalAdmins,
      allEwaste,
      allPickups,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'delivery' }),
      User.countDocuments({ role: 'admin' }),
      Ewaste.find().sort({ createdAt: -1 }),
      Pickup.find().sort({ createdAt: -1 }),
    ]);

    const totalEwaste = allEwaste.length;
    const pendingPickups = allEwaste.filter(
      (e) => e.pickupStatus === 'Pending' || e.status === 'Registered'
    ).length;
    const pickedUpCount = allEwaste.filter(
      (e) => e.pickupStatus === 'Picked Up' || e.status === 'Picked Up'
    ).length;
    const recycledCount = allEwaste.filter(
      (e) => e.status === 'Recycled' || e.recyclingStatus === 'Recycled'
    ).length;

    const totalKg = Number(
      allEwaste.reduce((sum, item) => sum + (Number(item.weightKg) || 1.0), 0).toFixed(1)
    );
    const recycledKg = Number(
      allEwaste
        .filter((e) => e.status === 'Recycled' || e.recyclingStatus === 'Recycled')
        .reduce((sum, item) => sum + (Number(item.weightKg) || 1.0), 0)
        .toFixed(1)
    );

    const totalCo2 = Number(((recycledKg > 0 ? recycledKg : pickedUpCount * 1.5) * 0.75).toFixed(1));

    const adminStatsData = {
      totalUsers,
      totalDelivery,
      deliveryAgents: totalDelivery,
      totalAdmins,
      totalEwaste,
      pendingPickups,
      pickedUpCount,
      recycledCount,
      totalWeightKg: totalKg,
      recycledWeightKg: recycledKg,
      totalCo2,
      totalCo2SavedKg: totalCo2,
    };

    return res.status(200).json({
      success: true,
      stats: adminStatsData,
      data: adminStatsData,
      recentEwaste: allEwaste.slice(0, 10),
      recentPickups: allPickups.slice(0, 10),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete e-waste item
 * @route   DELETE /api/ewaste/:id
 * @access  Protected / Admin
 */
export const deleteEwaste = async (req, res, next) => {
  try {
    let item = null;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      item = await Ewaste.findById(req.params.id);
    }
    if (!item) {
      item = await Ewaste.findOne({
        $or: [{ objectId: req.params.id }, { itemId: req.params.id }],
      });
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'E-Waste item not found.',
      });
    }

    await Ewaste.findByIdAndDelete(item._id);

    return res.status(200).json({
      success: true,
      message: 'E-Waste item removed from database.',
    });
  } catch (error) {
    next(error);
  }
};
