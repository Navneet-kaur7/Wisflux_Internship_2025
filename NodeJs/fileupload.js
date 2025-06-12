const http = require('http');
const formidable = require('formidable');
const fs = require('fs');

http.createServer((req, res) => {
  if (req.url === '/fileupload' && req.method === 'POST') {
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields, files) => {
      if (err) {
        res.write('Error during file upload');
        return res.end();
      }

      const oldPath = files.filetoupload.filepath;
      const newPath = './' + files.filetoupload.originalFilename;

      fs.rename(oldPath, newPath, (err) => {
        if (err) throw err;
        res.write('File uploaded and moved!');
        res.end();
      });
    });

  } else {
    // Show the file upload form
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
    res.write('<input type="file" name="filetoupload"><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    res.end();
  }
}).listen(5050);
console.log('Server running at http://localhost:5050/');