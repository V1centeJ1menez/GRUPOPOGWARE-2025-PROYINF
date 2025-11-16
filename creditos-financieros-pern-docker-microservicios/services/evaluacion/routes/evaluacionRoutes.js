const express = require('express');
const router = express.Router();
const { evaluar, listarNotificaciones, marcarNotificacionLeida, obtenerUltimaEvaluacion } = require('../controllers/evaluacionController');

router.post('/evaluar', evaluar);
router.get('/notificaciones', listarNotificaciones);
router.patch('/notificaciones/:id/leida', marcarNotificacionLeida);
router.get('/evaluaciones/ultima', obtenerUltimaEvaluacion);

module.exports = router;
