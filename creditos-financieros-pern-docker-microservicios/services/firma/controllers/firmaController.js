// controllers/firmaController.js (complete, similar to desembolso)
const { pool } = require('../db');
const axios = require('axios');
const { sendMailIfConfigured } = require('../utils/mailer');

/* -----------------------
   Helpers (token / auth)
   ----------------------- */
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

/* -----------------------
   Cross-service helpers
   ----------------------- */
async function obtenerEmailUsuario(userId, req) {
  try {
    const isAdmin = isAdminFromToken(req);
    if (!isAdmin) return null;
    const base = process.env.AUTH_URL || 'http://auth:4000';
    const headers = { Authorization: req.headers.authorization || '' };
    const resp = await axios.get(`${base}/users`, { headers });
    const users = Array.isArray(resp.data) ? resp.data : [];
    const user = users.find(u => Number(u.id) === Number(userId));
    return user?.email || null;
  } catch (e) {
    console.warn('No se pudo obtener email del usuario:', e.message || e);
    return null;
  }
}

async function crearNotificacion(userId, tipo, titulo, mensaje) {
  try {
    await pool.query(
      `INSERT INTO notificaciones (user_id, tipo, titulo, mensaje) VALUES ($1,$2,$3,$4)`,
      [userId, tipo, titulo, mensaje]
    );
  } catch (e) {
    if (e && e.code !== '42P01') {
      console.warn('No se pudo crear notificación:', e.message || e);
    }
  }
}

/* -----------------------
   Controller actions
   ----------------------- */

/**
 * Crear firma - POST /firmas
 * Body: { solicitudId, firmaCode? }
 */
/**
 * Crear firma - POST /firmas
 */
const crear = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });

    const { solicitudId, firmaCode } = req.body;
    if (!solicitudId) return res.status(400).json({ error: 'solicitudId requerido' });

  
    const solicitudBase = process.env.SOLICITUD_URL || 'http://solicitud:3003';
    const headers = { Authorization: req.headers.authorization || '' };

    let solicitud;
    try {
      const resp = await axios.get(`${solicitudBase}/api/solicitudes/${solicitudId}`, { headers });
      solicitud = resp.data;
    } catch (e) {
      console.error('Error fetching solicitud:', {
        message: e.message,
        code: e.code,
        status: e.response?.status,
        data: e.response?.data,
      });
      return res.status(400).json({ error: 'Solicitud no encontrada o no accesible' });
    }

    // Validaciones de negocio
    if (!solicitud) return res.status(400).json({ error: 'Solicitud no encontrada' });
    if (solicitud.estado !== 'aprobada') return res.status(400).json({ error: 'La solicitud debe estar aprobada' });
    if (Number(solicitud.user_id) !== Number(userId)) return res.status(403).json({ error: 'No eres el dueño de esta solicitud' });
    if (solicitud.firmada === true) return res.status(400).json({ error: 'La solicitud ya está firmada' });

    // Simular validación de firma (aquí iría integración real con servicio de firma electrónica)
    const firmaValidada = true;

    // 1. Crear registro en tabla "Firma" (tabla local del servicio firma)
    const insertQ = `
      INSERT INTO "Firma" (solicitud_id, user_id, firma_validada, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;
    const createdRes = await pool.query(insertQ, [solicitudId, userId, firmaValidada]);
    const firmaCreada = createdRes.rows[0];

    // 2. Actualizar la solicitud (también con /api)
    if (firmaValidada) {
      try {
        await axios.patch(
          `${solicitudBase}/api/solicitudes/${solicitudId}`,
          { firmada: true, estado: 'firmada' },
          { headers }
        );
      } catch (e) {
        console.error('Error updating solicitud after firma:', e.response?.status, e.response?.data);
        return res.status(500).json({ error: 'Firma creada pero no se pudo actualizar la solicitud' });
      }

      // Notificación y email
      await crearNotificacion(userId, 'firma', 'Firma completada', `Solicitud #${solicitudId} firmada exitosamente.`);
      const email = await obtenerEmailUsuario(userId, req);
      if (email) {
        await sendMailIfConfigured({
          to: email,
          subject: `Firma completada - Solicitud #${solicitudId}`,
          text: `Hola,\n\nTu solicitud #${solicitudId} ha sido firmada con éxito.\nYa puedes continuar con el desembolso.\n\nSaludos,\nEquipo Créditos`,
        });
      }
    }

    return res.json(firmaCreada);
  } catch (err) {
    console.error('Error en crear firma:', err);
    res.status(500).json({ error: 'Error al crear firma' });
  }
};

