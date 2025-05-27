const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Listing = require('../models/Listing');

// Configure multer for temporary storage
const storage = multer.memoryStorage();
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

// Helper function to upload image to ImgBB
async function uploadToImgBB(imageBuffer, filename) {
  try {
    const formData = new FormData();
    formData.append('image', imageBuffer, filename);
    
    const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
      params: {
        key: '9e0b659b1a042f21ef4c2b88b9e3901d'
      },
      headers: formData.getHeaders()
    });

    return response.data.data.url;
  } catch (error) {
    console.error('Error uploading to ImgBB:', error);
    throw new Error('Failed to upload image');
  }
}

// Get all listings
router.get('/', async (req, res) => {
  try {
    const { limit, approved } = req.query;
    
    // Build query
    const query = {};
    if (approved === 'true') {
      query.approved = true;
    }

    // Build database query
    let listingsQuery = Listing.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'firstName lastName email');

    // Apply limit if specified
    if (limit) {
      listingsQuery = listingsQuery.limit(parseInt(limit));
    }

    const listings = await listingsQuery;
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

    // Upload images to ImgBB
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const imageUrl = await uploadToImgBB(file.buffer, file.originalname);
        imageUrls.push(imageUrl);
      }
    }

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
        if (!meetupLocation.lat || !meetupLocation.lng) {
          return res.status(400).json({ error: 'Invalid meetup location format' });
        }
      } catch (err) {
        return res.status(400).json({ error: 'Invalid meetup location data' });
      }
    }

    const listing = new Listing({
      user: req.user.id,
      title: req.body.title,
      description: req.body.description,
      price: parseFloat(req.body.price),
      category: req.body.category,
      condition: req.body.condition,
      location: req.body.location,
      meetupLocation: meetupLocation,
      images: imageUrls // Store ImgBB URLs instead of local paths
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
    let imageUrls = listing.images; // Keep existing images
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const imageUrl = await uploadToImgBB(file.buffer, file.originalname);
        imageUrls.push(imageUrl);
      }
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        description: req.body.description,
        price: parseFloat(req.body.price),
        category: req.body.category,
        condition: req.body.condition,
        images: imageUrls,
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

    // Note: We can't delete images from ImgBB with the free API
    // The images will remain on ImgBB but will be removed from our database

    await listing.deleteOne();
    res.json({ message: 'Listing deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 