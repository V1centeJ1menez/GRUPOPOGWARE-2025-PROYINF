// routes/firmaRoutes.js (updated to use plural /firmas for consistency)
const express = require('express');
const router = express.Router();
router.use((req, res, next) => {
  console.log(`Request to firma service: ${req.method} ${req.path}`);
  next();
});

const {
  crear,
  listar,
  listarTodas,
  obtenerPorId,
  actualizarEstado,
  eliminar,
} = require('../controllers/firmaController');

// ------------- FIRMA (USUARIO AUTENTICADO) -------------
router.post('/firmas', crear);              // Registrar firma → crea fila en "Firma"
router.get('/firmas', listar);              // Listar firmas del usuario actual
router.get('/firmas/:id', obtenerPorId);    // Obtener firma específica

router.patch('/firmas/:id', actualizarEstado); // Cambiar estado (usuario=firmado/admin=validado)

router.delete('/firmas/:id', eliminar);     // Eliminar firma mientras no esté validada

// ------------- ADMIN -------------
router.get('/admin/firmas', listarTodas);   // Solo admin (valida por token)

module.exports = router;