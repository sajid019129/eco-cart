const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Notification = require('../models/Notification');

const getDeliveryTeamUser = async () => {
  let deliveryUser = await User.findOne({ 
    $or: [
      { role: 'delivery-team' },
      { email: 'sajid019129@gmail.com' },
      { name: /delivery team/i }
    ]
  });
  return deliveryUser;
};

// GET /api/orders/all - Get all orders
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

// POST /api/orders - Create new order
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

    const shippingFee = 70;
    const totalAmount = subtotal + shippingFee;
    const resolvedPaymentMethod = paymentMethod || paymentDetails?.provider || 'COD';

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

    if (!isBuyNow) {
      await Cart.deleteMany({ $or: [{ user: buyerId }, { buyer: buyerId }] });
    }

    // --- AUTOMATED NOTIFICATIONS FOR ORDER PLACEMENT ---
    try {
      const buyerName = newOrder.buyer.name;
      const orderNum = newOrder.orderNumber;

      // 1. Buyer Notification
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

          // Seller Notification
          await Notification.create({
            recipient: productDoc.seller,
            recipientRole: 'seller',
            title: `New Product Sale (${orderNum}) 💰`,
            message: `Congratulations! Your product "${productDoc.title}" was purchased by ${buyerName} under order #${orderNum}. Click here to view or download your official invoice.`,
            orderNumber: orderNum,
            orderId: newOrder._id,
            type: 'invoice'
          });

          const provider = (paymentDetails?.provider || resolvedPaymentMethod).trim();
          const buyerAccount = paymentDetails?.accountNumber || paymentDetails?.cardNumber || 'Personal Account';
          const bankName = sellerDoc?.sellerAccounts?.bank?.bankName || 'Registered Bank';
          const sellerAccount = sellerDoc?.sellerAccounts?.bank?.accountNumber || sellerDoc?.phone || 'Registered Payout Account';

          if (/bKash|Nagad|Upay|MasterCard|Card/i.test(provider)) {
            await Notification.create({
              recipient: buyerUser._id,
              recipientRole: 'buyer',
              title: `Payment Transfer Confirmation (${orderNum}) 💳`,
              message: `You (${provider} Account Number: ${buyerAccount}) successfully transferred ৳${itemTotal.toFixed(2)} to ${sellerName} (${provider} Account Number: ${sellerAccount}) for order #${orderNum}.`,
              orderNumber: orderNum,
              orderId: newOrder._id,
              type: 'payment'
            });

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
    } catch (notifErr) {
      console.error('Error generating automated order notifications:', notifErr);
    }

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

// LOGISTICS CHECKBOX UPDATE HANDLER
const handleLogisticsUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { step, value, logisticsSteps } = req.body;

    const order = await Order.findById(id).populate({
      path: 'items.product',
      populate: { path: 'seller', select: 'name fullName email phone sellerAccounts' }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const buyerId = order.buyer?.userId;
    const buyerName = order.buyer?.name || 'Customer';
    const orderNum = order.orderNumber;

    if (!order.logisticsSteps) {
      order.logisticsSteps = {};
    }

    const previousSteps = {
      collectedFromSeller: order.logisticsSteps.collectedFromSeller,
      shipped: order.logisticsSteps.shipped,
      reachedWarehouse: order.logisticsSteps.reachedWarehouse,
      reachedHub: order.logisticsSteps.reachedHub,
      outForDelivery: order.logisticsSteps.outForDelivery,
      delivered: order.logisticsSteps.delivered,
      failed: order.logisticsSteps.failed
    };

    const stepsToApply = logisticsSteps || (step ? { [step]: value !== undefined ? value : true } : {});
    
    for (const [k, v] of Object.entries(stepsToApply)) {
      order.logisticsSteps[k] = v;
    }

    if (order.logisticsSteps.delivered) {
      order.orderStatus = 'Delivered';
      order.isCancelled = false;
      order.logisticsSteps.failed = false;
    } else if (order.logisticsSteps.failed) {
      order.orderStatus = `Cancelled by ${buyerName}`;
      order.isCancelled = true;
      order.logisticsSteps.delivered = false;
    }

    order.markModified('logisticsSteps');
    await order.save();

    // --- NOTIFICATIONS ---
    try {
      for (const [stepKey, isChecked] of Object.entries(stepsToApply)) {
        if (isChecked && !previousSteps[stepKey] && stepKey !== 'delivered' && stepKey !== 'failed') {
          let stepTitle = '';
          let stepMessage = '';

          if (stepKey === 'collectedFromSeller') {
            stepTitle = `Consignment Successfully Collected (${orderNum}) 📦`;
            stepMessage = `Dear ${buyerName}, your package for order #${orderNum} has been successfully collected from the designated merchant(s) and logged into the Eco-Cart fulfillment network.`;
          } else if (stepKey === 'shipped') {
            stepTitle = `Consignment in Transit (${orderNum}) 🚚`;
            stepMessage = `Dear ${buyerName}, your consignment for order #${orderNum} has been dispatched into line-haul transit toward your regional processing center.`;
          } else if (stepKey === 'reachedWarehouse') {
            stepTitle = `Arrival at Central Sorting Facility (${orderNum}) 🏢`;
            stepMessage = `Dear ${buyerName}, your consignment for order #${orderNum} has arrived safely at the Eco-Cart main sorting warehouse for rigorous quality inspection and routing.`;
          } else if (stepKey === 'reachedHub') {
            stepTitle = `Consignment at Local Delivery Hub (${orderNum}) 📍`;
            stepMessage = `Dear ${buyerName}, your consignment for order #${orderNum} has been successfully sorted and routed to your destination local delivery hub.`;
          } else if (stepKey === 'outForDelivery') {
            stepTitle = `Out for Final Delivery (${orderNum}) 🛵`;
            stepMessage = `Dear ${buyerName}, your consignment for order #${orderNum} is now out for final delivery with our designated field courier. Please stay available to receive your package.`;
          }

          if (stepTitle && buyerId) {
            await Notification.create({
              recipient: buyerId,
              recipientRole: 'buyer',
              title: stepTitle,
              message: stepMessage,
              orderNumber: orderNum,
              orderId: order._id,
              type: 'invoice'
            });
          }
        }
      }

      if (order.logisticsSteps.delivered && !previousSteps.delivered) {
        if (buyerId) {
          await Notification.create({
            recipient: buyerId,
            recipientRole: 'buyer',
            title: `Consignment Successfully Delivered (${orderNum}) ✨`,
            message: `Dear ${buyerName}, order #${orderNum} has been successfully delivered. Thank you for shopping with Eco-Cart!`,
            orderNumber: orderNum,
            orderId: order._id,
            type: 'invoice'
          });
        }

        for (const item of (order.items || [])) {
          const sellerId = item.seller || item.product?.seller;
          if (sellerId) {
            const sellerDoc = await User.findById(sellerId);
            const itemTotal = Number(item.price || 0) * Number(item.quantity || 1);
            const paymentProv = (order.paymentDetails?.provider || order.paymentMethod || '').trim();
            const bankName = sellerDoc?.sellerAccounts?.bank?.bankName || 'Registered Bank Account';
            const bankAcc = sellerDoc?.sellerAccounts?.bank?.accountNumber || sellerDoc?.phone || 'Primary Payout Account';

            await Notification.create({
              recipient: sellerId,
              recipientRole: 'seller',
              title: `Successful Fulfillment Notice (${orderNum}) ✅`,
              message: `Order #${orderNum} containing your product "${item.title}" has been successfully delivered to ${buyerName}.`,
              orderNumber: orderNum,
              orderId: order._id,
              type: 'invoice'
            });

            if (/COD|Cash on Delivery/i.test(paymentProv)) {
              await Notification.create({
                recipient: sellerId,
                recipientRole: 'seller',
                title: `Bank Payout Credited Notice (${orderNum}) 🏦`,
                message: `Following successful delivery and cash on delivery (COD) collection for order #${orderNum}, the net proceeds of ৳${itemTotal.toFixed(2)} have been successfully credited to your ${bankName} account (${bankAcc}).`,
                orderNumber: orderNum,
                orderId: order._id,
                type: 'payment'
              });
            }
          }
        }
      }

      if (order.logisticsSteps.failed && !previousSteps.failed) {
        const paymentProv = (order.paymentDetails?.provider || order.paymentMethod || '').trim();
        const isDigitalPayment = /bKash|Nagad|Upay|MasterCard|Card/i.test(paymentProv);

        if (buyerId) {
          let buyerMsg = `Dear ${buyerName}, delivery for order #${orderNum} has failed / been cancelled by you.`;
          if (isDigitalPayment) {
            buyerMsg += ` Since payment was completed digitally via ${paymentProv}, your transferred funds have been instantly reversed and refunded to your source account.`;
          }

          await Notification.create({
            recipient: buyerId,
            recipientRole: 'buyer',
            title: `Delivery Exception & Refund Notice (${orderNum}) ❌`,
            message: buyerMsg,
            orderNumber: orderNum,
            orderId: order._id,
            type: 'payment'
          });
        }

        for (const item of (order.items || [])) {
          const sellerId = item.seller || item.product?.seller;
          if (sellerId) {
            const itemTotal = Number(item.price || 0) * Number(item.quantity || 1);
            let sellerMsg = `Order #${orderNum} for your product "${item.title}" encountered a delivery exception and was cancelled by ${buyerName}.`;
            
            if (isDigitalPayment) {
              sellerMsg += ` Because payment was completed digitally via ${paymentProv}, the amount of ৳${itemTotal.toFixed(2)} which was transferred instantly has now been given back (reversed and refunded) to the buyer.`;
            }

            await Notification.create({
              recipient: sellerId,
              recipientRole: 'seller',
              title: `Delivery Failure & Reverse Transfer Notice (${orderNum}) ⚠️`,
              message: sellerMsg,
              orderNumber: orderNum,
              orderId: order._id,
              type: 'payment'
            });
          }
        }
      }
    } catch (notifErr) {
      console.error('Error generating notification:', notifErr);
    }

    res.json({ message: 'Logistics updated successfully', order });
  } catch (err) {
    console.error('Error updating logistics steps:', err);
    res.status(500).json({ error: 'Failed to update logistics steps', details: err.message });
  }
};

router.put('/logistics/:id', handleLogisticsUpdate);
router.put('/:id/logistics', handleLogisticsUpdate);

// GET /api/orders/track/:orderNumber
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

// GET /api/orders/:userId
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