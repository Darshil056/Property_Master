const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Property = require('../models/Property');
const authenticateToken = require('../middleware/auth');

// --- Multer Setup ---
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed.'), false);
  },
});

// GET /api/properties  (public - no auth needed)
router.get('/', async (req, res) => {
  try {
    const { listing_type, property_group, search, is_new_launch } = req.query;
    let filter = {};

    // Filter by listing type
    if (listing_type) {
      filter.listing_type = listing_type;
    }

    // Filter by property group
    if (property_group) {
      const group = property_group.toLowerCase();
      if (group === 'residential') {
        filter.property_type = 'Residential House';
      } else if (group === 'commercial') {
        filter.property_type = { $in: ['Commercial Office', 'Commercial Shop', 'Commercial Land'] };
      } else if (group === 'plot/land') {
        filter.property_type = { $in: ['Residential Plot/Land', 'Commercial Land'] };
      }
    }

    // Filter new launches
    if (is_new_launch === 'true') {
      filter.is_new_launch = true;
    }

    // Text search (city, state, address, description)
    if (search) {
      filter.$text = { $search: search };
    }

    const properties = await Property.find(filter).sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// POST /api/properties/upload  (protected - upload images first)
router.post('/upload', authenticateToken, upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No images uploaded.' });
  }

  const imageUrls = req.files.map(
    (file) => `http://localhost:5000/uploads/${file.filename}`
  );

  res.json({ image_urls: imageUrls });
});

// POST /api/properties  (protected - create listing)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      listing_type, property_type, city, state, address,
      area_sqft, bhk, price, description, contact_number,
      image_urls, is_new_launch,
    } = req.body;

    const property = new Property({
      user_id: req.user.id,
      listing_type,
      property_type,
      city,
      state,
      address,
      area_sqft: parseFloat(area_sqft),
      bhk: bhk ? parseInt(bhk) : null,
      price: parseFloat(price),
      description,
      contact_number,
      image_urls: image_urls || [],
      is_new_launch: is_new_launch || false,
    });

    await property.save();
    res.status(201).json({ message: 'Property listed successfully!', property });
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

module.exports = router;
