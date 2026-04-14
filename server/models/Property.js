const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  listing_type: {
    type: String,
    enum: ['Sell Property', 'Rent / Lease Property'],
    required: true,
  },
  property_type: {
    type: String,
    enum: ['Residential House', 'Residential Plot/Land', 'Commercial Office', 'Commercial Shop', 'Commercial Land', 'Other'],
    required: true,
  },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  area_sqft: { type: Number, required: true },
  bhk: { type: Number, default: null },
  price: { type: Number, required: true },
  description: { type: String, default: '' },
  contact_number: { type: String, required: true },
  image_urls: { type: [String], default: [] },
  is_new_launch: { type: Boolean, default: false },
}, { timestamps: true });

// Text index for search functionality
PropertySchema.index({ city: 'text', state: 'text', address: 'text', description: 'text' });

module.exports = mongoose.model('Property', PropertySchema);
