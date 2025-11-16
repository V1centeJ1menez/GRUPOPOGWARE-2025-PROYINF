const { pool } = require('../db');
const axios = require('axios');

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

function isAdminFromToken(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return false;
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.role === 'admin';
  } catch (error) {
    console.error('Error al verificar rol admin del token:', error);
    return false;
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
    const created = result.rows[0];

    // Si viene como enviada, auto-evaluar
    if ((estado || '').toLowerCase() === 'enviada') {
      try {
        const evalUrl = process.env.EVALUACION_URL || 'http://evaluacion:3004';
        const headers = { Authorization: req.headers.authorization || '' };
        const payload = {
          solicitudId: created.id,
          monto: Number(created.monto),
          plazo: created.plazo,
          tasaBase: Number(created.tasa_base),
          cae: Number(created.cae),
          cuotaMensual: Number(created.cuota_mensual),
          gastosOperacionales: Number(created.gastos_operacionales),
          comisionApertura: Number(created.comision_apertura),
        };
        const resp = await axios.post(`${evalUrl}/api/evaluar`, payload, { headers });
        const decision = resp.data?.evaluacion?.decision || 'en_revision';
        const nuevoEstado = decision === 'aprobada' ? 'aprobada' : (decision === 'rechazada' ? 'rechazada' : 'en_revision');
        await pool.query('UPDATE solicitudes SET estado=$1, updated_at=NOW() WHERE id=$2', [nuevoEstado, created.id]);
        return res.json({ ...created, estado: nuevoEstado, evaluacion: resp.data });
      } catch (e) {
        console.error('Error auto-evaluando solicitud creada:', e.message);
        // Devuelve creada como enviada si falla la evaluación; el cliente podrá reintentar
        return res.json(created);
      }
    }

    return res.json(created);
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

exports.listarTodas = async (req, res) => {
  try {
    const isAdmin = isAdminFromToken(req);
    if (!isAdmin) return res.status(403).json({ error: 'No autorizado' });

    const result = await pool.query(
      `SELECT * FROM solicitudes ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al listar todas las solicitudes:', err);
    res.status(500).json({ error: 'Error al listar todas las solicitudes' });
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

exports.evaluarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromToken(req);
    const isAdmin = isAdminFromToken(req);
    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });
    const row = await pool.query('SELECT * FROM solicitudes WHERE id=$1', [id]);
    if (row.rows.length === 0) return res.status(404).json({ error: 'Solicitud no encontrada' });
    const s = row.rows[0];
    if (!isAdmin && s.user_id !== userId) return res.status(403).json({ error: 'No autorizado' });

    const evalUrl = process.env.EVALUACION_URL || 'http://evaluacion:3004';
    const headers = { Authorization: req.headers.authorization || '' };
    const payload = {
      solicitudId: s.id,
      monto: Number(s.monto),
      plazo: s.plazo,
      tasaBase: Number(s.tasa_base),
      cae: Number(s.cae),
      cuotaMensual: Number(s.cuota_mensual),
      gastosOperacionales: Number(s.gastos_operacionales),
      comisionApertura: Number(s.comision_apertura),
    };
    const resp = await axios.post(`${evalUrl}/api/evaluar`, payload, { headers });
    const decision = resp.data?.evaluacion?.decision || 'en_revision';
    const nuevoEstado = decision === 'aprobada' ? 'aprobada' : (decision === 'rechazada' ? 'rechazada' : 'en_revision');
    await pool.query('UPDATE solicitudes SET estado=$1, updated_at=NOW() WHERE id=$2', [nuevoEstado, s.id]);
    res.json({ solicitudId: s.id, estado: nuevoEstado, evaluacion: resp.data });
  } catch (err) {
    console.error('Error al evaluar solicitud:', err.message);
    res.status(500).json({ error: 'Error al evaluar solicitud' });
  }
};
