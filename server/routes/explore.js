import express, { Router } from 'express';
import axios from 'axios';
import { Pool } from 'pg';

const app = express();
const port = 3000;

// PostgreSQL connection pool
const pool = new Pool({
  user: 'your_pg_user',
  host: 'localhost',
  database: 'your_database',
  password: 'your_pg_password',
  port: 5432,
});

// Route to get manga details by ID
app.get('/api/manga/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Check if manga exists in the cache
    const cachedResult = await pool.query('SELECT * FROM cached_manga WHERE id = $1', [id]);

    if (cachedResult.rows.length > 0) {
      // Return cached data
      return res.json(cachedResult.rows[0]);
    }

    // Fetch manga details from MangaDex API
    const mangaResponse = await axios.get(`https://api.mangadex.org/manga/${id}`);
    const mangaData = mangaResponse.data.data;

    const title = mangaData.attributes.title.en || 'No Title';
    const description = mangaData.attributes.description.en || 'No Description';
    const genres = mangaData.attributes.tags.map(tag => tag.attributes.name.en);

    // Fetch cover art
    const coverRelationship = mangaData.relationships.find(rel => rel.type === 'cover_art');
    let cover_url = null;

    if (coverRelationship) {
      const coverId = coverRelationship.id;
      const coverResponse = await axios.get(`https://api.mangadex.org/cover/${coverId}`);
      const fileName = coverResponse.data.data.attributes.fileName;
      cover_url = `https://uploads.mangadex.org/covers/${id}/${fileName}`;
    }

    // Insert fetched data into the cache
    await pool.query(
      `INSERT INTO cached_manga (id, title, description, cover_url, genres)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, title, description, cover_url, genres]
    );

    // Return the fetched data
    res.json({ id, title, description, cover_url, genres });
  } catch (error) {
    console.error('Error fetching manga:', error.message);
    res.status(500).json({ error: 'Failed to fetch manga details' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;