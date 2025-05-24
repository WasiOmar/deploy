const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('isAdmin');
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    
    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}; 