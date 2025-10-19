const express = require('express');
const path = require('path');

const app = express();

// Configurar middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde src/public
app.use('/public', express.static(path.join(__dirname, 'public')));

// Rutas (controllers)
const mainRoutes = require('./controllers/mainController');
const simuladorRoutes = require('./controllers/simuladorController');
const solicitudRoutes = require('./controllers/solicitudController');

app.use('/simulador', simuladorRoutes);
app.use('/solicitar', solicitudRoutes);
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

module.exports = app;
