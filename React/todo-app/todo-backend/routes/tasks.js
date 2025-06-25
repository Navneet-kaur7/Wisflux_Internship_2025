const express = require('express');
const { Pool } = require('pg');
const { protect } = require('../middleware/auth');

const router = express.Router();

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'user'
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('PostgreSQL connection error:', err);
});

// Initialize tasks table
const initializeTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        text VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        user_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tasks table initialized');
  } catch (error) {
    console.error('Error initializing tasks table:', error);
  }
};

// Initialize table when server starts
initializeTable();

// GET /api/tasks - Get all tasks for authenticated user
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const result = await pool.query(
      'SELECT id, text, completed, created_at, updated_at FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message
    });
  }
});

// POST /api/tasks - Create a new task
router.post('/', protect, async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user._id.toString();

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task text is required'
      });
    }

    const result = await pool.query(
      'INSERT INTO tasks (text, user_id) VALUES ($1, $2) RETURNING id, text, completed, created_at, updated_at',
      [text.trim(), userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: error.message
    });
  }
});

// PUT /api/tasks/:id - Update a task
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, completed } = req.body;
    const userId = req.user._id.toString();

    // First check if task exists and belongs to user
    const checkResult = await pool.query(
      'SELECT id FROM tasks WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized'
      });
    }

    // Update the task
    let query = 'UPDATE tasks SET updated_at = CURRENT_TIMESTAMP';
    let params = [];
    let paramCount = 0;

    if (text !== undefined) {
      paramCount++;
      query += `, text = $${paramCount}`;
      params.push(text.trim());
    }

    if (completed !== undefined) {
      paramCount++;
      query += `, completed = $${paramCount}`;
      params.push(completed);
    }

    paramCount++;
    query += ` WHERE id = $${paramCount}`;
    params.push(id);

    paramCount++;
    query += ` AND user_id = $${paramCount}`;
    params.push(userId);

    query += ' RETURNING id, text, completed, created_at, updated_at';

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized'
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: error.message
    });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized'
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message
    });
  }
});

// DELETE /api/tasks/completed - Delete all completed tasks
router.delete('/completed', protect, async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const result = await pool.query(
      'DELETE FROM tasks WHERE completed = TRUE AND user_id = $1 RETURNING id',
      [userId]
    );

    res.json({
      success: true,
      message: `Deleted ${result.rows.length} completed tasks`
    });
  } catch (error) {
    console.error('Error deleting completed tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting completed tasks',
      error: error.message
    });
  }
});

module.exports = router;