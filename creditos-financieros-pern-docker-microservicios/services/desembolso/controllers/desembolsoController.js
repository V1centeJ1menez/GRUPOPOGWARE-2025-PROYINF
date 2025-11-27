// controllers/desembolsoController.js
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
   Util
   ----------------------- */
function fechaStr() {
  return new Date().toISOString();
}

/* -----------------------
   Simulación de transferencia
   ----------------------- */
/**
 * Simula una transferencia. En este demo siempre succeed.
 * Puedes modificar para simular fallos basados en cuenta_destino u otras reglas.
 */
async function simulateTransfer({ monto, cuentaDestino }) {
  // Lógica simple: simulamos éxito siempre
  return {
    success: true,
    message: 'Transferencia simulada exitosa',
    externalReference: `SIM-${Date.now()}`
  };
}

/* -----------------------
   Controller actions
   ----------------------- */

/**
 * Crear desembolso - POST /desembolsos
 * Body: { solicitudId, monto, cuentaDestino }
 */
const crear = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });

    const { solicitudId, monto, cuentaDestino } = req.body;
    if (!solicitudId || !monto || !cuentaDestino) {
      return res.status(400).json({ error: 'Faltan datos: solicitudId, monto y cuentaDestino son requeridos' });
    }

    // Verificar que exista una firma validada para la solicitud
    try {
      const firmaRes = await pool.query(
        `SELECT * FROM "Firma" WHERE solicitud_id=$1 AND firma_validada = true ORDER BY created_at DESC LIMIT 1`,
        [solicitudId]
      );
      if (!firmaRes.rows || firmaRes.rows.length === 0) {
        return res.status(400).json({ error: 'No existe firma validada para esa solicitud. No se puede desembolsar.' });
      }
    } catch (e) {
      // Si la tabla Firma no existe, informar en vez de fallar catastróficamente
      if (e && e.code === '42P01') {
        return res.status(400).json({ error: 'Tabla de firmas no encontrada en la BD (migraciones faltantes).' });
      }
      throw e;
    }

    // Crear registro inicial con estado 'pendiente'
    const insertQ = `
      INSERT INTO "Desembolso" (solicitud_id, user_id, monto, cuenta_destino, estado, created_at)
      VALUES ($1,$2,$3,$4,$5,NOW())
      RETURNING *
    `;
    const values = [solicitudId, userId, monto, cuentaDestino, 'pendiente'];
    const createdRes = await pool.query(insertQ, values);
    const created = createdRes.rows[0];

    // Simular la transferencia de inmediato (demo)
    const sim = await simulateTransfer({ monto, cuentaDestino });

    if (sim.success) {
      const updateQ = `UPDATE "Desembolso" SET estado=$1, fecha_desembolso=NOW() WHERE id=$2 RETURNING *`;
      const upd = await pool.query(updateQ, ['completo', created.id]);
      const updated = upd.rows[0];

      // Opcional: actualizar estado de la solicitud a 'desembolsada' si existe la tabla solicitudes
      try {
        await pool.query(`UPDATE solicitudes SET estado=$1, updated_at=NOW() WHERE id=$2`, ['desembolsada', solicitudId]);
      } catch (e) {
        if (e && e.code !== '42P01') console.warn('No se pudo actualizar solicitud tras desembolso:', e.message || e);
      }

      // Notificar y enviar email si es posible
      await crearNotificacion(userId, 'desembolso', 'Desembolso realizado', `Se realizó el desembolso de ${monto} a la cuenta ${cuentaDestino}. Ref: ${sim.externalReference}`);
      const email = await obtenerEmailUsuario(userId, req);
      if (email) {
        await sendMailIfConfigured({
          to: email,
          subject: `Desembolso realizado - Solicitud ${solicitudId}`,
          text: `Hola,\n\nHemos realizado un desembolso simulado por ${monto} a la cuenta ${cuentaDestino}.\nReferencia: ${sim.externalReference}\nFecha: ${fechaStr()}\n\nSaludos,\nEquipo de Créditos`
        });
      }

      return res.json(updated);
    } else {
      // marcar como fallido
      const updateQ = `UPDATE "Desembolso" SET estado=$1 WHERE id=$2 RETURNING *`;
      const upd = await pool.query(updateQ, ['fallido', created.id]);
      const updated = upd.rows[0];

      await crearNotificacion(userId, 'desembolso', 'Desembolso fallido', `Intento de desembolso por ${monto} a la cuenta ${cuentaDestino} falló: ${sim.message}`);
      return res.status(500).json({ error: 'Desembolso falló en la simulación', detail: sim.message, row: updated });
    }

  } catch (err) {
    console.error('Error en crear desembolso:', err);
    res.status(500).json({ error: 'Error al crear desembolso' });
  }
};

