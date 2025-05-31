const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
const auth = async (req, res, next) => {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Check if no token
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Handle both payload structures (with user object or direct id)
    const userId = decoded.user ? decoded.user.id : decoded.id;

    // Get user from the token
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

module.exports = auth; 