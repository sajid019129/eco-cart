const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');

router.post('/', async (req, res) => {
  try {
    const { title, description, price, category, stock, seller, ecoRating, ecoTags } = req.body;

    if (!title || price === undefined || price === null || !category) {
      return res.status(400).json({ error: 'Title, price, and category are required fields.' });
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ error: 'Price must be a valid non-negative number.' });
    }

    // Find or create Category
    let categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      categoryDoc = await Category.create({ name: category });
    }

    const productData = {
      title,
      description: description || '',
      price: numericPrice,
      category: categoryDoc._id,
      stock: stock ? Number(stock) : 1,
      ecoRating: ecoRating ? Number(ecoRating) : 5,
      ecoTags: ecoTags || []
    };

    // Attach seller if valid ID string was passed
    if (seller && seller.length === 24) {
      productData.seller = seller;
    }

    const product = new Product(productData);
    await product.save();
    
    res.status(201).json(product);
  } catch (err) {
    console.error('Failed to add product:', err);
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