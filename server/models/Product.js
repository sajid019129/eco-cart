const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true // Added index for fast search queries
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    default: null
  },
  condition: {
    type: String,
    default: ''
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true // PERFORMANCE FIX: Index category for instant filter lookups
  },
  stock: {
    type: Number,
    default: 1,
    min: 0
  },
  images: [{
    type: String
  }],
  image: {
    type: String,
    default: ''
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  ecoRating: {
    type: Number,
    default: 5,
    min: 1,
    max: 5
  },
  ecoTags: [{
    type: String
  }]
}, { timestamps: true });

// PERFORMANCE FIX: Compound index for sorting products instantly by creation date
ProductSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', ProductSchema);