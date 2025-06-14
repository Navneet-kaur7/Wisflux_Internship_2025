const express = require('express');
const app = express();

// Middleware 1: Log request method and URL
app.use((req, res, next) => {
    console.log(`${req.method} request to ${req.url}`);
    next();
});

// Middleware 2: Add a custom header
app.use((req, res, next) => {
    res.setHeader('X-Custom-Header', 'Middleware Chaining Example');
    console.log('Custom header added');
    next();
});

// Route handler
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

