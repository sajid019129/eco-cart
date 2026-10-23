const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Notification = require('../models/Notification');

// GET /api/orders/all - Get all orders in the system (for Logistics Dashboard)
router.get('/all', async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Error fetching all orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
  }
});

// POST /api/orders - Create a new order (from Cart or Buy Now)
router.post('/', async (req, res) => {
  try {
    const { buyerId, items, paymentMethod, paymentDetails, shippingAddress, isBuyNow } = req.body;

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
    let sellerUserDoc = null;

    for (const cartItem of items) {
      const productId = cartItem.productId || cartItem.product?._id || cartItem.product;
      const quantityOrdered = Number(cartItem.quantity || 1);

      const productDoc = await Product.findById(productId);
      if (!productDoc) {
        return res.status(404).json({ error: `Product not found: ${productId}` });
      }

      sellerUserDoc = productDoc.seller ? await User.findById(productDoc.seller) : null;
      
      sellerInfo = {
        userId: sellerUserDoc ? sellerUserDoc._id : null,
        name: productDoc.sellerName || (sellerUserDoc ? (sellerUserDoc.name || sellerUserDoc.fullName) : 'Eco-Cart Seller'),
        email: productDoc.sellerEmail || (sellerUserDoc ? sellerUserDoc.email : 'seller@ecocart.com'),
        phone: productDoc.sellerPhone || (sellerUserDoc ? (sellerUserDoc.phone || sellerUserDoc.phoneNumber) : '01700000000'),
        location: productDoc.location || productDoc.sellerAddress || (sellerUserDoc ? (sellerUserDoc.address || sellerUserDoc.location) : 'Bangladesh')
      };

      const itemTotal = Number(productDoc.price) * quantityOrdered;
      subtotal += itemTotal;

      orderItems.push({
        product: productDoc._id,
        title: productDoc.title,
        price: Number(productDoc.price),
        quantity: quantityOrdered
      });

      if (isBuyNow) {
        const currentStock = Number(productDoc.stock ?? productDoc.stockAvailable ?? 100);
        if (currentStock < quantityOrdered) {
          return res.status(400).json({ error: `Insufficient stock for ${productDoc.title}. Available: ${currentStock}` });
        }
        productDoc.stock = Math.max(0, currentStock - quantityOrdered);
        await productDoc.save();
      }
    }

    const shippingFee = 70; // Eco-Cart All-BD Flat Rate
    const totalAmount = subtotal + shippingFee;

    const resolvedPaymentMethod = paymentMethod || paymentDetails?.provider || 'COD';

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
      paymentMethod: resolvedPaymentMethod,
      paymentDetails: paymentDetails || {},
      orderStatus: 'Order Placed',
      completedMilestones: []
    });

    await newOrder.save();

    // If it was a Cart checkout, clear user's cart from database
    if (!isBuyNow) {
      await Cart.deleteMany({ $or: [{ user: buyerId }, { buyer: buyerId }] });
    }

    // --- AUTOMATED NOTIFICATION TRIGGERS ---
    try {
      const buyerName = newOrder.buyer.name;
      const sellerName = newOrder.seller.name;
      const orderNum = newOrder.orderNumber;
      const provider = paymentDetails?.provider || resolvedPaymentMethod;
      const checkoutAccount = paymentDetails?.accountNumber || '';

      // 1. Invoice Notifications
      await Notification.create({
        recipient: buyerUser._id,
        recipientRole: 'buyer',
        title: `Order Placed (${orderNum}) 📦`,
        message: `You placed order ${orderNum}. Here is the invoice.`,
        orderNumber: orderNum,
        orderId: newOrder._id,
        type: 'invoice'
      });

      if (sellerInfo.userId) {
        await Notification.create({
          recipient: sellerInfo.userId,
          recipientRole: 'seller',
          title: `Product Sold (${orderNum}) 💰`,
          message: `Your product got sold for order ${orderNum}. Check the invoice.`,
          orderNumber: orderNum,
          orderId: newOrder._id,
          type: 'invoice'
        });
      }

      // 2. Payment Notifications
      if (['bKash', 'Nagad', 'Upay', 'MasterCard', 'Digital'].includes(provider)) {
        const regAccount = sellerUserDoc && sellerUserDoc.sellerAccounts 
          ? (sellerUserDoc.sellerAccounts[provider.toLowerCase()] || sellerUserDoc.sellerAccounts.masterCard || 'Registered Account')
          : 'Registered Account';

        await Notification.create({
          recipient: buyerUser._id,
          recipientRole: 'buyer',
          title: `${provider} Payment Sent 💸`,
          message: `You (${provider} Account: ${checkoutAccount || 'Checkout Account'}) sent ৳${totalAmount} to seller ${sellerName} (${provider} Account: ${regAccount}) for order ${orderNum}.`,
          orderNumber: orderNum,
          orderId: newOrder._id,
          type: 'payment'
        });

        if (sellerInfo.userId) {
          await Notification.create({
            recipient: sellerInfo.userId,
            recipientRole: 'seller',
            title: `${provider} Payment Received 💵`,
            message: `You received ৳${totalAmount} in your ${provider} Account (${regAccount}) from buyer ${buyerName} (${provider} Account: ${checkoutAccount || 'Buyer Account'}) for order ${orderNum}.`,
            orderNumber: orderNum,
            orderId: newOrder._id,
            type: 'payment'
          });
        }
      } else {
        const bankName = sellerUserDoc?.sellerAccounts?.bank?.bankName || 'Eco-Cart Partner Bank';
        const bankAcc = sellerUserDoc?.sellerAccounts?.bank?.accountNumber || 'Bank Account Number';

        await Notification.create({
          recipient: buyerUser._id,
          recipientRole: 'buyer',
          title: `COD Order Placed 💵`,
          message: `Please keep ৳${totalAmount} ready before the delivery man arrives for order ${orderNum}.`,
          orderNumber: orderNum,
          orderId: newOrder._id,
          type: 'payment'
        });

        if (sellerInfo.userId) {
          await Notification.create({
            recipient: sellerInfo.userId,
            recipientRole: 'seller',
            title: `COD Pending Settlement 🏦`,
            message: `You will receive ৳${totalAmount} in your Bank Account (${bankName}: ${bankAcc}) upon successful delivery of order ${orderNum}.`,
            orderNumber: orderNum,
            orderId: newOrder._id,
            type: 'payment'
          });
        }
      }
    } catch (notifErr) {
      console.error('Error generating automated order notifications:', notifErr);
    }

    res.status(201).json({
      message: 'Order created successfully!',
      order: newOrder
    });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Failed to create order', details: err.message });
  }
});

