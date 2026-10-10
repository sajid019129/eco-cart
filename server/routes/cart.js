const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');

router.get('/:userId', async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.params.userId }).populate('items.product');
    
    if (cart && cart.items.length > 0) {
      const validItems = cart.items.filter(item => item.product !== null);
      if (validItems.length !== cart.items.length) {
        cart.items = validItems;
        await cart.save();
      }
    }

    res.json(cart || { user: req.params.userId, items: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/add', async (req, res) => {
  const { userId, productId, quantity } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const addQty = quantity || 1;
    if (product.stock < addQty) {
      return res.status(400).json({ error: 'Stock limit reached' });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(p => p.product.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += addQty;
    } else {
      cart.items.push({ product: productId, quantity: addQty });
    }

    product.stock = Math.max(0, product.stock - addQty);
    await product.save();
    await cart.save();

    const updatedCart = await Cart.findOne({ user: userId }).populate('items.product');
    res.json(updatedCart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/update', async (req, res) => {
  const { userId, productId, quantity } = req.body;
  try {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const itemIndex = cart.items.findIndex(p => p.product.toString() === productId);
    if (itemIndex > -1) {
      const oldQty = cart.items[itemIndex].quantity;
      const diff = quantity - oldQty;

      const product = await Product.findById(productId);
      if (product) {
        if (diff > 0 && product.stock < diff) {
          return res.status(400).json({ error: 'Stock limit reached' });
        }
        product.stock = Math.max(0, product.stock - diff);
        await product.save();
      }

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

router.delete('/remove/:userId/:productId', async (req, res) => {
  const { userId, productId } = req.params;
  try {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(p => p.product.toString() === productId);
    if (item) {
      const product = await Product.findById(productId);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    cart.items = cart.items.filter(p => p.product.toString() !== productId);
    await cart.save();
    
    const updatedCart = await Cart.findOne({ user: userId }).populate('items.product');
    res.json(updatedCart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/checkout', async (req, res) => {
  const { userId } = req.body;
  try {
    let cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    cart.items = [];
    await cart.save();
    res.status(200).json({ message: 'Checkout successful', cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;