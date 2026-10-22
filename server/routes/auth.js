const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, age, avatar, isSeller, sellerAccounts, dob } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    if (!password || password.length < 6 || password.length > 12) {
      return res.status(400).json({ message: 'Password must be between 6 and 12 characters long.' });
    }

    const parsedAge = Number(age);
    if (isNaN(parsedAge) || parsedAge < 18) {
      return res.status(400).json({ message: 'You must be at least 18 years old to register an account.' });
    }

    const existingUser = await User.findOne({ email: new RegExp(`^${cleanEmail}$`, 'i') });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: 'An active account already exists with this email address.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const formattedSellerAccounts = isSeller ? {
      bKash: sellerAccounts?.bKash || '',
      nagad: sellerAccounts?.nagad || '',
      upay: sellerAccounts?.upay || '',
      masterCard: sellerAccounts?.masterCard || '',
      bank: {
        bankName: sellerAccounts?.bank?.bankName || '',
        accountNumber: sellerAccounts?.bank?.accountNumber || ''
      }
    } : {
      bKash: '',
      nagad: '',
      upay: '',
      masterCard: '',
      bank: { bankName: '', accountNumber: '' }
    };

    let targetUser = existingUser;
    if (targetUser) {
      targetUser.name = name;
      targetUser.password = hashedPassword;
      targetUser.phone = phone;
      targetUser.age = parsedAge;
      targetUser.dob = dob || '';
      targetUser.avatar = avatar || '';
      targetUser.isSeller = Boolean(isSeller);
      targetUser.sellerAccounts = formattedSellerAccounts;
      targetUser.registerOtp = otp;
      targetUser.registerOtpExpires = otpExpires;
      targetUser.isVerified = false;
      await targetUser.save();
    } else {
      targetUser = new User({
        name,
        email: cleanEmail,
        password: hashedPassword,
        phone,
        age: parsedAge,
        dob: dob || '',
        avatar: avatar || '',
        isSeller: Boolean(isSeller),
        sellerAccounts: formattedSellerAccounts,
        registerOtp: otp,
        registerOtpExpires: otpExpires,
        isVerified: false
      });
      await targetUser.save();
    }

    const mailOptions = {
      from: `"Eco-Cart Support" <${process.env.EMAIL_USER}>`,
      to: cleanEmail,
      subject: 'Account Registration Verification Code - Eco-Cart',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #2d6a4f; text-align: center;">Eco-Cart Registration Verification</h2>
          <p>Hello ${name},</p>
          <p>Thank you for registering with Eco-Cart. Your 6-digit email verification code is:</p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #2d6a4f; background: #e8f5e9; padding: 10px 20px; border-radius: 6px;">
              ${otp}
            </span>
          </div>
          <p style="color: #666; font-size: 13px;">This code will expire in 10 minutes. Please enter it on the website to complete your registration.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: `Verification code sent to ${cleanEmail}` });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration or email sending.' });
  }
});

router.post('/verify-register', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    const user = await User.findOne({
      email: new RegExp(`^${cleanEmail}$`, 'i'),
      registerOtp: otp,
      registerOtpExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    user.isVerified = true;
    user.registerOtp = null;
    user.registerOtpExpires = null;
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        age: user.age,
        dob: user.dob || '',
        avatar: user.avatar,
        isSeller: user.isSeller,
        sellerAccounts: user.sellerAccounts
      }
    });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ message: 'Server error during verification' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    const user = await User.findOne({ email: new RegExp(`^${cleanEmail}$`, 'i') });
    if (!user || !user.isVerified) {
      return res.status(400).json({ message: 'Invalid email or password, or account not verified' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        age: user.age,
        dob: user.dob || '',
        avatar: user.avatar,
        isSeller: user.isSeller,
        sellerAccounts: user.sellerAccounts
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login' });
  }
});