/**
 * Listar desembolsos del usuario - GET /desembolsos
 */
const listar = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });

    const result = await pool.query(
      `SELECT * FROM "Desembolso" WHERE user_id=$1 ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows || []);
  } catch (err) {
    console.error('Error al listar desembolsos:', err);
    res.status(500).json({ error: 'Error al listar desembolsos' });
  }
};

/**
 * Listar todos (admin) - GET /admin/desembolsos
 */
const listarTodas = async (req, res) => {
  try {
    const isAdmin = isAdminFromToken(req);
    if (!isAdmin) return res.status(403).json({ error: 'No autorizado' });

    const result = await pool.query(`SELECT * FROM "Desembolso" ORDER BY created_at DESC`);
    res.json(result.rows || []);
  } catch (err) {
    console.error('Error al listar todas los desembolsos:', err);
    res.status(500).json({ error: 'Error al listar desembolsos' });
  }
};

/**
 * Obtener por ID - GET /desembolsos/:id
 */
const obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });
    const isAdmin = isAdminFromToken(req);

    const params = isAdmin ? [id] : [id, userId];
    const where = isAdmin ? `id=$1` : `id=$1 AND user_id=$2`;
    const result = await pool.query(`SELECT * FROM "Desembolso" WHERE ${where}`, params);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Desembolso no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener desembolso:', err);
    res.status(500).json({ error: 'Error al obtener desembolso' });
  }
};

/**
 * Actualizar estado - PATCH /desembolsos/:id
 * Admin puede forzar estados: 'completo', 'fallido', 'procesando'
 */
const actualizarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    if (!estado) return res.status(400).json({ error: 'Estado es requerido' });

    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });
    const isAdmin = isAdminFromToken(req);
    if (!isAdmin) return res.status(403).json({ error: 'Sólo administradores pueden actualizar el estado del desembolso' });

    const updateQ = `UPDATE "Desembolso" SET estado=$1, fecha_desembolso = CASE WHEN $1='completo' THEN NOW() ELSE fecha_desembolso END WHERE id=$2 RETURNING *`;
    const result = await pool.query(updateQ, [estado, id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Desembolso no encontrado' });

    const updated = result.rows[0];
    await crearNotificacion(updated.user_id, 'desembolso', 'Estado de desembolso actualizado', `El desembolso #${updated.id} cambió a estado ${updated.estado}`);

    const email = await obtenerEmailUsuario(updated.user_id, req);
    if (email) {
      await sendMailIfConfigured({
        to: email,
        subject: `Desembolso #${updated.id} - ${updated.estado}`,
        text: `El desembolso por ${updated.monto} a ${updated.cuenta_destino} cambió a estado ${updated.estado}.`
      });
    }

    res.json(updated);
  } catch (err) {
    console.error('Error al actualizar estado de desembolso:', err);
    res.status(500).json({ error: 'Error al actualizar estado de desembolso' });
  }
};

/**
 * Eliminar desembolso - DELETE /desembolsos/:id
 * Solo owner puede eliminar si estado = 'pendiente'
 */
const eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });

    const rec = await pool.query('SELECT * FROM "Desembolso" WHERE id=$1', [id]);
    if (rec.rows.length === 0) return res.status(404).json({ error: 'Desembolso no encontrado' });
    const row = rec.rows[0];

    if (Number(row.user_id) !== Number(userId)) return res.status(403).json({ error: 'No autorizado' });
    if ((row.estado || '').toLowerCase() !== 'pendiente') return res.status(400).json({ error: 'Solo se puede eliminar un desembolso en estado pendiente' });

    const result = await pool.query('DELETE FROM "Desembolso" WHERE id=$1 RETURNING id', [id]);
    res.json({ message: 'Desembolso eliminado', id: result.rows[0].id });
  } catch (err) {
    console.error('Error al eliminar desembolso:', err);
    res.status(500).json({ error: 'Error al eliminar desembolso' });
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
