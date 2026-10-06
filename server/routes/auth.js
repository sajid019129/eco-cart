const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');

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
    const { name, email, password, avatar } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    const existingUser = await User.findOne({ email: new RegExp(`^${cleanEmail}$`, 'i') });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email: cleanEmail,
      password: hashedPassword,
      avatar: avatar || ''
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during registration' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    const user = await User.findOne({ email: new RegExp(`^${cleanEmail}$`, 'i') });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
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
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login' });
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
    res.status(500).json({ message: 'Failed to send email. Please check server email credentials.' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : '';

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