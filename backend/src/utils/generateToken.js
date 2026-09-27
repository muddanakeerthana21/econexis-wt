import jwt from 'jsonwebtoken';

/**
 * Generate a signed JWT token
 * @param {string} id - User MongoDB ID
 * @param {string} role - User role (USER, ADMIN, DELIVERY)
 * @returns {string} Signed JWT token
 */
const generateToken = (id, role = 'USER') => {
  return jwt.sign(
    { id, role: (role || 'USER').toUpperCase() },
    process.env.JWT_SECRET || 'econexis_jwt_super_secure_secret_key_2026_jwt_token_auth',
    {
      expiresIn: '30d',
    }
  );
};

export default generateToken;
