const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();  // Using router

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, university, department } = req.body;

  // Manual validation
  if (!firstName || !lastName || !email || !password || !university || !department) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Validate email format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please include a valid email' });
  }

  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user - password will be hashed by the pre-save hook
    user = new User({
      firstName,
      lastName,
      email,
      password, // Don't hash here, let the pre-save hook handle it
      university,
      department
    });

    // Save user to database
    await user.save();

    // Create JWT token
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          university: user.university,
          department: user.department
        }
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Manual validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Check if the user exists
    console.log('Attempting to find user with email:', email);
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('No user found with email:', email);
      return res.status(400).json({ error: 'Invalid credentials - user not found' });
    }

    console.log('User found, comparing passwords');
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password comparison failed');
      return res.status(400).json({ error: 'Invalid credentials - password mismatch' });
    }

    console.log('Password matched, generating token');
    // Create JWT token
    const payload = { 
      user: { 
        id: user.id,
        isAdmin: user.isAdmin 
      } 
    };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' }, (err, token) => {
      if (err) {
        console.error('Token generation error:', err);
        throw err;
      }
      console.log('Login successful for user:', user.email);
      res.json({
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          university: user.university,
          department: user.department,
          isAdmin: user.isAdmin
        }
      });
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
