const express = require('express');
const router = express.Router();
const { crear, listar, obtenerPorId, actualizarEstado, eliminar } = require('../controllers/solicitudController');

// CRUD básico para solicitudes del usuario autenticado
router.post('/solicitudes', crear);
router.get('/solicitudes', listar);
router.get('/solicitudes/:id', obtenerPorId);
router.patch('/solicitudes/:id', actualizarEstado);
router.delete('/solicitudes/:id', eliminar);

module.exports = router;
