
const express = require("express");
require("dotenv").config();
const { pool, connectWithRetry } = require("./db");
const simulacionRoutes = require("./routes/simulacionRoutes");

const app = express();
app.use(express.json());

// Ruta de salud (health check)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", service: "simulacion" });
});

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servicio Simulación funcionando 🚀");
});

// Rutas de simulación
app.use("/api", simulacionRoutes);

// Plantilla para agregar más rutas o middlewares
// app.use('/otra', require('./routes/otraRoutes'));

// Iniciar servidor con reintentos de conexión
const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await connectWithRetry();
    app.listen(PORT, () => {
      console.log(`✅ Simulación escuchando en puerto ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

startServer();

