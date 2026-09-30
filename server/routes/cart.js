const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');

// Update item quantity in cart
router.put('/update', async (req, res) => {
  const { userId, productId, quantity } = req.body;
  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
      await cart.save();
      return res.status(200).json(cart);
    }
    res.status(404).json({ message: 'Item not found in cart' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove single item from cart
router.delete('/remove/:userId/:productId', async (req, res) => {
  const { userId, productId } = req.params;
  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;