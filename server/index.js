const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eco-cart';

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB Connected Successfully!'))
  .catch((err) => console.log('MongoDB Connection Error:', err));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));

// Server Initialization
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});