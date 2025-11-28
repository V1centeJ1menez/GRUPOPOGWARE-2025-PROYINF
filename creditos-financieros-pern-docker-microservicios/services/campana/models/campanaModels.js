const pool = require("../db");

async function crearCampana({ nombre, email, monto, rut }) {
  const query = `
    INSERT INTO campana (nombre, email, monto, rut_cliente, estado)
    VALUES ($1, $2, $3, $4, 'activa')
  `;
  await pool.query(query, [nombre, email, monto, rut]);
}

async function obtenerCampanasActivas() {
  const result = await pool.query(
    "SELECT * FROM campana WHERE estado = 'activa'"
  );
  return result.rows;
}

async function obtenerCampanaPorRut(rut) {
  const result = await pool.query(
    "SELECT * FROM campana WHERE rut_cliente = $1",
    [rut]
  );
  return result.rows;
}

module.exports = { crearCampana, obtenerCampanasActivas, obtenerCampanaPorRut };
