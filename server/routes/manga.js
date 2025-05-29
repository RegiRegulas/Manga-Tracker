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

//PUT /api/manga/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const { title, status, chaptersRead } = req.body;
    const result = await pool.query(
      `UPDATE user_manga 
       SET title = $1, status = $2, chapters_read = $3 
       WHERE id = $4 AND user_id = $5 
       RETURNING id`,
      [title, status, chaptersRead, id, userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update manga' });
  }
});

// DELETE /api/manga/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM user_manga 
       WHERE id = $1 AND user_id = $2 
       RETURNING id`,
      [id, userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete manga' });
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
