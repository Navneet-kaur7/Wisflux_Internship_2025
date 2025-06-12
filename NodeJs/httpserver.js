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
// var http = require('http');
// var url = require('url');

// http.createServer(function (req, res) {
//   res.writeHead(200, {'Content-Type': 'text/html'});
//   var q = url.parse(req.url, true).query;
//   var txt = q.year + " " + q.month;
//   res.end(txt);
// }).listen(8080);