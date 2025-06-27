// server/routes/manga.js
import express from "express";
import pool from "../db.js";
import authenticateToken from "../middleware/authMiddleware.js";
import axios from "axios";

const router = express.Router();

// GET /api/manga/fetch/:id
router.get("/fetch/:id", async (req, res) => {
  const id = req.params.id;

  try {
    // 1. Check PostgreSQL cache
    const cached = await pool.query(
      "SELECT * FROM cached_manga WHERE id = $1",
      [id]
    );

    if (cached.rows.length > 0) {
      console.log("✅ Served from cache");
      return res.json(cached.rows[0]);
    }

    // 2. Fetch from MangaDex API
    const url = `https://api.mangadex.org/manga/${id}?includes[]=cover_art`;
    const response = await axios.get(url);
    const data = response.data.data;

    const title = data.attributes.title.en || "Untitled";
    const description = data.attributes.description.en || "No description";
    const status = data.attributes.status || "Unknown";

    const cover = data.relationships.find((rel) => rel.type === "cover_art");
    const coverFileName = cover?.attributes?.fileName || "";
    const coverUrl = `https://uploads.mangadex.org/covers/${id}/${coverFileName}`;

    // Extract genre names
    const genreResponse = await axios.get(
      `https://api.mangadex.org/manga/${id}/aggregate`
    );
    const genres = data.attributes.tags
      .filter((tag) => tag.attributes.group === "genre")
      .map((tag) => tag.attributes.name.en);

    // 3. Insert into PostgreSQL cache
    await pool.query(
      `INSERT INTO cached_manga (id, title, description, cover_url, genres, last_fetched)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [id, title, description, coverUrl, genres]
    );

    console.log("📦 Fetched from MangaDex and cached");
    res.json({
      manga_id: id,
      title,
      description,
      status,
      cover_url: coverUrl,
      genres,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch manga info" });
  }
});

// GET /api/manga
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const result = await pool.query(
      `SELECT 
         id, 
         title, 
         status, 
         chapters_read AS "chaptersRead",
         cover_url,
         genres
       FROM user_manga 
       WHERE user_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch manga" });
  }
});

// POST /api/manga
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { title, status, chaptersRead, coverUrl, genres } = req.body;

    const result = await pool.query(
      `INSERT INTO user_manga 
         (user_id, title, status, chapters_read, cover_url, genres) 
       VALUES 
         ($1, $2, $3, $4, $5, $6) 
       RETURNING 
         id, title, status, chapters_read AS "chaptersRead", cover_url, genres`,
      [userId, title, status, chaptersRead, coverUrl, genres]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ INSERT ERROR:", err); // ✅
    res.status(500).json({ error: "Failed to add manga" });
  }
});


// DELETE /api/manga/:id
router.delete("/:id", authenticateToken, async (req, res) => {
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
    res.status(500).json({ error: "Failed to delete manga" });
  }
});

// PUT /api/manga/:id
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const { title, status, chaptersRead } = req.body;

    // Get current cover_url
    const existing = await pool.query(
      `SELECT cover_url FROM user_manga WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Manga not found" });
    }

    const coverUrl = existing.rows[0].cover_url;

    const result = await pool.query(
      `UPDATE user_manga 
       SET title = $1, status = $2, chapters_read = $3, cover_url = $4 
       WHERE id = $5 AND user_id = $6 
       RETURNING id, title, status, chapters_read AS "chaptersRead", cover_url`,
      [title, status, chaptersRead, coverUrl, id, userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update manga" });
  }
});

// GET /api/manga/search?title=naruto
router.get("/search", async (req, res) => {
  const { title } = req.query;

  if (!title) {
    return res.status(400).json({ error: "Title query parameter is required" });
  }

  try {
    // 1. Call MangaDex API
    const response = await axios.get(`https://api.mangadex.org/manga`, {
      params: {
        title,
        includes: ["cover_art"],
        limit: 10, // Change this if you want more or fewer results
      },
    });

    const results = response.data.data;

    // 2. Format the response
    const formatted = results.map((manga) => {
      const mangaId = manga.id;
      const attributes = manga.attributes;
      const genres = attributes.tags
        .filter((tag) => tag.attributes.group === "genre")
        .map((tag) => tag.attributes.name.en);
      const cover = manga.relationships.find((rel) => rel.type === "cover_art");
      const coverFileName = cover?.attributes?.fileName || "";
      const coverUrl = coverFileName
        ? `https://uploads.mangadex.org/covers/${mangaId}/${coverFileName}`
        : "";

      return {
        id: mangaId,
        title: attributes.title.en || "Untitled",
        description: attributes.description.en || "No description available.",
        status: attributes.status || "Unknown",
        coverUrl,
        genres,
      };
    });

    // 3. Send results to frontend
    res.json(formatted);
  } catch (error) {
    console.error("❌ MangaDex search error:", error.message);
    res
      .status(500)
      .json({ error: "Failed to fetch search results from MangaDex" });
  }
});

// GET /api/manga/recommendations
router.get("/recommendations", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    // 1. Get all user's genres from their library
    const userGenresResult = await pool.query(
      `SELECT genres FROM user_manga WHERE user_id = $1 AND genres IS NOT NULL`,
      [userId]
    );

    const userGenres = userGenresResult.rows
      .flatMap(row => row.genres)
      .filter((v, i, arr) => arr.indexOf(v) === i); // unique

    if (userGenres.length === 0) {
      return res.json([]); // No genres → no recommendations
    }

    // 2. Query cached_manga for similar genre overlap
    const similarMangaResult = await pool.query(
      `SELECT id, title, cover_url, genres
       FROM cached_manga
       WHERE genres && $1::text[]
       ORDER BY array_length(array(SELECT unnest(genres) INTERSECT SELECT unnest($1::text[])), 1) DESC
       LIMIT 10`,
      [userGenres]
    );

    res.json(similarMangaResult.rows);
  } catch (err) {
    console.error("❌ Recommendation error:", err);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});


export default router;
