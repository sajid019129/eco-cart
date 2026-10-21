const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  // Seller Account Fields
  isSeller: {
    type: Boolean,
    default: false
  },
  sellerAccounts: {
    bKash: { type: String, default: '' },
    nagad: { type: String, default: '' },
    upay: { type: String, default: '' },
    masterCard: { type: String, default: '' },
    bank: {
      bankName: { type: String, default: '' },
      accountNumber: { type: String, default: '' }
    }
  },
  registerOtp: {
    type: String,
    default: null
  },
  registerOtpExpires: {
    type: Date,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  resetOtp: {
    type: String,
    default: null
  },
  resetOtpExpires: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);