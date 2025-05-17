const express = require('express');
const db = require('../db'); // Uses the exported query function

const router = express.Router();

// GET /api/content/posts - Fetch multiple posts with author names
router.get('/posts', async (req, res) => {
  console.log('Received request for /api/content/posts with query:', req.query);
  
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = parseInt(req.query.offset, 10) || 0;
  const sortBy = req.query.sort_by || 'created_at';
  const order = req.query.order === 'asc' ? 'ASC' : 'DESC';

  // Basic validation for sortBy to prevent SQL injection if it's directly used
  const allowedSortColumns = ['created_at', 'updated_at', 'title', 'id'];
  if (!allowedSortColumns.includes(sortBy)) {
    return res.status(400).json({ error: 'Invalid sort_by parameter' });
  }

  try {
    // First verify the schemas exist
    const schemaCheck = await db.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name IN ('content', 'identity');
    `);
    console.log('Available schemas:', schemaCheck);

    // Then verify the tables exist
    const tableCheck = await db.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema IN ('content', 'identity') 
      AND table_name IN ('posts', 'users');
    `);
    console.log('Available tables:', tableCheck);

    const postsQuery = `
      SELECT 
        p.id,
        p.title,
        p.slug,
        p.excerpt,
        p.cover_image,
        p.alt_text,
        p.attribution,
        p.attribution_link,
        p.tags,
        p.metadata,
        p.created_at,
        p.updated_at,
        p.author_id,
        COALESCE(
          CASE 
            WHEN u.first_name IS NOT NULL AND u.last_name IS NOT NULL 
            THEN u.first_name || ' ' || u.last_name
            WHEN u.first_name IS NOT NULL 
            THEN u.first_name
            WHEN u.last_name IS NOT NULL 
            THEN u.last_name
            ELSE 'Unknown Author'
          END
        ) as author_name
      FROM content.posts p
      LEFT JOIN identity.users u ON p.author_id = u.id
      ORDER BY p."${sortBy}" ${order}
      LIMIT $1
      OFFSET $2;
    `;
    
    console.log('Executing posts query...');
    const posts = await db.query(postsQuery, [limit, offset]);
    console.log(`Retrieved ${posts.length} posts`);
    
    const totalPostsResult = await db.query('SELECT COUNT(*) AS total FROM content.posts;');
    const total = totalPostsResult[0] ? parseInt(totalPostsResult[0].total, 10) : 0;
    console.log('Total posts count:', total);

    res.json({
      data: posts,
      pagination: {
        total_items: total,
        limit: limit,
        offset: offset,
        total_pages: Math.ceil(total / limit),
        current_page: Math.floor(offset / limit) + 1
      }
    });

  } catch (error) {
    console.error('Error in /api/content/posts:', {
      error: error.message,
      stack: error.stack,
      query: req.query
    });
    res.status(500).json({ 
      error: 'Failed to fetch posts', 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/content/posts/:identifier - Fetch a single post by slug or ID
router.get('/posts/:identifier', async (req, res) => {
  const { identifier } = req.params;
  let queryParams = [identifier];
  let postQueryBase = `
    SELECT 
      p.*, 
      COALESCE(
        CASE 
          WHEN u.first_name IS NOT NULL AND u.last_name IS NOT NULL 
          THEN u.first_name || ' ' || u.last_name
          WHEN u.first_name IS NOT NULL 
          THEN u.first_name
          WHEN u.last_name IS NOT NULL 
          THEN u.last_name
          ELSE 'Unknown Author'
        END
      ) as author_name
    FROM content.posts p
    LEFT JOIN identity.users u ON p.author_id = u.id
  `;

  try {
    if (!isNaN(parseInt(identifier, 10))) {
      postQueryBase += ' WHERE p.id = $1';
    } else {
      postQueryBase += ' WHERE p.slug = $1';
    }
    
    const results = await db.query(postQueryBase, queryParams);
    const post = results.length > 0 ? results[0] : null;

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error('Error in /api/content/posts/:identifier:', error);
    res.status(500).json({ error: 'Failed to fetch post', message: error.message });
  }
});

// GET /api/content/authors/:author_id_uuid - Fetch author details
router.get('/authors/:author_id', async (req, res) => {
  const { author_id } = req.params;

  try {
    const authorQuery = `
      SELECT 
        ca.id,
        COALESCE(
          CASE 
            WHEN u.first_name IS NOT NULL AND u.last_name IS NOT NULL 
            THEN u.first_name || ' ' || u.last_name
            WHEN u.first_name IS NOT NULL 
            THEN u.first_name
            WHEN u.last_name IS NOT NULL 
            THEN u.last_name
            ELSE 'Unknown Author'
          END
        ) as name,
        ca.created_at,
        ca.updated_at,
        iu.email
      FROM content.authors ca
      JOIN identity.users iu ON ca.id = iu.id
      WHERE ca.id = $1;
    `;
    
    const results = await db.query(authorQuery, [author_id]);
    const author = results.length > 0 ? results[0] : null;

    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }
    res.json(author);
  } catch (error) {
    console.error('Error in /api/content/authors/:author_id:', error);
    res.status(500).json({ error: 'Failed to fetch author', message: error.message });
  }
});

module.exports = router; 