const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

router.get('/signup', (req, res) => res.render('signup'));
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ name, email, password: hashed });
    req.session.user = { _id: user._id, name: user.name, email: user.email };
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('signup', { error: 'Email may already be used' });
  }
});

router.get('/login', (req, res) => res.render('login'));
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.render('login', { error: 'Invalid credentials' });
  const ok = await user.comparePassword(password);
  if (!ok) return res.render('login', { error: 'Invalid credentials' });
  req.session.user = { _id: user._id, name: user.name, email: user.email };
  res.redirect('/dashboard');
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => res.redirect('/auth/login'));
});

module.exports = router;
