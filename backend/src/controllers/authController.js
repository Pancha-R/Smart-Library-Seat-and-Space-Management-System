const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../firebase');

// Validate SJP email
const isValidSJPEmail = (email) => {
  return email.toLowerCase().endsWith('@sjp.ac.lk');
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, regNumber, password } = req.body;

    if (!name || !email || !regNumber || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!isValidSJPEmail(email)) {
      return res.status(400).json({
        error: 'Email must be a valid University of Sri Jayewardenepura email (@sjp.ac.lk)',
      });
    }

    // Check if email already exists
    const existing = await db.collection('users')
      .where('email', '==', email.toLowerCase())
      .get();

    if (!existing.empty) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userRef = await db.collection('users').add({
      name,
      email: email.toLowerCase(),
      regNumber: regNumber.toUpperCase(),
      password: hashedPassword,
      penalties: 0,
      isBanned: false,
      currentReservationId: null,
      createdAt: new Date().toISOString(),
    });

    const token = jwt.sign(
      { userId: userRef.id, email, name, regNumber },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: userRef.id,
        name,
        email: email.toLowerCase(),
        regNumber: regNumber.toUpperCase(),
        penalties: 0,
        isBanned: false,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!isValidSJPEmail(email)) {
      return res.status(400).json({
        error: 'Please use your University email (@sjp.ac.lk)',
      });
    }

    // Find user
    const snapshot = await db.collection('users')
      .where('email', '==', email.toLowerCase())
      .get();

    if (snapshot.empty) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    // Check password
    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if banned
    if (userData.isBanned) {
      return res.status(403).json({
        error: 'Your account is temporarily banned due to 5 consecutive penalties.',
      });
    }

    const token = jwt.sign(
      {
        userId: userDoc.id,
        email: userData.email,
        name: userData.name,
        regNumber: userData.regNumber,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: userDoc.id,
        name: userData.name,
        email: userData.email,
        regNumber: userData.regNumber,
        penalties: userData.penalties,
        isBanned: userData.isBanned,
        currentReservationId: userData.currentReservationId,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};