const http = require('http');


const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    console.log(req.url);
    res.statusCode = 200;
    
    res.setHeader('Content-Type', 'text/html');
    if(req.url === '/') {
        res.statusCode = 200; 
        return res.end('<h1>This is Homepage.</h1>');

    } else if(req.url === '/about') {
        res.statusCode = 200; 
        return res.end('<h1>This is About Page.</h1>');

    }else{
        res.statusCode = 404; 
        return res.end('<h1>Page Not Found.</h1>');
    }

    
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
