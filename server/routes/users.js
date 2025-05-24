const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Listing = require('../models/Listing');
const Message = require('../models/Message');

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  auth,
  [
    check('firstName', 'First name is required').not().isEmpty(),
    check('lastName', 'Last name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { firstName, lastName, email, university, department, phone, bio } = req.body;

    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Update user fields
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      if (university) user.university = university;
      if (department) user.department = department;
      if (phone) user.phone = phone;
      if (bio) user.bio = bio;

      await user.save();

      res.json({
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          university: user.university,
          department: user.department,
          phone: user.phone,
          bio: user.bio
        }
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// @route   PUT api/users/password
// @desc    Update user password
// @access  Private
router.put(
  '/password',
  auth,
  [
    check('currentPassword', 'Current password is required').exists(),
    check('newPassword', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { currentPassword, newPassword } = req.body;

    try {
      const user = await User.findById(req.user.id).select('+password');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);

      await user.save();

      res.json({ message: 'Password updated successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// @route   DELETE api/users
// @desc    Delete user account
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.deleteOne();

    res.json({ message: 'User account deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET api/users/profile/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET api/users/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's listings count
    const listingsCount = await Listing.countDocuments({ user: req.user.id });
    
    // Get user's recent listings
    const recentListings = await Listing.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title price condition createdAt');

    // Get user's recent messages
    const recentMessages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }]
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('sender receiver', 'firstName lastName')
      .select('content createdAt');

    res.json({
      user,
      dashboard: {
        listingsCount,
        recentListings,
        recentMessages
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET api/users/search
// @desc    Search users by name, university, or department
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchRegex = new RegExp(query, 'i');
    const users = await User.find({
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { university: searchRegex },
        { department: searchRegex }
      ]
    })
      .select('-password')
      .limit(10);

    res.json({ users });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET api/users
// @desc    Get all users
// @access  Admin only
router.get('/', [auth, admin], async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT api/users/:id
// @desc    Update user
// @access  Admin only
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const { firstName, lastName, email, university, department, isAdmin } = req.body;
    
    // Build user object
    const userFields = {};
    if (firstName) userFields.firstName = firstName;
    if (lastName) userFields.lastName = lastName;
    if (email) userFields.email = email;
    if (university) userFields.university = university;
    if (department) userFields.department = department;
    if (typeof isAdmin === 'boolean') userFields.isAdmin = isAdmin;

    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Make sure admin is not updating themselves
    if (req.user.id === req.params.id) {
      return res.status(400).json({ error: 'Admin cannot update their own account through this endpoint' });
    }

    user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: userFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE api/users/:id
// @desc    Delete user
// @access  Admin only
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    console.log('Attempting to delete user:', req.params.id);
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Make sure admin is not deleting themselves
    if (req.user.id === req.params.id) {
      return res.status(400).json({ error: 'Admin cannot delete their own account through this endpoint' });
    }

    // Delete all listings by this user
    console.log('Deleting user listings...');
    await Listing.deleteMany({ user: req.params.id });

    // Delete all messages sent by or to this user
    console.log('Deleting user messages...');
    await Message.deleteMany({
      $or: [
        { sender: req.params.id },
        { receiver: req.params.id }
      ]
    });

    // Finally delete the user
    console.log('Deleting user...');
    await User.findByIdAndDelete(req.params.id);

    console.log('User and related data successfully deleted');
    res.json({ message: 'User and all related data removed successfully' });
  } catch (err) {
    console.error('Error in delete user route:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      userId: req.params.id
    });
    res.status(500).json({ 
      error: 'Server error', 
      details: err.message 
    });
  }
});

module.exports = router; 