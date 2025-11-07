// Rutas para simulación
const express = require('express');
const router = express.Router();
const { simular, obtenerHistorial, obtenerPorId, eliminar, obtenerConfiguracion } = require('../controllers/simulacionController');

// GET /config - Obtener configuración del simulador (público, sin auth)
router.get('/config', obtenerConfiguracion);

// POST /simular - Crear nueva simulación
router.post('/simular', simular);

// GET /historial - Obtener historial de simulaciones del usuario
// Query params: ?limit=4 (opcional)
router.get('/historial', obtenerHistorial);

// GET /:id - Obtener una simulación específica
router.get('/:id', obtenerPorId);

// DELETE /:id - Eliminar una simulación
router.delete('/:id', eliminar);

module.exports = router;

