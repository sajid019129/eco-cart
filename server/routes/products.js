const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');

router.post('/', async (req, res) => {
  try {
    const { title, description, price, originalPrice, condition, category, stock, seller, ecoRating, ecoTags } = req.body;

    if (!title || price === undefined || price === null || !category) {
      return res.status(400).json({ error: 'Title, price, and category are required fields.' });
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ error: 'Price must be a valid non-negative number.' });
    }

    let parsedOriginalPrice = null;
    if (originalPrice !== undefined && originalPrice !== null && originalPrice !== '') {
      parsedOriginalPrice = Number(originalPrice);
      if (isNaN(parsedOriginalPrice) || parsedOriginalPrice <= numericPrice) {
        return res.status(400).json({ error: 'Previous price must be greater than current price.' });
      }
    }

    let categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      categoryDoc = await Category.create({ name: category });
    }

    const productData = {
      title,
      description: description || '',
      price: numericPrice,
      originalPrice: parsedOriginalPrice,
      condition: condition || '',
      category: categoryDoc._id,
      stock: stock !== undefined && stock !== null ? Math.max(0, Number(stock)) : 1,
      ecoRating: ecoRating ? Number(ecoRating) : 5,
      ecoTags: ecoTags || []
    };

    if (seller && seller.length === 24) {
      productData.seller = seller;
    }

    const product = new Product(productData);
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

    const products = await Product.find(filter).populate('category', 'name').populate('seller', 'name email');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve products', details: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, description, price, originalPrice, condition, category, stock, ecoRating, ecoTags } = req.body;
    let updateFields = {};

    if (title) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (price !== undefined) updateFields.price = Number(price);
    if (originalPrice !== undefined) updateFields.originalPrice = originalPrice ? Number(originalPrice) : null;
    if (condition !== undefined) updateFields.condition = condition;
    if (stock !== undefined) updateFields.stock = Math.max(0, Number(stock));
    if (ecoRating !== undefined) updateFields.ecoRating = Number(ecoRating);
    if (ecoTags !== undefined) updateFields.ecoTags = ecoTags;

    if (category) {
      let categoryDoc = await Category.findOne({ name: category });
      if (!categoryDoc) {
        categoryDoc = await Category.create({ name: category });
      }
      updateFields.category = categoryDoc._id;
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateFields, { new: true })
      .populate('category', 'name')
      .populate('seller', 'name email');

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