const express = require('express');
const router = express.Router();
const path = require('path');
const { pool } = require('../db/db');

// Ruta para la página principal
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/index.html'));
});

// Ruta para la página de información técnica
router.get('/info', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/info.html'));
});

// Ruta para la página sobre el sistema
router.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/about.html'));
});

// Ruta para la página de contacto
router.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/contact.html'));
});



// Ruta para guardar un mensaje en la base de datos
router.get('/save', async (req, res) => {
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
router.get('/messages', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM messages');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

module.exports = router;