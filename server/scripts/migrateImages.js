require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const Listing = require('../models/Listing');

const IMGBB_API_KEY = '9e0b659b1a042f21ef4c2b88b9e3901d';

// Helper function to upload image to ImgBB
async function uploadToImgBB(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const formData = new FormData();
    formData.append('image', imageBuffer, path.basename(imagePath));
    
    const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
      params: {
        key: IMGBB_API_KEY
      },
      headers: formData.getHeaders()
    });

    return response.data.data.url;
  } catch (error) {
    console.error('Error uploading to ImgBB:', error);
    return null;
  }
}

async function migrateImages() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    // Get all listings
    const listings = await Listing.find({});
    console.log(`Found ${listings.length} listings to process`);

    // Process each listing
    for (const listing of listings) {
      console.log(`\nProcessing listing: ${listing.title}`);
      const newImageUrls = [];

      // Process each image in the listing
      for (const imagePath of listing.images) {
        if (imagePath.startsWith('http')) {
          console.log('Image is already a URL, skipping:', imagePath);
          newImageUrls.push(imagePath);
          continue;
        }

        console.log('Processing image:', imagePath);
        try {
          // Check if the image file exists
          const fullPath = path.join(__dirname, '..', imagePath);
          if (fs.existsSync(fullPath)) {
            const imgbbUrl = await uploadToImgBB(fullPath);
            if (imgbbUrl) {
              console.log('Successfully uploaded to ImgBB:', imgbbUrl);
              newImageUrls.push(imgbbUrl);
            } else {
              console.error('Failed to upload image to ImgBB');
            }
          } else {
            console.error('Image file not found:', fullPath);
          }
        } catch (error) {
          console.error('Error processing image:', error);
        }
      }

      // Update listing with new image URLs
      if (newImageUrls.length > 0) {
        listing.images = newImageUrls;
        await listing.save();
        console.log('Updated listing with new image URLs');
      }
    }

    console.log('\nMigration completed!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateImages(); 