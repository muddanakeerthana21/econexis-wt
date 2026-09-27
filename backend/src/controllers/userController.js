import User from '../models/User.js';

/**
 * @desc    Get all users with optional filtering
 * @route   GET /api/users
 * @access  Public / Admin
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const query = {};

    if (role && role !== 'All') {
      query.role = role.toLowerCase();
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Public / Protected
 */
export const getUserById = async (req, res, next) => {
  try {
    const isAdmin = (req.user?.role || '').toLowerCase() === 'admin';
    // Normal users can only access their own user profile; Admin can access any
    if (req.user && !isAdmin && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to view another user profile.',
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new user (Admin registry)
 * @route   POST /api/users
 * @access  Admin
 */
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, college, address, ecoPoints, recycledKg } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least a name and email.',
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password || 'Password123',
      role: role ? role.toLowerCase().trim() : 'user',
      phone: phone || '+91 98765 00000',
      college: college || 'National Institute of Technology',
      address: address || 'Campus Residence',
      ecoPoints: Number(ecoPoints) || 100,
      recycledKg: Number(recycledKg) || 0,
      status: 'Active',
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user details / grant points / toggle status
 * @route   PUT /api/users/:id
 * @access  Admin or Self (restricted fields)
 */
export const updateUser = async (req, res, next) => {
  try {
    const isSelf = req.user && req.user._id.toString() === req.params.id;
    const isAdmin = (req.user?.role || '').toLowerCase() === 'admin';

    if (!isAdmin && !isSelf) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to update this user profile.',
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const {
      name,
      email,
      phone,
      college,
      address,
      department,
      vehicleNumber,
      assignedArea,
      role,
      ecoPoints,
      recycledKg,
      co2SavedKg,
      greenLevel,
      status,
    } = req.body;

    if (name) user.name = name.trim();
    if (phone) user.phone = phone;
    if (college) user.college = college;
    if (address) user.address = address;
    if (department) user.department = department;
    if (vehicleNumber) user.vehicleNumber = vehicleNumber;
    if (assignedArea) user.assignedArea = assignedArea;

    // Only Admin can change email, role, ecoPoints, recycledKg, status
    if (isAdmin) {
      if (email) user.email = email.toLowerCase().trim();
      if (role) user.role = role.toLowerCase().trim();
      if (ecoPoints !== undefined) user.ecoPoints = Number(ecoPoints);
      if (recycledKg !== undefined) user.recycledKg = Number(recycledKg);
      if (co2SavedKg !== undefined) user.co2SavedKg = Number(co2SavedKg);
      if (greenLevel) user.greenLevel = greenLevel;
      if (status) user.status = status;
    }

    const updated = await user.save();

    return res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Admin
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
