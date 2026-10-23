const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Can be 'buyer', 'seller', 'delivery', or specific user email/ID string
  recipientRole: {
    type: String,
    enum: ['buyer', 'seller', 'delivery'],
    default: 'buyer'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  orderNumber: {
    type: String,
    default: ''
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: false
  },
  type: {
    type: String,
    enum: ['invoice', 'payment', 'milestone', 'system'],
    default: 'system'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);