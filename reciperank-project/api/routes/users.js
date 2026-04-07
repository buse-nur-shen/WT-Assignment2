const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
 
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
 
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }
 
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
 
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email is already registered' });
    }
 
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username is already taken' });
    }
 
    const user = new User({ username, email, password });
    await user.save();
 
    res.status(201).json({ message: 'User created successfully' });
 
  } catch (err) {
 
    res.status(400).json({ message: err.message });
  }
});
 
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
 
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
 
    const user = await User.findOne({ email });
    if (!user) {
 
      return res.status(400).json({ message: 'Invalid email or password' });
    }
 
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
 
    req.session.userId = user._id;
 
    res.cookie('username', user.username, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: false
    });
 
    res.json({ message: 'Login successful', username: user.username });
 
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
 
router.post('/logout', (req, res) => {
 
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
 
    res.clearCookie('username');
 
    res.json({ message: 'Logged out successfully' });
  });
});
 
router.get('/profile', auth, async (req, res) => {
  try {
 
    const user = await User.findById(req.session.userId).select('-password');
 
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
 
    res.json(user);
 
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
 
module.exports = router;