/**
 * Listar firmas del usuario - GET /firmas
 */
const listar = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });

    const result = await pool.query(
      `SELECT * FROM "Firma" WHERE user_id=$1 ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows || []);
  } catch (err) {
    console.error('Error al listar firmas:', err);
    res.status(500).json({ error: 'Error al listar firmas' });
  }
};

/**
 * Listar todas (admin) - GET /admin/firmas
 */
const listarTodas = async (req, res) => {
  try {
    const isAdmin = isAdminFromToken(req);
    if (!isAdmin) return res.status(403).json({ error: 'No autorizado' });

    const result = await pool.query(`SELECT * FROM "Firma" ORDER BY created_at DESC`);
    res.json(result.rows || []);
  } catch (err) {
    console.error('Error al listar todas las firmas:', err);
    res.status(500).json({ error: 'Error al listar firmas' });
  }
};

/**
 * Obtener por ID - GET /firmas/:id
 */
const obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });
    const isAdmin = isAdminFromToken(req);

    const params = isAdmin ? [id] : [id, userId];
    const where = isAdmin ? `id=$1` : `id=$1 AND user_id=$2`;
    const result = await pool.query(`SELECT * FROM "Firma" WHERE ${where}`, params);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Firma no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener firma:', err);
    res.status(500).json({ error: 'Error al obtener firma' });
  }
};

/**
 * Actualizar estado - PATCH /firmas/:id
 * Admin puede validar/invalidar
 */
const actualizarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { firmaValidada } = req.body;
    if (typeof firmaValidada !== 'boolean') return res.status(400).json({ error: 'firmaValidada debe ser boolean' });

    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });
    const isAdmin = isAdminFromToken(req);
    if (!isAdmin) return res.status(403).json({ error: 'Sólo administradores pueden validar firmas' });

    const updateQ = `UPDATE "Firma" SET firma_validada=$1 WHERE id=$2 RETURNING *`;
    const result = await pool.query(updateQ, [firmaValidada, id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Firma no encontrada' });

    const updated = result.rows[0];
    if (firmaValidada) {
      await pool.query(`UPDATE solicitudes SET firmada=true, estado='firmada', updated_at=NOW() WHERE id=$1`, [updated.solicitud_id]);
    }

    await crearNotificacion(updated.user_id, 'firma', 'Firma actualizada', `La firma #${updated.id} ha sido ${firmaValidada ? 'validada' : 'invalidada'}.`);

    const email = await obtenerEmailUsuario(updated.user_id, req);
    if (email) {
      await sendMailIfConfigured({
        to: email,
        subject: `Firma #${updated.id} - ${firmaValidada ? 'Validada' : 'Invalidada'}`,
        text: `La firma para solicitud #${updated.solicitud_id} ha sido ${firmaValidada ? 'validada' : 'invalidada'}.`
      });
    }

    res.json(updated);
  } catch (err) {
    console.error('Error al actualizar firma:', err);
    res.status(500).json({ error: 'Error al actualizar firma' });
  }
};

/**
 * Eliminar firma - DELETE /firmas/:id
 * Solo si no validada
 */
const eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });

    const rec = await pool.query('SELECT * FROM "Firma" WHERE id=$1', [id]);
    if (rec.rows.length === 0) return res.status(404).json({ error: 'Firma no encontrada' });
    const row = rec.rows[0];

    if (Number(row.user_id) !== Number(userId)) return res.status(403).json({ error: 'No autorizado' });
    if (row.firma_validada) return res.status(400).json({ error: 'No se puede eliminar una firma validada' });

    const result = await pool.query('DELETE FROM "Firma" WHERE id=$1 RETURNING id', [id]);
    res.json({ message: 'Firma eliminada', id: result.rows[0].id });
  } catch (err) {
    console.error('Error al eliminar firma:', err);
    res.status(500).json({ error: 'Error al eliminar firma' });
  }
};

module.exports = {
  crear,
  listar,
  listarTodas,
  obtenerPorId,
  actualizarEstado,
  eliminar
};