// PUT /api/orders/:id/logistics - Comprehensive logistics checklist update (for Logistics Team)
router.put('/:id/logistics', async (req, res) => {
  try {
    const { step, value, reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (!order.logisticsSteps) {
      order.logisticsSteps = {};
    }

    let milestoneText = '';
    let buyerMsg = '';
    let sellerMsg = '';

    // Mutual exclusion logic for Success vs Failure
    if (step === 'delivered' && value) {
      order.logisticsSteps.delivered = true;
      order.logisticsSteps.failed = false;
      order.orderStatus = 'Delivered';
      milestoneText = 'Product delivered';
      buyerMsg = `Product delivered successfully for order #${order.orderNumber}`;
      sellerMsg = `Product delivered successfully for order #${order.orderNumber}`;

      if (order.paymentMethod === 'Cash on Delivery' || order.paymentMethod === 'COD') {
        const bankName = order.seller?.bankName || 'Eco-Cart Partner Bank';
        const bankAcc = order.seller?.bankAccountNo || 'Bank Account Number';
        sellerMsg += `. ৳${order.totalAmount} has been added to your bank account (Bank Name: ${bankName}, Account: ${bankAcc}) for this order #${order.orderNumber}`;
      }
    } else if (step === 'failed' && value) {
      order.logisticsSteps.failed = true;
      order.logisticsSteps.delivered = false;
      order.orderStatus = 'Cancelled';
      order.isCancelled = true;
      const cancellationReason = reason || `Order cancelled by buyer ${order.buyer.name}`;
      order.logisticsSteps.failureReason = cancellationReason;
      milestoneText = `Product not delivered order cancelled by ${order.buyer.name}`;
      buyerMsg = `Product not delivered. Order cancelled for order #${order.orderNumber}`;
      sellerMsg = `Product not delivered. Order cancelled for order #${order.orderNumber}`;

      if (['bKash', 'Nagad', 'Upay', 'MasterCard', 'Digital'].includes(order.paymentMethod)) {
        const sellerAcc = order.seller?.gatewayAccountNo || order.paymentDetails?.accountNumber || 'Seller Account';
        const buyerAcc = order.buyer?.paymentAccountNo || order.paymentDetails?.accountNumber || 'Buyer Account';
        const methodType = order.paymentMethod;

        sellerMsg += `. ৳${order.totalAmount} disbursed from your account (${methodType}: ${sellerAcc}) to buyer ${order.buyer.name} (${methodType}: ${buyerAcc}) with order #${order.orderNumber}`;
        buyerMsg += `. ৳${order.totalAmount} disbursed to your ${methodType} account (${buyerAcc}) from seller ${order.seller.name} (${methodType}: ${sellerAcc}) with order #${order.orderNumber}`;
      }
    } else {
      order.logisticsSteps[step] = value;
      if (step === 'collectedFromSeller' && value) {
        milestoneText = 'Product collected from seller';
        buyerMsg = `Product collected from seller for order #${order.orderNumber}`;
      } else if (step === 'shipped' && value) {
        milestoneText = 'Product shipped';
        buyerMsg = `Product shipped for order #${order.orderNumber}`;
        order.orderStatus = 'Shipped';
      } else if (step === 'reachedWarehouse' && value) {
        milestoneText = 'Product reached Eco-Cart warehouse';
        buyerMsg = `Product reached Eco-Cart warehouse for order #${order.orderNumber}`;
        order.orderStatus = 'Arrived at Facility';
      } else if (step === 'reachedHub' && value) {
        milestoneText = "Product sent to your area's nearby Eco-Cart delivery hub";
        buyerMsg = `Product sent to your area's nearby Eco-Cart delivery hub for order #${order.orderNumber}`;
      } else if (step === 'outForDelivery' && value) {
        milestoneText = 'Product out for delivery';
        buyerMsg = `Product out for delivery for order #${order.orderNumber}`;
        order.orderStatus = 'Out for Delivery';
      }
    }

    if (milestoneText && !order.completedMilestones.includes(milestoneText)) {
      order.completedMilestones.push(milestoneText);
    }

    await order.save();

    // Dispatch notifications to buyer and seller
    try {
      const orderNum = order.orderNumber;
      const buyerId = order.buyer?.userId;
      const sellerUserId = order.seller?.userId;

      if (buyerMsg && buyerId) {
        await Notification.create({
          recipient: buyerId,
          recipientRole: 'buyer',
          title: `Order Update (${orderNum}) 🚚`,
          message: buyerMsg,
          orderNumber: orderNum,
          orderId: order._id,
          type: 'milestone'
        });
      }

      if (sellerMsg && sellerUserId) {
        await Notification.create({
          recipient: sellerUserId,
          recipientRole: 'seller',
          title: `Order Update (${orderNum}) 📦`,
          message: sellerMsg,
          orderNumber: orderNum,
          orderId: order._id,
          type: 'milestone'
        });
      }
    } catch (notifErr) {
      console.error('Error generating logistics notifications:', notifErr);
    }

    res.json({ message: 'Logistics step updated successfully', order });
  } catch (err) {
    console.error('Error updating logistics:', err);
    res.status(500).json({ error: 'Failed to update logistics', details: err.message });
  }
});

// PUT /api/orders/:id/milestone - Update logistics milestone and notify buyer/seller (Backward compatibility)
router.put('/:id/milestone', async (req, res) => {
  try {
    const { milestone } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (!order.completedMilestones) {
      order.completedMilestones = [];
    }

    if (!order.completedMilestones.includes(milestone)) {
      order.completedMilestones.push(milestone);
    }

    if (milestone.toLowerCase().includes('delivered')) {
      order.orderStatus = 'Delivered';
      order.logisticsSteps.delivered = true;
    } else if (milestone.toLowerCase().includes('shipped')) {
      order.orderStatus = 'Shipped';
      order.logisticsSteps.shipped = true;
    } else if (milestone.toLowerCase().includes('out for delivery')) {
      order.orderStatus = 'Out for Delivery';
      order.logisticsSteps.outForDelivery = true;
    } else {
      order.orderStatus = 'In Transit';
    }

    await order.save();

    try {
      const orderNum = order.orderNumber;
      if (order.buyer?.userId) {
        await Notification.create({
          recipient: order.buyer.userId,
          recipientRole: 'buyer',
          title: `Order Update (${orderNum}) 🚚`,
          message: `Milestone reached for order ${orderNum}: "${milestone}"`,
          orderNumber: orderNum,
          orderId: order._id,
          type: 'milestone'
        });
      }
    } catch (notifErr) {
      console.error('Error creating milestone notification:', notifErr);
    }

    res.json({ message: 'Milestone updated successfully', order });
  } catch (err) {
    console.error('Error updating milestone:', err);
    res.status(500).json({ error: 'Failed to update milestone', details: err.message });
  }
});

// PUT /api/orders/:id/cancel - Cancel order and notify parties
router.put('/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.orderStatus = 'Cancelled';
    order.isCancelled = true;
    order.logisticsSteps.failed = true;
    await order.save();

    try {
      const orderNum = order.orderNumber;
      if (order.buyer?.userId) {
        await Notification.create({
          recipient: order.buyer.userId,
          recipientRole: 'buyer',
          title: `Order Cancelled (${orderNum}) ❌`,
          message: `Order ${orderNum} has been marked as cancelled / not delivered.`,
          orderNumber: orderNum,
          orderId: order._id,
          type: 'cancellation'
        });
      }
      if (order.seller?.userId) {
        await Notification.create({
          recipient: order.seller.userId,
          recipientRole: 'seller',
          title: `Order Cancelled (${orderNum}) ❌`,
          message: `Order ${orderNum} was cancelled by logistics delivery team.`,
          orderNumber: orderNum,
          orderId: order._id,
          type: 'cancellation'
        });
      }
    } catch (notifErr) {
      console.error('Error creating cancellation notification:', notifErr);
    }

    res.json({ message: 'Order cancelled successfully', order });
  } catch (err) {
    console.error('Error cancelling order:', err);
    res.status(500).json({ error: 'Failed to cancel order', details: err.message });
  }
});

// GET /api/orders/track/:orderNumber - Track order by Order Number
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