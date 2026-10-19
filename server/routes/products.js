const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const Cart = require('../models/Cart');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for disk storage (Lightning fast local saves)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB limit
  storage: storage
});

// POST /api/products - Create a new product listing
router.post('/', upload.array('media', 5), async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      originalPrice,
      condition,
      category,
      stock,
      seller,
      sellerName,
      sellerPhone,
      sellerEmail,
      sellerAddress,
      images,
      image,
      imageUrl,
      ecoRating,
      ecoTags
    } = req.body;

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

    // Robust case-insensitive category matching
    let categoryDoc = await Category.findOne({ 
      name: { $regex: new RegExp(`^${category}$`, 'i') } 
    });
    if (!categoryDoc) {
      categoryDoc = await Category.create({ name: category });
    }

    // Save lightweight file URLs instead of heavy base64 strings
    let productImages = [];
    if (req.files && req.files.length > 0) {
      productImages = req.files.map((file) => `/uploads/${file.filename}`);
    } else if (Array.isArray(images) && images.length > 0) {
      productImages = images;
    } else if (image) {
      productImages = [image];
    } else if (imageUrl) {
      productImages = [imageUrl];
    }

    let userRecord = null;
    let sellerId = null;
    if (seller) {
      sellerId = typeof seller === 'string' ? seller : seller._id;
      userRecord = await User.findById(sellerId);
    }

    const productData = {
      title,
      description: description || '',
      price: numericPrice,
      originalPrice: parsedOriginalPrice,
      condition: condition || '',
      category: categoryDoc._id,
      stock: stock !== undefined && stock !== null ? Math.max(0, Number(stock)) : 1,
      images: productImages,
      sellerName: sellerName || (userRecord ? (userRecord.name || userRecord.fullName) : ''),
      sellerPhone: sellerPhone || (userRecord ? (userRecord.phone || userRecord.phoneNumber) : ''),
      sellerEmail: sellerEmail || (userRecord ? userRecord.email : ''),
      sellerAddress: sellerAddress || (userRecord ? (userRecord.address || userRecord.location) : ''),
      ecoRating: ecoRating ? Number(ecoRating) : 5,
      ecoTags: ecoTags || []
    };

    if (sellerId) {
      productData.seller = sellerId;
    }

    const product = new Product(productData);
    await product.save();

    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name')
      .populate('seller', 'name email phone address');

    res.status(201).json(populatedProduct);
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: 'Failed to add product', details: err.message });
  }
});

// GET /api/products - Get all products with optional search and category filters
router.get('/', async (req, res) => {
  try {
    const { searchTerm, category } = req.query;
    let filter = {};

    if (searchTerm) {
      filter.title = { $regex: searchTerm,$options: 'i' };
    }

    if (category && category !== 'All') {
      const categoryDoc = await Category.findOne({ 
        name: { $regex: new RegExp(`^${category}$`, 'i') } 
      });
      if (categoryDoc) {
        filter.category = categoryDoc._id;
      }
    }

    const products = await Product.find(filter)
      .populate('category', 'name')
      .populate('seller', 'name email phone address')
      .sort({ createdAt: -1 });
      
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve products', details: err.message });
  }
});

// PUT /api/products/:id - Update product details or stock
router.put('/:id', async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      originalPrice,
      condition,
      category,
      stock,
      images,
      image,
      imageUrl,
      sellerName,
      sellerPhone,
      sellerEmail,
      sellerAddress,
      ecoRating,
      ecoTags
    } = req.body;

    let updateFields = {};

    if (title) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (price !== undefined) updateFields.price = Number(price);
    if (originalPrice !== undefined) updateFields.originalPrice = originalPrice ? Number(originalPrice) : null;
    if (condition !== undefined) updateFields.condition = condition;
    if (stock !== undefined) updateFields.stock = Math.max(0, Number(stock));
    if (ecoRating !== undefined) updateFields.ecoRating = Number(ecoRating);
    if (ecoTags !== undefined) updateFields.ecoTags = ecoTags;

    if (sellerName !== undefined) updateFields.sellerName = sellerName;
    if (sellerPhone !== undefined) updateFields.sellerPhone = sellerPhone;
    if (sellerEmail !== undefined) updateFields.sellerEmail = sellerEmail;
    if (sellerAddress !== undefined) updateFields.sellerAddress = sellerAddress;

    if (Array.isArray(images)) {
      updateFields.images = images;
    } else if (image) {
      updateFields.images = [image];
    } else if (imageUrl) {
      updateFields.images = [imageUrl];
    }

    if (category) {
      let categoryDoc = await Category.findOne({ 
        name: { $regex: new RegExp(`^${category}$`, 'i') } 
      });
      if (!categoryDoc) {
        categoryDoc = await Category.create({ name: category });
      }
      updateFields.category = categoryDoc._id;
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateFields, { new: true })
      .populate('category', 'name')
      .populate('seller', 'name email phone address');

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product', details: err.message });
  }
});

// DELETE /api/products/:id - Remove product and clean up user carts
router.delete('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const deletedProduct = await Product.findByIdAndDelete(productId);
    
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await Cart.updateMany(
      { 'items.product': productId },
      { $pull: { items: { product: productId } } }
    );

    res.json({ message: 'Product deleted successfully and removed from user carts' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product', details: err.message });
  }
});

module.exports = router;