const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Listing = require('../models/Listing');
const Message = require('../models/Message');
const mongoose = require('mongoose');
const upload = require('../middleware/upload');
const axios = require('axios');

// Function to upload image to imgbb
const uploadToImgbb = async (buffer) => {
  try {
    // Ensure buffer is valid
    if (!buffer || !Buffer.isBuffer(buffer)) {
      throw new Error('Invalid buffer provided');
    }

    // Convert buffer to base64 and properly encode it for URL
    const base64str = buffer.toString('base64');
    const encodedImage = encodeURIComponent(base64str);
    const apiKey = '9e0b659b1a042f21ef4c2b88b9e3901d';
    const apiUrl = 'https://api.imgbb.com/1/upload';

    console.log('Preparing to upload to imgbb...');
    console.log('Buffer size:', buffer.length);
    console.log('Base64 string length:', base64str.length);

    const response = await axios({
      method: 'post',
      url: apiUrl,
      data: `key=${apiKey}&image=${encodedImage}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      maxBodyLength: Infinity
    });

    console.log('ImgBB API Response:', response.data);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Upload failed');
    }

    return response.data.data.url;
  } catch (error) {
    console.error('ImgBB Upload Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || error.message || 'Failed to upload image');
  }
};

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
    console.error('Error in profile route:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: 'User not found - Invalid ID format' });
    }
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// @route   PUT api/users/profile/:id
// @desc    Update user profile
// @access  Private
router.put('/profile/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is updating their own profile
    if (req.user.id !== req.params.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST api/users/profile/:id/upload
// @desc    Upload profile picture
// @access  Private
router.post('/profile/:id/upload', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    // Check if user is uploading to their own profile
    if (req.user.id !== req.params.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a file' });
    }

    // Validate file type
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'File must be an image' });
    }

    // Log detailed file information
    console.log('File received:', {
      mimetype: req.file.mimetype,
      size: req.file.size,
      bufferLength: req.file.buffer.length,
      originalName: req.file.originalname
    });

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate buffer
    if (!req.file.buffer || !Buffer.isBuffer(req.file.buffer)) {
      return res.status(400).json({ error: 'Invalid file buffer' });
    }

    // Upload image to imgbb
    const imageUrl = await uploadToImgbb(req.file.buffer);
    console.log('Image uploaded successfully:', imageUrl);

    // Update user's profile picture URL
    user.profilePicture = imageUrl;
    await user.save();

    res.json({
      success: true,
      data: user.profilePicture
    });
  } catch (err) {
    console.error('Profile picture upload error:', err);
    res.status(500).json({ 
      error: err.message || 'Server error',
      details: err.response?.data?.error || err.response?.data || {}
    });
  }
});

// @route   PUT api/users/password
// @desc    Update user password
// @access  Private
router.put('/password', auth, [
  check('currentPassword', 'Current password is required').exists(),
  check('newPassword', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
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
// @desc    Get all users (admin only)
// @access  Admin
router.get('/', [auth, admin], async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE api/users/:id
// @desc    Delete user (admin only)
// @access  Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Make sure admin is not deleting themselves
    if (req.user.id === req.params.id) {
      return res.status(400).json({ error: 'Admin cannot delete their own account through this endpoint' });
    }

    // Delete all listings by this user
    await Listing.deleteMany({ user: req.params.id });

    // Delete all messages sent by or to this user
    await Message.deleteMany({
      $or: [
        { sender: req.params.id },
        { receiver: req.params.id }
      ]
    });

    // Finally delete the user
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User and all related data removed successfully' });
  } catch (err) {
    console.error('Error in delete user route:', err);
    res.status(500).json({ 
      error: 'Server error', 
      details: err.message 
    });
  }
});

module.exports = router; 