// routes/desembolsoRoutes.js
const express = require('express');
const router = express.Router();

const {
  crear,
  listar,
  listarTodas,
  obtenerPorId,
  actualizarEstado,
  eliminar
} = require('../controllers/desembolsoController');

// Rutas públicas para usuario autenticado
router.post('/desembolsos', crear);          // Crear/desencadenar desembolso (simulado)
router.get('/desembolsos', listar);          // Listar desembolsos del usuario
router.get('/desembolsos/:id', obtenerPorId);// Obtener desembolso por id

router.patch('/desembolsos/:id', actualizarEstado); // Admin: actualizar estado
router.delete('/desembolsos/:id', eliminar);        // Borrar si pendiente (owner)

// Admin
router.get('/admin/desembolsos', listarTodas);

module.exports = router;
