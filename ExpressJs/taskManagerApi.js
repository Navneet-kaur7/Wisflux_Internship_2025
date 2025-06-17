const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 5000;

app.use(bodyParser.json());

let tasks = []; 

// Create a Task
app.post('/tasks', (req, res) => {
    const { title, description } = req.body;
    const newTask = {
        id: uuidv4(),
        title,
        description,
        completed: false,
    };
    tasks.push(newTask);
    res.status(201).json(newTask);
});

//  Get All Tasks
app.get('/tasks', (req, res) => {
    res.json(tasks);
});

//  Get Task by ID
app.get('/tasks/:id', (req, res) => {
    const task = tasks.find(t => t.id === req.params.id);
    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
});

//  Update a Task
app.put('/tasks/:id', (req, res) => {
    const { title, description, completed } = req.body;
    const task = tasks.find(t => t.id === req.params.id);
    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (completed !== undefined) task.completed = completed;

    res.json(task);
});

//  Delete a Task
app.delete('/tasks/:id', (req, res) => {
    const index = tasks.findIndex(t => t.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ message: 'Task not found' });
    }
    tasks.splice(index, 1);
    res.status(204).send();
});

app.listen(port, () => {
    console.log(`Task Manager API running at http://localhost:${port}`);
});
