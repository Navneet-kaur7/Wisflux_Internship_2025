const path = require('path');
const myPath = 'C:/Users/Documents/file.txt';
const myPath2 = 'C:/Users/Documents/Folder/file.html';
console.log('Directory Name:', path.dirname(myPath));   
console.log('Base Name:', path.basename(myPath));
console.log('Extension Name:', path.extname(myPath));
console.log('Path Object:', path.parse(myPath));
console.log('Join Paths:', path.join('C:/Users', 'Documents', 'file.txt'));
console.log('Relative Path:', path.relative(myPath, myPath2));

console.log('Path Separator:', path.sep);
console.log('Path Delimiter:', path.delimiter);
console.log('this file extension-', path.extname(__filename))
console.log('this file name-', path.basename(__filename));
console.log('this file directory name-', path.dirname(__filename));
