// server/routes/manga.js
import express from 'express';
import pool from '../db.js';
import authenticateToken from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/manga
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const result = await pool.query(
      `SELECT 
         id, 
         title, 
         status, 
         chapters_read AS "chaptersRead" 
       FROM user_manga 
       WHERE user_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch manga' });
  }
});

// POST /api/manga
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { title, status, chaptersRead } = req.body;
    const result = await pool.query(
      `INSERT INTO user_manga 
         (user_id, title, status, chapters_read) 
       VALUES 
         ($1, $2, $3, $4) 
       RETURNING 
         id, title, status, chapters_read AS "chaptersRead"`,
      [userId, title, status, chaptersRead]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add manga' });
  }
});

export default router;
