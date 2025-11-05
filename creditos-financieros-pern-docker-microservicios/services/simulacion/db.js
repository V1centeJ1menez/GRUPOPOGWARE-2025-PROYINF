const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Función de reintentos para esperar a que la BD esté lista
async function connectWithRetry(maxRetries = 10, delay = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const client = await pool.connect();
      console.log("✅ Conexión exitosa a la base de datos");
      client.release();
      return true;
    } catch (err) {
      console.log(`⏳ Intento ${i + 1}/${maxRetries} - Esperando BD...`);
      if (i === maxRetries - 1) {
        console.error("❌ No se pudo conectar a la BD:", err.message);
        throw err;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

module.exports = { pool, connectWithRetry };

