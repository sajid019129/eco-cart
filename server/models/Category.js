const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    enum: [
      'Medicine', 
      'Food', 
      'Electronics (Phone/Laptop)', 
      'Electronics', 
      'Stationery', 
      'Books', 
      'Miscellaneous'
    ]
  },
  description: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);