const bcrypt = require('bcryptjs');
const { findUserByEmail, createUser } = require('../models/userModel');

function sanitizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

async function register(req, res, next) {
  try {
    const name = String(req.body.name || '').trim();
    const email = sanitizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await createUser({ name, email, passwordHash });

    return res.status(201).json({ message: 'Account created successfully' });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const email = sanitizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
};
