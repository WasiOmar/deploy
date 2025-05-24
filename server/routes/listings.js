const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Listing = require('../models/Listing');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    // Create the uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Get all listings
router.get('/', async (req, res) => {
  try {
    const listings = await Listing.find()
      .sort({ createdAt: -1 })
      .populate('user', 'firstName lastName email'); // Add this to get user details
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching listings' });
  }
});

// Get a specific listing
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('user', 'firstName lastName email university department phone bio');
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching listing' });
  }
});

// Create a new listing
router.post('/create', auth, upload.array('images', 5), async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    console.log('Received files:', req.files);
    console.log('Authenticated user:', req.user);

    const imageFiles = req.files;
    const imagePaths = imageFiles ? imageFiles.map(file => file.path) : [];

    // Validate required fields
    const requiredFields = ['title', 'description', 'price', 'category', 'condition'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    // Parse meetup location if provided
    let meetupLocation = null;
    if (req.body.meetupLocation) {
      try {
        meetupLocation = JSON.parse(req.body.meetupLocation);
        // Validate meetup location format
        if (!meetupLocation.lat || !meetupLocation.lng) {
          return res.status(400).json({ error: 'Invalid meetup location format' });
        }
      } catch (err) {
        return res.status(400).json({ error: 'Invalid meetup location data' });
      }
    }

    const listing = new Listing({
      user: req.user.id, // Set the authenticated user's ID
      title: req.body.title,
      description: req.body.description,
      price: parseFloat(req.body.price),
      category: req.body.category,
      condition: req.body.condition,
      location: req.body.location,
      meetupLocation: meetupLocation,
      images: imagePaths
    });

    await listing.save();
    res.status(201).json(listing);
  } catch (err) {
    console.error('Error creating listing:', err);
    res.status(400).json({ error: err.message });
  }
});

// Update a listing
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Check if user is the seller or an admin
    if (listing.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized to update this listing' });
    }

    // Handle new images if uploaded
    const imageFiles = req.files;
    let imagePaths = listing.images; // Keep existing images
    if (imageFiles && imageFiles.length > 0) {
      const newImagePaths = imageFiles.map(file => file.path);
      imagePaths = [...imagePaths, ...newImagePaths];
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        description: req.body.description,
        price: parseFloat(req.body.price),
        category: req.body.category,
        condition: req.body.condition,
        images: imagePaths,
        status: req.body.status,
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('user', 'firstName lastName email');

    res.json(updatedListing);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update listing approval status
router.patch('/:id/approval', auth, admin, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    listing.approved = req.body.approved;
    await listing.save();

    const updatedListing = await Listing.findById(req.params.id)
      .populate('user', 'firstName lastName email');
    
    res.json(updatedListing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a listing
router.delete('/:id', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Check if user is the seller or an admin
    if (listing.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this listing' });
    }

    // Delete associated images
    listing.images.forEach(imagePath => {
      try {
        fs.unlinkSync(imagePath);
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    });

    await listing.deleteOne();
    res.json({ message: 'Listing deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 