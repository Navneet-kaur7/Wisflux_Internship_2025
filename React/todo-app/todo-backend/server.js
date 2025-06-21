const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || 'user',
  port: process.env.DB_PORT || 5432,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to PostgreSQL database:', err);
  } else {
    console.log('Connected to PostgreSQL database successfully');
    release();
  }
});

// Routes

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todolist ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create a new task
app.post('/api/tasks', async (req, res) => {
  const { text } = req.body;
  
  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Task text is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO todolist (text, completed, created_at) VALUES ($1, $2, NOW()) RETURNING *',
      [text.trim(), false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update a task (toggle completion or edit text)
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { text, completed } = req.body;

  try {
    let query, values;
    
    if (text !== undefined && completed !== undefined) {
      // Update both text and completion status
      query = 'UPDATE todolist SET text = $1, completed = $2, updated_at = NOW() WHERE id = $3 RETURNING *';
      values = [text, completed, id];
    } else if (completed !== undefined) {
      // Update only completion status
      query = 'UPDATE todolist SET completed = $1, updated_at = NOW() WHERE id = $2 RETURNING *';
      values = [completed, id];
    } else if (text !== undefined) {
      // Update only text
      query = 'UPDATE todolist SET text = $1, updated_at = NOW() WHERE id = $2 RETURNING *';
      values = [text, id];
    } else {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM todolist WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully', task: result.rows[0] });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Delete all completed tasks
app.delete('/api/tasks/completed', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM todolist WHERE completed = true RETURNING *');
    res.json({ 
      message: `${result.rows.length} completed tasks deleted successfully`,
      deletedTasks: result.rows 
    });
  } catch (err) {
    console.error('Error deleting completed tasks:', err);
    res.status(500).json({ error: 'Failed to delete completed tasks' });
  }
});

// Get task statistics
app.get('/api/tasks/stats', async (req, res) => {
  try {
    const totalResult = await pool.query('SELECT COUNT(*) as total FROM todolist');
    const completedResult = await pool.query('SELECT COUNT(*) as completed FROM todolist WHERE completed = true');
    
    const total = parseInt(totalResult.rows[0].total);
    const completed = parseInt(completedResult.rows[0].completed);
    const active = total - completed;
    
    res.json({
      total,
      completed,
      active
    });
  } catch (err) {
    console.error('Error fetching task statistics:', err);
    res.status(500).json({ error: 'Failed to fetch task statistics' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Todo API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});