const express = require('express');
const path = require('path');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

// app.get('/', (req, res) => {
// //   res.sendFile(path.join(__dirname, 'index.html'));
//   res.json({"Navneet" : 220191});
// });
// app.get('/about', (req, res) => {
//   res.sendFile(path.join(__dirname, 'about.html'));
// });



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});