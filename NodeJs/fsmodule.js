const fs = require('fs');
const path = require('path');

fs.readFile('./NodeJs/file.txt', 'utf8', (err, data) => {
    console.log(err, data)
});


fs.writeFile('file2.txt', 'This is a new file created using fs module.', (err) => {
    if (err) {
        console.error('Error writing file:', err);
    } else {
        console.log('File written successfully');
    }
});

const a = fs.readFileSync('file2.txt', 'utf8');
console.log('Synchronous read:', a);
