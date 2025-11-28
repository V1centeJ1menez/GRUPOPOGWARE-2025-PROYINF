const express = require("express");
const { enviarPreAprobacion, enviarBienvenida } = require("../controllers/campanaControllers");

module.exports = () => {
  const router = express.Router();

  // ================================
  // GET /campana  → campañas activas
  // ================================
  router.get("/", async (req, res) => {
    try {
      const data = await Campana.obtenerCampanasActivas();
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error en consulta de campañas activas" });
    }
  });

  // ====================================
  // GET /campana/:rut  → campañas por RUT
  // ====================================
  router.get("/:rut", async (req, res) => {
    try {
      const data = await Campana.obtenerCampanaPorRut(req.params.rut);
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error buscando campaña por RUT" });
    }
  });

  // ==================================================
  // POST /campana/registro → correo de bienvenida
  // ==================================================
  router.post("/registro", enviarBienvenida);

  // ==========================================================
  // POST /campana/preaprobacion → guardar y enviar pre-aprobado
  // ==========================================================
  router.post("/preaprobacion", enviarPreAprobacion);

  return router;
};
