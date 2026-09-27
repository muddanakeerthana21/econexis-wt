import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect routes: Verify Bearer JWT Token
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided. Please log in.',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'econexis_jwt_super_secure_secret_key_2026_jwt_token_auth'
    );

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
      });
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({
        success: false,
        message: 'This account has been suspended. Please contact admin.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.warn('[AuthMiddleware] Token verification failed:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, invalid or expired token.',
    });
  }
};

/**
 * Optional authentication: Attach req.user if valid token provided, but do not block if absent
 */
export const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'econexis_jwt_super_secure_secret_key_2026_jwt_token_auth'
    );

    const user = await User.findById(decoded.id).select('-password');
    if (user && user.status !== 'Suspended') {
      req.user = user;
    }
  } catch (error) {
    // Non-blocking for optional auth
  }

  next();
};

/**
 * Grant access to specific roles (ADMIN, DELIVERY, USER)
 */
export const authorize = (...roles) => {
  const normalizedRoles = roles.map((r) => r.toUpperCase());
  return (req, res, next) => {
    const userRole = (req.user?.role || '').toUpperCase();
    if (!req.user || !normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${userRole || 'UNKNOWN'}' is not authorized to access this resource. Required role(s): ${roles.map(r => r.toUpperCase()).join(', ')}`,
      });
    }
    next();
  };
};

