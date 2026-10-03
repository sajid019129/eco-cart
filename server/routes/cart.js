const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// GET /api/cart/:userId
router.get('/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.params.userId }).populate('items.product');
    res.json(cart || { user: req.params.userId, items: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cart/add
router.post('/add', async (req, res) => {
  const { userId, productId, quantity } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Prevent seller from buying their own product
    if (product.seller && product.seller.toString() === userId) {
      return res.status(400).json({ message: 'You cannot purchase your own listed product.' });
    }

    // Prevent adding sold out products
    if (product.stock <= 0) {
      return res.status(400).json({ message: 'This item is sold out.' });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(p => p.product.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += (quantity || 1);
    } else {
      cart.items.push({ product: productId, quantity: quantity || 1 });
    }

    await cart.save();
    const updatedCart = await Cart.findOne({ user: userId }).populate('items.product');
    res.json(updatedCart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/cart/update
router.put('/update', async (req, res) => {
  const { userId, productId, quantity } = req.body;
  try {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const itemIndex = cart.items.findIndex(p => p.product.toString() === productId);
    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
      await cart.save();
      const updatedCart = await Cart.findOne({ user: userId }).populate('items.product');
      return res.json(updatedCart);
    }
    res.status(404).json({ message: 'Item not found in cart' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/cart/remove/:userId/:productId
router.delete('/remove/:userId/:productId', async (req, res) => {
  const { userId, productId } = req.params;
  try {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(p => p.product.toString() !== productId);
    await cart.save();
    const updatedCart = await Cart.findOne({ user: userId }).populate('items.product');
    res.json(updatedCart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cart/checkout
router.post('/checkout', async (req, res) => {
  const { userId } = req.body;
  try {
    let cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    // Deduct stock for checked out items
    for (let item of cart.items) {
      if (item.product) {
        const prod = await Product.findById(item.product._id);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
          await prod.save();
        }
      }
    }

    cart.items = [];
    await cart.save();
    res.status(200).json({ message: 'Checkout successful', cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;