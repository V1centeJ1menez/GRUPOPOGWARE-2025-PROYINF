require('dotenv').config();
const app = require('./src/app');
const pool = require('./src/db/db');
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server escuchando en http://localhost:${port}`);
});
