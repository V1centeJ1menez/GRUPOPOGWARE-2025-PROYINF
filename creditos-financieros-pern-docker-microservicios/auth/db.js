const { Pool } = require("pg");
require("dotenv").config();

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const pool = new Pool({ connectionString });

pool.connect()
  .then(() => console.log(`✅ Conectado a ${process.env.DB_NAME}`))
  .catch((err) => console.error("❌ Error de conexión a BD:", err));

module.exports = { pool };
