const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// POST /api/orders - Create a new order (from Cart or Buy Now)
router.post('/', async (req, res) => {
  try {
    const { buyerId, items, paymentMethod, paymentDetails, shippingAddress } = req.body;

    if (!buyerId || !items || items.length === 0) {
      return res.status(400).json({ error: 'Buyer ID and items are required.' });
    }

    const buyerUser = await User.findById(buyerId);
    if (!buyerUser) {
      return res.status(404).json({ error: 'Buyer not found.' });
    }

    let orderItems = [];
    let subtotal = 0;
    let sellerInfo = null;

    for (const cartItem of items) {
      const productDoc = await Product.findById(cartItem.productId || cartItem.product);
      if (!productDoc) {
        return res.status(404).json({ error: `Product not found: ${cartItem.productId || cartItem.product}` });
      }

      const sellerUser = productDoc.seller ? await User.findById(productDoc.seller) : null;
      
      sellerInfo = {
        userId: sellerUser ? sellerUser._id : null,
        name: productDoc.sellerName || (sellerUser ? (sellerUser.name || sellerUser.fullName) : 'Eco-Cart Seller'),
        email: productDoc.sellerEmail || (sellerUser ? sellerUser.email : 'seller@ecocart.com'),
        phone: productDoc.sellerPhone || (sellerUser ? (sellerUser.phone || sellerUser.phoneNumber) : '01700000000'),
        location: productDoc.location || productDoc.sellerAddress || (sellerUser ? (sellerUser.address || sellerUser.location) : 'Bangladesh')
      };

      const itemTotal = Number(productDoc.price) * Number(cartItem.quantity || 1);
      subtotal += itemTotal;

      orderItems.push({
        product: productDoc._id,
        title: productDoc.title,
        price: Number(productDoc.price),
        quantity: Number(cartItem.quantity || 1)
      });
    }

    const shippingFee = 70; // Eco-Cart All-BD Flat Rate
    const totalAmount = subtotal + shippingFee;

    const newOrder = new Order({
      buyer: {
        userId: buyerUser._id,
        name: buyerUser.name || buyerUser.fullName || 'Valued Buyer',
        email: buyerUser.email,
        phone: buyerUser.phone || buyerUser.phoneNumber || shippingAddress?.phone || '01800000000',
        location: shippingAddress?.location || buyerUser.address || buyerUser.location || 'Bangladesh'
      },
      seller: sellerInfo,
      items: orderItems,
      subtotal,
      shippingFee,
      totalAmount,
      paymentMethod: paymentMethod || 'COD',
      paymentDetails: paymentDetails || {},
      orderStatus: 'Order Placed'
    });

    await newOrder.save();

    res.status(201).json({
      message: 'Order created successfully!',
      order: newOrder
    });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Failed to create order', details: err.message });
  }
});

// GET /api/orders/track/:orderNumber - Track order by Order ID/Number
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const order = await Order.findOne({ orderNumber: orderNumber.trim().toUpperCase() });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found with this Order Number.' });
    }

    res.json(order);
  } catch (err) {
    console.error('Tracking error:', err);
    res.status(500).json({ error: 'Failed to track order', details: err.message });
  }
});

// GET /api/orders/:userId - Get all orders for a buyer or seller
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({
      $or: [{ 'buyer.userId': userId }, { 'seller.userId': userId }]
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
  }
});

// PUT /api/orders/:id/status - Update order tracking status
router.put('/:id/status', async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status', details: err.message });
  }
});

module.exports = router;