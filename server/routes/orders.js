const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Notification = require('../models/Notification');

// Helper function to find or get the default Eco-Cart Delivery Team user document
const getDeliveryTeamUser = async () => {
  let deliveryUser = await User.findOne({ email: 'sajid019129@gmail.com' });
  if (!deliveryUser) {
    deliveryUser = await User.findOne({ role: 'delivery-team' });
  }
  return deliveryUser;
};

// GET /api/orders/all - Get all orders in the system (for Logistics Dashboard)
router.get('/all', async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate({
        path: 'items.product',
        populate: { path: 'seller', select: 'name fullName username email phone sellerAccounts' }
      })
      .sort({ createdAt: -1 });
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
    let firstSellerInfo = null;
    const uniqueSellerNames = new Set();
    const uniqueSellerIds = new Set();

    for (const cartItem of items) {
      const productId = cartItem.productId || cartItem.product?._id || cartItem.product;
      const quantityOrdered = Number(cartItem.quantity || 1);

      const productDoc = await Product.findById(productId);
      if (!productDoc) {
        return res.status(404).json({ error: `Product not found: ${productId}` });
      }

      const sellerUserDoc = productDoc.seller ? await User.findById(productDoc.seller) : null;
      
      const sName = productDoc.sellerName || (sellerUserDoc ? (sellerUserDoc.name || sellerUserDoc.fullName || sellerUserDoc.username) : 'Eco-Cart Official');
      const sEmail = productDoc.sellerEmail || (sellerUserDoc ? sellerUserDoc.email : 'seller@ecocart.com');
      const sPhone = productDoc.sellerPhone || (sellerUserDoc ? (sellerUserDoc.phone || sellerUserDoc.phoneNumber) : '01700000000');
      const sLocation = productDoc.location || productDoc.sellerAddress || (sellerUserDoc ? (sellerUserDoc.address || sellerUserDoc.location) : 'Bangladesh');

      uniqueSellerNames.add(sName);
      if (sellerUserDoc) uniqueSellerIds.add(sellerUserDoc._id.toString());

      const itemSellerInfo = {
        userId: sellerUserDoc ? sellerUserDoc._id : null,
        name: sName,
        email: sEmail,
        phone: sPhone,
        location: sLocation
      };

      if (!firstSellerInfo) {
        firstSellerInfo = itemSellerInfo;
      }

      const itemTotal = Number(productDoc.price) * quantityOrdered;
      subtotal += itemTotal;

      orderItems.push({
        product: productDoc._id,
        title: productDoc.title,
        price: Number(productDoc.price),
        quantity: quantityOrdered,
        seller: sellerUserDoc ? sellerUserDoc._id : null,
        sellerName: sName
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

    // Handle order-level seller summary
    const orderSellerInfo = {
      ...firstSellerInfo,
      name: uniqueSellerNames.size > 1 
        ? `Multiple Sellers (${Array.from(uniqueSellerNames).join(', ')})` 
        : (firstSellerInfo?.name || 'Eco-Cart Official')
    };

    const newOrder = new Order({
      buyer: {
        userId: buyerUser._id,
        name: buyerUser.name || buyerUser.fullName || 'Valued Buyer',
        email: buyerUser.email,
        phone: buyerUser.phone || buyerUser.phoneNumber || shippingAddress?.phone || '01800000000',
        location: shippingAddress?.location || buyerUser.address || buyerUser.location || 'Bangladesh'
      },
      seller: orderSellerInfo,
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

    // --- AUTOMATED GRANULAR TRANSACTION NOTIFICATION TRIGGERS ---
    try {
      const buyerName = newOrder.buyer.name;
      const orderNum = newOrder.orderNumber;
      const deliveryTeamUser = await getDeliveryTeamUser();

      // 1. Primary Invoice Notifications
      await Notification.create({
        recipient: buyerUser._id,
        recipientRole: 'buyer',
        title: `Order Placed Successfully (${orderNum}) 📦`,
        message: `Dear ${buyerName}, your order #${orderNum} with ${uniqueSellerNames.size} seller(s) has been successfully registered. Click here to view or download your official invoice.`,
        orderNumber: orderNum,
        orderId: newOrder._id,
        type: 'invoice'
      });

      for (const cartItem of items) {
        const productDoc = await Product.findById(cartItem.productId || cartItem.product?._id || cartItem.product);
        if (productDoc && productDoc.seller) {
          const sellerDoc = await User.findById(productDoc.seller);
          const sellerName = sellerDoc?.name || sellerDoc?.fullName || 'Seller';
          const itemTotal = Number(productDoc.price) * Number(cartItem.quantity || 1);

          await Notification.create({
            recipient: productDoc.seller,
            recipientRole: 'seller',
            title: `New Product Sale (${orderNum}) 💰`,
            message: `Congratulations! Your product "${productDoc.title}" was purchased by ${buyerName} under order #${orderNum}. Click here to view or download your official invoice.`,
            orderNumber: orderNum,
            orderId: newOrder._id,
            type: 'invoice'
          });

          // 2. Secondary Financial Settlement Notification based on Payment Method
          const provider = (paymentDetails?.provider || resolvedPaymentMethod).trim();
          const buyerAccount = paymentDetails?.accountNumber || paymentDetails?.cardNumber || 'Personal Account';
          
          // Pull exact nested bank name and account number from sellerAccounts object[cite: 21]
          const bankName = sellerDoc?.sellerAccounts?.bank?.bankName || 'Registered Bank';
          const sellerAccount = sellerDoc?.sellerAccounts?.bank?.accountNumber || sellerDoc?.phone || 'Registered Payout Account';

          if (/bKash|Nagad|Upay|MasterCard|Card/i.test(provider)) {
            // Buyer financial confirmation notice
            await Notification.create({
              recipient: buyerUser._id,
              recipientRole: 'buyer',
              title: `Payment Transfer Confirmation (${orderNum}) 💳`,
              message: `You (${provider} Account Number: ${buyerAccount}) successfully transferred ৳${itemTotal.toFixed(2)} to ${sellerName} (${provider} Account Number: ${sellerAccount}) for order #${orderNum}.`,
              orderNumber: orderNum,
              orderId: newOrder._id,
              type: 'payment'
            });

            // Seller financial receipt notice
            await Notification.create({
              recipient: productDoc.seller,
              recipientRole: 'seller',
              title: `Payment Received Notification (${orderNum}) 💵`,
              message: `You received ৳${itemTotal.toFixed(2)} in your ${provider} Account Number (${sellerAccount}) from ${buyerName} (${provider} Account Number: ${buyerAccount}) for order #${orderNum}.`,
              orderNumber: orderNum,
              orderId: newOrder._id,
              type: 'payment'
            });
          } else {
            // Cash on Delivery Settlement Notices
            await Notification.create({
              recipient: buyerUser._id,
              recipientRole: 'buyer',
              title: `Cash on Delivery Preparation (${orderNum}) 🚚`,
              message: `Please keep ৳${itemTotal.toFixed(2)} ready in cash before the delivery representative arrives for order #${orderNum}.`,
              orderNumber: orderNum,
              orderId: newOrder._id,
              type: 'payment'
            });

            await Notification.create({
              recipient: productDoc.seller,
              recipientRole: 'seller',
              title: `Bank Settlement Notice (${orderNum}) 🏦`,
              message: `You will receive ৳${itemTotal.toFixed(2)} in your Bank Account: (${bankName}: ${sellerAccount}) upon successful delivery of order #${orderNum}.`,
              orderNumber: orderNum,
              orderId: newOrder._id,
              type: 'payment'
            });
          }
        }
      }

      if (deliveryTeamUser) {
        await Notification.create({
          recipient: deliveryTeamUser._id,
          recipientRole: 'delivery-team',
          title: `New Consignment Dispatched (${orderNum}) 🚚`,
          message: `New fulfillment consignment registered for order #${orderNum}. Buyer: ${buyerName}, Sellers: ${Array.from(uniqueSellerNames).join(', ')}. Click here to view or download your official invoice.`,
          orderNumber: orderNum,
          orderId: newOrder._id,
          type: 'invoice'
        });
      }
    } catch (notifErr) {
      console.error('Error generating automated order notifications:', notifErr);
    }

    // Return newly created order populated
    const populatedOrder = await Order.findById(newOrder._id).populate({
      path: 'items.product',
      populate: { path: 'seller', select: 'name fullName username email phone' }
    });

    res.status(201).json({
      message: 'Order created successfully!',
      order: populatedOrder || newOrder
    });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Failed to create order', details: err.message });
  }
});

// GET /api/orders/track/:orderNumber - Track order by Order Number
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const order = await Order.findOne({ orderNumber: orderNumber.trim().toUpperCase() })
      .populate({
        path: 'items.product',
        populate: { path: 'seller', select: 'name fullName username email phone' }
      });
    
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
      $or: [
        { 'buyer.userId': userId }, 
        { 'seller.userId': userId },
        { recipient: userId }
      ]
    })
    .populate({
      path: 'items.product',
      populate: { path: 'seller', select: 'name fullName username email phone' }
    })
    .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
  }
});

module.exports = router;