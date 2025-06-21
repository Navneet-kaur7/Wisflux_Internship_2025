const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  user: 'postgres',          
  host: 'localhost',
  database: 'postgres',  
  password: 'user', 
  port: 5432,
});

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  const result = await pool.query('SELECT * FROM todolist ORDER BY id');
  res.json(result.rows);
});

// Add new task
app.post('/api/tasks', async (req, res) => {
  const { text } = req.body;
  const result = await pool.query(
    'INSERT INTO todolist (text, completed) VALUES ($1, false) RETURNING *',
    [text]
  );
  res.json(result.rows[0]);
});

// Toggle task completion
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  const result = await pool.query(
    'UPDATE todolist SET completed = $1 WHERE id = $2 RETURNING *',
    [completed, id]
  );
  res.json(result.rows[0]);
});

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM todolist WHERE id = $1', [id]);
  res.json({ success: true });
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});