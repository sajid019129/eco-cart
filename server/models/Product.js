const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
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
    default: null,
    min: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  stock: {
    type: Number,
    required: true,
    default: 1,
    min: 0
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  images: [{
    type: String
  }],
  condition: {
    type: String,
    enum: ['Like New', 'Gently Used', 'Heavily Used', 'Brand New'],
    default: 'Gently Used'
  }
},
{ timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);