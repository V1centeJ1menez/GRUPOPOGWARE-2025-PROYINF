const { Pool } = require("pg");
require("dotenv").config();

// Si existe DATABASE_URL, úsala.
// Si no, arma la URL usando las variables sueltas.
const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const pool = new Pool({
  connectionString,
});

module.exports = { pool };
