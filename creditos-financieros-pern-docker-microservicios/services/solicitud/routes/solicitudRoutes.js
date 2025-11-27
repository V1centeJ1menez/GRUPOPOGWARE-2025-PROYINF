const express = require('express');
const router = express.Router();
const {
  crear,
  listar,
  listarTodas,
  obtenerPorId,
  actualizarEstado,
  eliminar,
  evaluarSolicitud,
  listarNotificaciones
} = require('../controllers/solicitudController');

// Rutas para usuarios autenticados
router.post('/solicitudes', crear); // Crear solicitud
router.get('/solicitudes', listar); // Listar solicitudes del usuario
router.get('/solicitudes/admin', listarTodas);
router.get('/solicitudes/:id', obtenerPorId); // Obtener solicitud por ID
router.patch('/solicitudes/:id', actualizarEstado); // Actualizar estado (limitado)
router.delete('/solicitudes/:id', eliminar); // Eliminar solicitud

// Rutas admin
router.get('/admin/solicitudes', listarTodas); // Listar todas
router.post('/admin/solicitudes/:id/evaluar', evaluarSolicitud); // Evaluar solicitud

// Notificaciones (usuario)
router.get('/notificaciones', listarNotificaciones);



module.exports = router;