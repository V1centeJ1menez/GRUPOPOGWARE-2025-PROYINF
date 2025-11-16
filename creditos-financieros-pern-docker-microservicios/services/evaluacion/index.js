const express = require("express");
require("dotenv").config();
const { pool } = require("./db");
const evaluacionRoutes = require("./routes/evaluacionRoutes");

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true, service: 'evaluacion' }));
app.get("/", (_req, res) => res.send("Servicio Evaluación funcionando 🚀"));

app.use("/api", evaluacionRoutes);

async function connectWithRetry(retries = 10, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      await client.query("SELECT NOW()");
      client.release();
      console.log("✅ [evaluacion] Conectado a BD");
      return;
    } catch (e) {
      console.log(`⏳ [evaluacion] Intento ${i + 1}/${retries} esperando BD...`);
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

(async () => {
  try {
    await connectWithRetry();
    // Crear tablas si no existen (fallback a migraciones)
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS evaluaciones (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          solicitud_id INTEGER,
          monto NUMERIC NOT NULL,
          plazo INTEGER NOT NULL,
          tasa_base NUMERIC,
          cae NUMERIC,
          cuota_mensual NUMERIC,
          decision VARCHAR(16) NOT NULL,
          score NUMERIC,
          razones JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
        );
        CREATE INDEX IF NOT EXISTS evaluaciones_user_id_idx ON evaluaciones(user_id);
        CREATE TABLE IF NOT EXISTS notificaciones (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          tipo VARCHAR(32) NOT NULL,
          titulo TEXT,
          mensaje TEXT,
          leida BOOLEAN DEFAULT FALSE NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
        );
        CREATE INDEX IF NOT EXISTS notificaciones_user_leida_idx ON notificaciones(user_id, leida);
      `);
    } finally {
      client.release();
    }
    app.listen(process.env.PORT || 3004, () => console.log(`✅ Evaluación escuchando en puerto ${process.env.PORT || 3004}`));
  } catch (e) {
    console.error("❌ Error al iniciar evaluacion:", e);
    process.exit(1);
  }
})();
