const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { pool } = require("./db");
const solicitudRoutes = require("./routes/solicitudRoutes");

const app = express();
app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", service: "solicitud" });
});

app.get("/", (req, res) => {
  res.send("Servicio Solicitud funcionando 🚀");
});

app.use("/api", solicitudRoutes);

const PORT = process.env.PORT || 5007;

async function ensureDatabase() {
  // Reintentos de conexión a la BD y creación de tabla si no existe
  const maxRetries = 10;
  const delay = 2000;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const client = await pool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS solicitudes (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            monto NUMERIC(18,2) NOT NULL,
            plazo INTEGER NOT NULL,
            tasa_base NUMERIC(10,6) NOT NULL,
            cae NUMERIC(10,6) NOT NULL,
            cuota_mensual NUMERIC(18,2) NOT NULL,
            monto_total NUMERIC(18,2) NOT NULL,
            monto_liquido NUMERIC(18,2) NOT NULL,
            intereses_totales NUMERIC(18,2) NOT NULL,
            gastos_operacionales NUMERIC(18,2) NOT NULL,
            comision_apertura NUMERIC(18,2) NOT NULL,
            estado TEXT DEFAULT 'borrador',
            origen TEXT DEFAULT 'simulacion',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);
      } finally {
        client.release();
      }
      return; // Éxito
    } catch (err) {
      console.log(`⏳ [solicitud] Intento ${i + 1}/${maxRetries} conectando a BD...`);
      if (i === maxRetries - 1) {
        console.error("❌ [solicitud] No se pudo conectar a la BD:", err.message);
        throw err;
      }
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

async function start() {
  try {
    await ensureDatabase();
    app.listen(PORT, () => console.log(`✅ Solicitud escuchando en puerto ${PORT}`));
  } catch (e) {
    console.error("❌ Error al iniciar servicio solicitud:", e);
    process.exit(1);
  }
}

start();
