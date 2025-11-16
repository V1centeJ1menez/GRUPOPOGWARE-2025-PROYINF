const express = require('express');
const router = express.Router();
const { crear, listar, listarTodas, obtenerPorId, actualizarEstado, eliminar, evaluarSolicitud } = require('../controllers/solicitudController');

// CRUD básico para solicitudes del usuario autenticado
router.post('/solicitudes', crear);
router.get('/solicitudes', listar);
// Solo admin: listar todas las solicitudes
router.get('/solicitudes/admin', listarTodas);
router.get('/solicitudes/:id', obtenerPorId);
router.patch('/solicitudes/:id', actualizarEstado);
router.delete('/solicitudes/:id', eliminar);
// Evaluación de solicitud (invoca microservicio evaluación y actualiza estado)
router.post('/solicitudes/:id/evaluar', evaluarSolicitud);

module.exports = router;
