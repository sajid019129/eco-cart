const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');

router.post('/', async (req, res) => {
  try {
    const { title, description, price, category, stock, seller, ecoRating, ecoTags } = req.body;

    if (!title || !price || !category) {
      return res.status(400).json({ error: 'Title, price, and category are required fields.' });
    }

    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ error: 'Price must be a positive number.' });
    }

    let categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      categoryDoc = await Category.create({ name: category });
    }

    const product = new Product({
      title,
      description,
      price,
      category: categoryDoc._id,
      stock,
      seller: seller || '650000000000000000000001',
      ecoRating: ecoRating || 5,
      ecoTags: ecoTags || []
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add product', details: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { searchTerm, category } = req.query;
    let filter = {};

    if (searchTerm) {
      filter.title = { $regex: searchTerm, $options: 'i' };
    }

    if (category) {
      const categoryDoc = await Category.findOne({ name: category });
      if (categoryDoc) {
        filter.category = categoryDoc._id;
      }
    }

    const products = await Product.find(filter).populate('category', 'name');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve products', details: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product', details: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product', details: err.message });
  }
});

module.exports = router;