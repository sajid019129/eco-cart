const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');

// POST /api/products (Add new product)
router.post('/', async (req, res) => {
  try {
    const { title, description, price, originalPrice, category, stock, seller, images, condition } = req.body;

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
      if (isNaN(parsedOriginalPrice) || parsedOriginalPrice < 0) {
        parsedOriginalPrice = null;
      }
    }

    let categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      categoryDoc = await Category.create({ name: category });
    }

    // Process and validate images array (up to 20 images max)
    let processedImages = [];
    if (Array.isArray(images)) {
      processedImages = images.slice(0, 20);
    } else if (typeof images === 'string' && images.trim() !== '') {
      processedImages = [images];
    }

    const productData = {
      title,
      description: description || '',
      price: numericPrice,
      originalPrice: parsedOriginalPrice,
      category: categoryDoc._id,
      stock: stock !== undefined && stock !== null ? Math.max(0, Number(stock)) : 1,
      images: processedImages,
      condition: condition || 'Gently Used'
    };

    if (seller && seller.length === 24) {
      productData.seller = seller;
    }

    const product = new Product(productData);
    await product.save();
    
    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name')
      .populate('seller', 'name email avatar');

    res.status(201).json(populatedProduct);
  } catch (err) {
    console.error('Failed to add product:', err);
    res.status(500).json({ error: 'Failed to add product', details: err.message });
  }
});

// GET /api/products (Fetch products sorted so active items come before sold out items)
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

    const products = await Product.find(filter)
      .populate('category', 'name')
      .populate('seller', 'name email avatar')
      .sort({ createdAt: -1 });

    // Custom sort: active stock > 0 stays on top; sold-out items (stock === 0) sink to bottom
    const sortedProducts = products.sort((a, b) => {
      const aInStock = a.stock > 0 ? 1 : 0;
      const bInStock = b.stock > 0 ? 1 : 0;
      return bInStock - aInStock;
    });

    res.json(sortedProducts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve products', details: err.message });
  }
});

// PUT /api/products/:id (Update product)
router.put('/:id', async (req, res) => {
  try {
    const { images, price, originalPrice, stock } = req.body;
    let updateData = { ...req.body };

    if (price !== undefined) {
      updateData.price = Number(price);
    }
    if (originalPrice !== undefined && originalPrice !== null) {
      updateData.originalPrice = originalPrice === '' ? null : Number(originalPrice);
    }
    if (stock !== undefined) {
      updateData.stock = Math.max(0, Number(stock));
    }
    if (Array.isArray(images)) {
      updateData.images = images.slice(0, 20);
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('category', 'name')
      .populate('seller', 'name email avatar');

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product', details: err.message });
  }
});

// DELETE /api/products/:id (Delete product)
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