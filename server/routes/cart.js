const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');

router.get('/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.params.userId }).populate('items.product');
    res.json(cart || { user: req.params.userId, items: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/add', async (req, res) => {
  const { userId, productId, quantity } = req.body;
  try {
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
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;