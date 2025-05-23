// routes/auth.js
import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../db.js';
import jwt from 'jsonwebtoken'; // add this import at the top of the file if not already

const router = express.Router();

// POST /login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find user by email
      const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (userRes.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
  
      const user = userRes.rows[0];
  
      // Compare password with hash
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
  
      // Create JWT payload
      const payload = {
        userId: user.id,
        username: user.username,
        email: user.email
      };
  
      // Sign JWT
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      res.json({ message: 'Login successful', token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

// POST /register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [username, email, password_hash]
    );

    res.status(201).json({ message: 'User registered', user: newUser.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
