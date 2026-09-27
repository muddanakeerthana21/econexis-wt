import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, college, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    // Public registration MUST ALWAYS create a user with role 'user'
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'user',
      phone: phone || '+91 98765 00000',
      college: college || 'National Institute of Technology',
      address: address || 'Campus Residence',
      ecoPoints: 100,
      recycledKg: 0,
      co2SavedKg: 0,
      greenLevel: 'Eco Novice',
      status: 'Active',
    });

    const roleFormatted = (user.role || 'user').toUpperCase();
    const token = generateToken(user._id, roleFormatted);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: roleFormatted,
        phone: user.phone,
        college: user.college,
        address: user.address,
        ecoPoints: user.ecoPoints,
        recycledKg: user.recycledKg,
        co2SavedKg: user.co2SavedKg,
        greenLevel: user.greenLevel,
        status: user.status,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    // Find user and explicitly select password field
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact the administrator.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const roleFormatted = (user.role || 'user').toUpperCase();
    const token = generateToken(user._id, roleFormatted);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: roleFormatted,
        phone: user.phone,
        college: user.college,
        address: user.address,
        department: user.department,
        vehicleNumber: user.vehicleNumber,
        assignedArea: user.assignedArea,
        ecoPoints: user.ecoPoints,
        recycledKg: user.recycledKg,
        co2SavedKg: user.co2SavedKg,
        greenLevel: user.greenLevel,
        status: user.status,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    const roleFormatted = (user.role || 'user').toUpperCase();

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: roleFormatted,
        phone: user.phone,
        college: user.college,
        address: user.address,
        department: user.department,
        vehicleNumber: user.vehicleNumber,
        assignedArea: user.assignedArea,
        ecoPoints: user.ecoPoints,
        recycledKg: user.recycledKg,
        co2SavedKg: user.co2SavedKg,
        greenLevel: user.greenLevel,
        status: user.status,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, college, address, department, vehicleNumber, assignedArea } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (college) user.college = college.trim();
    if (address) user.address = address.trim();
    if (department) user.department = department.trim();
    if (vehicleNumber) user.vehicleNumber = vehicleNumber.trim();
    if (assignedArea) user.assignedArea = assignedArea.trim();

    const updatedUser = await user.save();
    const roleFormatted = (updatedUser.role || 'user').toUpperCase();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: roleFormatted,
        phone: updatedUser.phone,
        college: updatedUser.college,
        address: updatedUser.address,
        department: updatedUser.department,
        vehicleNumber: updatedUser.vehicleNumber,
        assignedArea: updatedUser.assignedArea,
        ecoPoints: updatedUser.ecoPoints,
        recycledKg: updatedUser.recycledKg,
        co2SavedKg: updatedUser.co2SavedKg,
        greenLevel: updatedUser.greenLevel,
        status: updatedUser.status,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match.',
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
