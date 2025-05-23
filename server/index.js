import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import authRoutes from './routes/auth.js';
import authenticateToken from './middleware/authMiddleware.js';




dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: `Hello ${req.user.username}, you have access!` });
});

app.get('/', (req, res) => {
  res.send('Manga Tracker API running...');
});

// Test DB connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('❌ DB connection failed:', err);
    } else {
      console.log('✅ DB connected at:', res.rows[0].now);
    }
  });

app.use('/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