router.put('/update-avatar', async (req, res) => {
  try {
    const { email, avatar } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    if (!cleanEmail) {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: new RegExp(`^${cleanEmail}$`, 'i') },
      { avatar: avatar || '' },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      message: 'Profile picture updated successfully!',
      user: {
        id: updatedUser._id,
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        age: updatedUser.age,
        dob: updatedUser.dob || '',
        avatar: updatedUser.avatar,
        isSeller: updatedUser.isSeller,
        sellerAccounts: updatedUser.sellerAccounts
      }
    });
  } catch (err) {
    console.error('Update Avatar Error:', err);
    res.status(500).json({ message: 'Server error while updating profile picture.' });
  }
});

// Permanent account deletion endpoint with Buyer Cart Restock & Seller Product Stock-Out Handling
router.delete('/delete-account', async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    if (!cleanEmail) {
      return res.status(400).json({ message: 'Email address is required for deletion.' });
    }

    const user = await User.findOne({ email: new RegExp(`^${cleanEmail}$`, 'i') });
    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    const userId = user._id;

    // 1. BUYER CART RESTOCK LOGIC: If items are in the user's cart, restore their quantities back to inventory products
    const userCart = await Cart.findOne({ user: userId });
    if (userCart && Array.isArray(userCart.items)) {
      for (const cartItem of userCart.items) {
        if (cartItem.product && cartItem.quantity) {
          await Product.findByIdAndUpdate(cartItem.product, {
            $inc: { stock: cartItem.quantity }
          });
        }
      }
      // Delete the user's cart document
      await Cart.findOneAndDelete({ user: userId });
    }

    // 2. SELLER STOCK-OUT LOGIC: If the user is a seller, auto-stock out (set stock to 0 or fade out) their posted products
    if (user.isSeller) {
      await Product.updateMany(
        { $or: [{ seller: userId }, { sellerEmail: cleanEmail }] },
        { $set: { stock: 0 } }
      );
    }

    // 3. Permanently delete the user record from MongoDB
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'Account deleted permanently and inventory synchronized.' });
  } catch (err) {
    console.error('Delete Account Error:', err);
    res.status(500).json({ message: 'Server error while deleting account.' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: new RegExp(`^${cleanEmail}$`, 'i') });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.resetOtp = otp;
    user.resetOtpExpires = otpExpires;
    await user.save();

    const mailOptions = {
      from: `"Eco-Cart Support" <${process.env.EMAIL_USER}>`,
      to: cleanEmail,
      subject: 'Password Reset Verification Code - Eco-Cart',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #2d6a4f; text-align: center;">Eco-Cart Password Reset</h2>
          <p>Hello,</p>
          <p>You requested a password reset. Your 6-digit verification code is:</p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #2d6a4f; background: #e8f5e9; padding: 10px 20px; border-radius: 6px;">
              ${otp}
            </span>
          </div>
          <p style="color: #666; font-size: 13px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: `Verification code sent to ${cleanEmail}` });
  } catch (err) {
    console.error('Forgot Password Error:', err);
    res.status(500).json({ message: 'Failed to send email. Please check server email credentials.' });
  }
});

// Strictly verify reset OTP endpoint
router.post('/verify-reset-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    const user = await User.findOne({
      email: new RegExp(`^${cleanEmail}$`, 'i'),
      resetOtp: otp,
      resetOtpExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }

    res.status(200).json({ message: 'Code verified successfully.' });
  } catch (err) {
    console.error('Verify Reset OTP Error:', err);
    res.status(500).json({ message: 'Server error during OTP verification.' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    if (!newPassword || newPassword.length < 6 || newPassword.length > 12) {
      return res.status(400).json({ message: 'Password must be between 6 and 12 characters long.' });
    }

    const user = await User.findOne({
      email: new RegExp(`^${cleanEmail}$`, 'i'),
      resetOtp: otp,
      resetOtpExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetOtp = null;
    user.resetOtpExpires = null;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error resetting password' });
  }
});

module.exports = router;