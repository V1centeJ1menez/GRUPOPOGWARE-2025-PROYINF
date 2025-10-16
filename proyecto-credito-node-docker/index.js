const express = require('express');
const pool = require('./db'); // Importar la conexión
const path = require('path');
const app = express();
const port = 3000;

// Configurar middleware para servir vistas desde src/views
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');


//permitir que parse json
app.use(express.json());      // parse application/json
app.use(express.urlencoded({ extended: true })); // parse form data if needed


// Importar las rutas principales desde src/controllers
const mainRoutes = require('./src/controllers/mainController');
const simuladorRoutes = require('./src/controllers/simuladorController');
app.use(express.json());
app.use('/simulador', simuladorRoutes);


// Usar las rutas principales
app.use('/', mainRoutes);

// Ruta de prueba que guarda un mensaje en la base de datos
app.get('/save', async (req, res) => {
  try {
    await pool.query('CREATE TABLE IF NOT EXISTS messages (id SERIAL PRIMARY KEY, content TEXT)');
    await pool.query('INSERT INTO messages (content) VALUES ($1)', ['Hola desde PostgreSQL!']);
    res.send('Mensaje guardado en la base de datos');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error');
  }
});

// Ruta para obtener todos los mensajes
app.get('/messages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM messages');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error');
  }
});

app.listen(port, () => {
  console.log(`App corriendo en http://localhost:${port}`);
});

