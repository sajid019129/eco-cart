const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true,
    default: () => `ECO-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`
  },
  isDonationOrder: {
    type: Boolean,
    default: false,
    index: true
  },
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
  paymentMethod: { type: String, required: true },
  paymentDetails: {
    provider: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    trxId: { type: String, default: '' }
  },
  orderStatus: {
    type: String,
    default: 'Order Placed'
  },
  logisticsSteps: {
    collectedFromSeller: { type: Boolean, default: false },
    shipped: { type: Boolean, default: false },
    reachedWarehouse: { type: Boolean, default: false },
    reachedHub: { type: Boolean, default: false },
    outForDelivery: { type: Boolean, default: false },
    delivered: { type: Boolean, default: false },
    failed: { type: Boolean, default: false },
    failureReason: { type: String, default: '' }
  },
  completedMilestones: { type: [String], default: [] },
  isCancelled: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);