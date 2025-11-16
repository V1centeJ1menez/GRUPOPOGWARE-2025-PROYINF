const { pool } = require('../db');

function getUserIdFromToken(req) {
  if (req.userId) return req.userId;
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.userId || payload.id || payload.sub;
  } catch (error) {
    console.error('Error al extraer userId del token:', error);
    return null;
  }
}

exports.crear = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });

    const {
      monto,
      plazo,
      tasaBase,
      cae,
      cuotaMensual,
      montoTotal,
      montoLiquido,
      interesesTotales,
      gastosOperacionales,
      comisionApertura,
      origen = 'simulacion',
      estado = 'borrador',
    } = req.body;

    if (!monto || !plazo) return res.status(400).json({ error: 'Faltan datos: monto y plazo son requeridos' });

    const query = `
      INSERT INTO solicitudes (
        user_id, monto, plazo, tasa_base, cae, cuota_mensual,
        monto_total, monto_liquido, intereses_totales,
        gastos_operacionales, comision_apertura, estado, origen
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *
    `;
    const values = [
      userId, monto, plazo, tasaBase, cae, cuotaMensual,
      montoTotal, montoLiquido, interesesTotales,
      gastosOperacionales, comisionApertura, estado, origen,
    ];
    const result = await pool.query(query, values);
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear solicitud:', err);
    res.status(500).json({ error: 'Error al crear solicitud' });
  }
};

exports.listar = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });

    const result = await pool.query(
      `SELECT * FROM solicitudes WHERE user_id=$1 ORDER BY created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al listar solicitudes:', err);
    res.status(500).json({ error: 'Error al listar solicitudes' });
  }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });

    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM solicitudes WHERE id=$1 AND user_id=$2`,
      [id, userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Solicitud no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener solicitud:', err);
    res.status(500).json({ error: 'Error al obtener solicitud' });
  }
};

exports.actualizarEstado = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });

    const { id } = req.params;
    const { estado } = req.body;
    if (!estado) return res.status(400).json({ error: 'Estado es requerido' });

    const result = await pool.query(
      `UPDATE solicitudes SET estado=$1, updated_at=NOW() WHERE id=$2 AND user_id=$3 RETURNING *`,
      [estado, id, userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Solicitud no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar estado:', err);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });

    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM solicitudes WHERE id=$1 AND user_id=$2 RETURNING id`,
      [id, userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Solicitud no encontrada' });
    res.json({ message: 'Solicitud eliminada', id: result.rows[0].id });
  } catch (err) {
    console.error('Error al eliminar solicitud:', err);
    res.status(500).json({ error: 'Error al eliminar solicitud' });
  }
};
