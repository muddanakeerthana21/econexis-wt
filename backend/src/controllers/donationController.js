import Donation from '../models/Donation.js';
import User from '../models/User.js';

/**
 * @desc    Get all donations
 * @route   GET /api/donations
 * @access  Public / Protected
 */
export const getDonations = async (req, res, next) => {
  try {
    const { category, status, search } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (req.user && (req.user.role || '').toUpperCase() === 'USER') {
      query.$or = [{ user: req.user._id }, { userName: req.user.name }];
    }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          {
            $or: [
              { donationId: searchRegex },
              { itemName: searchRegex },
              { item: searchRegex },
              { userName: searchRegex },
            ],
          },
        ];
        delete query.$or;
      } else {
        query.$or = [
          { donationId: searchRegex },
          { itemName: searchRegex },
          { item: searchRegex },
          { userName: searchRegex },
        ];
      }
    }

    const donations = await Donation.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: donations.length,
      data: donations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get donation by ID
 * @route   GET /api/donations/:id
 * @access  Public / Protected
 */
export const getDonationById = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation record not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: donation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit new donation pledge
 * @route   POST /api/donations
 * @access  Public / Protected
 */
export const createDonation = async (req, res, next) => {
  try {
    const {
      userName,
      item,
      itemName,
      category,
      quantity,
      condition,
      description,
      deliveryMethod,
      beneficiaryOption,
      status,
    } = req.body;

    const deviceItem = item || itemName;
    if (!deviceItem) {
      return res.status(400).json({
        success: false,
        message: 'Please provide item name & model for donation.',
      });
    }

    const donation = await Donation.create({
      user: req.user?._id || undefined,
      userName: userName || req.user?.name || 'Eco Contributor',
      item: deviceItem,
      category: category || 'Smartphones',
      quantity: quantity || 1,
      condition: condition || 'Fully Functional',
      description: description || '',
      deliveryMethod: deliveryMethod || 'Doorstep Pickup',
      beneficiaryOption: beneficiaryOption || 'Underserved School Students',
      status: status || 'Received',
      ecoPointsAwarded: 150,
    });

    // Optionally credit donor's points if user is authenticated
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { ecoPoints: 150 },
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Donation registered successfully! +150 EcoPoints awarded.',
      data: donation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update donation status
 * @route   PUT /api/donations/:id
 * @access  Public / Admin
 */
export const updateDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation record not found.',
      });
    }

    const { status, condition, description, beneficiaryOption } = req.body;
    if (status) donation.status = status;
    if (condition) donation.condition = condition;
    if (description !== undefined) donation.description = description;
    if (beneficiaryOption) donation.beneficiaryOption = beneficiaryOption;

    const updated = await donation.save();

    return res.status(200).json({
      success: true,
      message: 'Donation record updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete donation record
 * @route   DELETE /api/donations/:id
 * @access  Admin
 */
export const deleteDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation record not found.',
      });
    }

    await Donation.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Donation record removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
