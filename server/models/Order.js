const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  buyer: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    location: { type: String, required: true }
  },
  seller: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    location: { type: String, required: true }
  },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      title: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true }
    }
  ],
  subtotal: { type: Number, required: true },
  shippingFee: { type: Number, default: 70 },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['Digital', 'COD'], required: true },
  paymentDetails: {
    provider: { type: String, default: '' }, // e.g., 'bKash' or 'Nagad'
    accountNumber: { type: String, default: '' },
    trxId: { type: String, default: '' }
  },
  orderStatus: {
    type: String,
    enum: [
      'Order Placed',
      'Seller Started Packing',
      'Product Packed',
      'Handed to Logistics',
      'Arrived at Facility',
      'Out for Delivery',
      'Delivered'
    ],
    default: 'Order Placed'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);