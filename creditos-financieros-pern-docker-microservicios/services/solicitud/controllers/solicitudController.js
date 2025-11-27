const { pool } = require('../db');
const axios = require('axios');
const { sendMailIfConfigured } = require('../utils/mailer');

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
    // Si la tabla no existe (42P01) o cualquier problema, no bloquear el flujo
    if (e && e.code !== '42P01') {
      console.warn('No se pudo crear notificación:', e.message || e);
    }
  }
}

function formatCLP(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '—';
  return new Intl.NumberFormat('es-CL',{ style:'currency', currency:'CLP', minimumFractionDigits:0 }).format(Math.round(v));
}

function formatPercent(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '—';
  return `${(v * 100).toFixed(2)}%`;
}

function fechaPrimerPagoStr() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
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

    // Antes: auto-evaluábamos inmediatamente al crear con estado 'enviada'.
    // Cambio: no auto-evaluar. La evaluación formal debe ejecutarla un administrador
    // o mediante el endpoint de evaluación (`evaluarSolicitud`).
    // Creamos una notificación sencilla para informar al usuario que su solicitud fue enviada.
    if ((estado || '').toLowerCase() === 'enviada') {
      const detalle = `Monto: ${formatCLP(monto)} · Plazo: ${plazo} meses · Cuota estimada: ${formatCLP(cuotaMensual)} · Tasa base: ${formatPercent(tasaBase)} · CAE: ${formatPercent(cae)} · Gastos: ${formatCLP(gastosOperacionales)} · Comisión: ${formatCLP(comisionApertura)} · Primer pago: ${fechaPrimerPagoStr()}`;
      await crearNotificacion(
        userId,
        'solicitud',
        'Solicitud enviada',
        `${detalle}. Tu solicitud fue recibida y está en revisión.`
      );
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

    // Por cada solicitud, obtener la última evaluación asociada (si existe)
    const solicitudes = [];
    for (const row of result.rows) {
      let ultimaEval = null;
      try {
        const evalRes = await pool.query(
          `SELECT decision, score, razones, created_at FROM evaluaciones WHERE solicitud_id=$1 ORDER BY created_at DESC LIMIT 1`,
          [row.id]
        );
        ultimaEval = evalRes.rows[0] || null;
      } catch (e) {
        // Ignorar CUALQUIER error de evaluación (tabla no existe, columna faltante, etc.)
        console.warn('Evaluación omitida para solicitud', row.id, e.message);
        ultimaEval = null;
      }

      solicitudes.push({
        ...row,
        evaluacion: ultimaEval ? { decision: ultimaEval.decision, score: parseFloat(ultimaEval.score), razones: ultimaEval.razones, fecha: ultimaEval.created_at } : null
      });
    }

    res.json(solicitudes);
  } catch (err) {
    console.error('Error al listar solicitudes:', err);
    res.status(500).json({ error: 'Error al listar solicitudes' });
  }
};

exports.listarTodas = async (req, res) => {
  try {
    const isAdmin = isAdminFromToken(req);
    if (!isAdmin) return res.status(403).json({ error: 'No autorizado' });

    const result = await pool.query(`SELECT * FROM solicitudes ORDER BY created_at DESC`);

    // Añadir última evaluación por solicitud (si existe)
    const solicitudes = [];
        for (const row of result.rows) {
          let ultimaEval = null;
          try {
            const evalRes = await pool.query(
              `SELECT decision, score, razones, created_at FROM evaluaciones WHERE solicitud_id=$1 ORDER BY created_at DESC LIMIT 1`,
              [row.id]
            );
            ultimaEval = evalRes.rows[0] || null;
          } catch (e) {
            // Ignorar CUALQUIER error de evaluación (tabla no existe, columna faltante, etc.)
            console.warn('Evaluación omitida (admin) para solicitud', row.id, e.message || e);
            ultimaEval = null;
          }

      solicitudes.push({
        ...row,
        evaluacion: ultimaEval ? { decision: ultimaEval.decision, score: parseFloat(ultimaEval.score), razones: ultimaEval.razones, fecha: ultimaEval.created_at } : null
      });
    }

    res.json(solicitudes);
  } catch (err) {
    console.error('Error al listar todas las solicitudes:', err);
    res.status(500).json({ error: 'Error al listar todas las solicitudes' });
  }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });
    const isAdmin = isAdminFromToken(req);

    const { id } = req.params;
    // Si es admin, puede ver cualquier solicitud; si no, sólo la propia
    const params = isAdmin ? [id] : [id, userId];
    const where = isAdmin ? `id=$1` : `id=$1 AND user_id=$2`;
    const result = await pool.query(`SELECT * FROM solicitudes WHERE ${where}`, params);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Solicitud no encontrada' });

    const row = result.rows[0];
    let ultimaEval = null;
    try {
      const evalRes = await pool.query(
        `SELECT decision, score, razones, created_at FROM evaluaciones WHERE solicitud_id=$1 ORDER BY created_at DESC LIMIT 1`,
        [row.id]
      );
      ultimaEval = evalRes.rows[0] || null;
    } catch (e) {
      if (e && e.code === '42P01') {
        console.warn('Tabla evaluaciones no encontrada, omitiendo evaluación para solicitud id=', row.id);
        ultimaEval = null;
      } else {
        throw e;
      }
    }

    res.json({
      ...row,
      evaluacion: ultimaEval ? { decision: ultimaEval.decision, score: parseFloat(ultimaEval.score), razones: ultimaEval.razones, fecha: ultimaEval.created_at } : null
    });
  } catch (err) {
    console.error('Error al obtener solicitud:', err);
    res.status(500).json({ error: 'Error al obtener solicitud' });
  }
};

exports.actualizarEstado = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });
    const isAdmin = isAdminFromToken(req);

    const { id } = req.params;
    const updates = req.body;
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No fields to update' });

    // Verify ownership or admin
    const checkRes = await pool.query(`SELECT * FROM solicitudes WHERE id=$1`, [id]);
    if (checkRes.rows.length === 0) return res.status(404).json({ error: 'Solicitud no encontrada' });
    const solicitud = checkRes.rows[0];
    if (Number(solicitud.user_id) !== Number(userId) && !isAdmin) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    // Restrict sensitive changes
    const estadoLower = (updates.estado || '').toLowerCase();
    if (['aprobada', 'rechazada', 'firmada'].includes(estadoLower) && !isAdmin) {
      return res.status(403).json({ error: 'Sólo administradores pueden cambiar a este estado' });
    }

    // Build dynamic update query
    const setClauses = [];
    const values = [];
    let paramIndex = 1;
    for (const [key, value] of Object.entries(updates)) {
      setClauses.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
    values.push(id);
    const updateQ = `UPDATE solicitudes SET ${setClauses.join(', ')}, updated_at=NOW() WHERE id=$${paramIndex} RETURNING *`;
    const result = await pool.query(updateQ, values);
    const updated = result.rows[0];

    // Notificar al usuario si la solicitud fue aprobada o rechazada (or firmada)
    if (['aprobada', 'rechazada', 'firmada'].includes(estadoLower)) {
      const titulo = estadoLower === 'aprobada' ? 'Solicitud aprobada' : estadoLower === 'rechazada' ? 'Solicitud rechazada' : 'Solicitud firmada';
      const detalle = `Monto: ${formatCLP(updated.monto)} · Plazo: ${updated.plazo} meses · Cuota estimada: ${formatCLP(updated.cuota_mensual)} · Tasa base: ${formatPercent(updated.tasa_base)} · CAE: ${formatPercent(updated.cae)} · Gastos: ${formatCLP(updated.gastos_operacionales)} · Comisión: ${formatCLP(updated.comision_apertura)} · Primer pago: ${fechaPrimerPagoStr()}`;
      const msg = estadoLower === 'aprobada' ? `${detalle}. ¡Puedes continuar con los siguientes pasos!` 
        : estadoLower === 'rechazada' ? `${detalle}. Puedes volver a simular o contactarnos para más información.` 
        : `${detalle}. Proceda al desembolso.`;
      await crearNotificacion(updated.user_id, 'solicitud', titulo, msg);
    }

    // Enviar correo informando cambio de estado (aprobada/rechazada/enviada/firmada)
    if (['aprobada', 'rechazada', 'enviada', 'firmada'].includes(estadoLower)) {
      const email = await obtenerEmailUsuario(updated.user_id, req);
      if (email) {
        const asunto = `Actualización de solicitud #${updated.id}`;
        const cuerpo = `Hola,

Tu solicitud #${updated.id} ha sido ${estadoLower}.
Monto: ${formatCLP(updated.monto)}
Plazo: ${updated.plazo} meses
Cuota: ${formatCLP(updated.cuota_mensual)}
Tasa base: ${formatPercent(updated.tasa_base)} · CAE: ${formatPercent(updated.cae)}
Gastos: ${formatCLP(updated.gastos_operacionales)} · Comisión: ${formatCLP(updated.comision_apertura)}
Primer pago estimado: ${fechaPrimerPagoStr()}

Saludos,
Equipo de Créditos`;
        await sendMailIfConfigured({ to: email, subject: asunto, text: cuerpo });
      }
    }

    res.json(updated);
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
    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });
    const row = await pool.query('SELECT * FROM solicitudes WHERE id=$1', [id]);
    if (row.rows.length === 0) return res.status(404).json({ error: 'Solicitud no encontrada' });
    const s = row.rows[0];

    // Sólo administradores pueden invocar una evaluación formal sobre una solicitud
    const isAdmin = isAdminFromToken(req);
    if (!isAdmin) return res.status(403).json({ error: 'Sólo administradores pueden evaluar solicitudes' });

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

    // Notificar al usuario del resultado de la evaluación
    const detalle = `Monto: ${formatCLP(s.monto)} · Plazo: ${s.plazo} meses · Cuota: ${formatCLP(s.cuota_mensual)} · Tasa base: ${formatPercent(s.tasa_base)} · CAE: ${formatPercent(s.cae)} · Gastos: ${formatCLP(s.gastos_operacionales)} · Comisión: ${formatCLP(s.comision_apertura)} · Primer pago: ${fechaPrimerPagoStr()}`;
    if (nuevoEstado === 'aprobada') {
      await crearNotificacion(s.user_id, 'evaluacion', 'Resultado: Aprobada', `${detalle}. Puedes continuar con los siguientes pasos.`);
    } else if (nuevoEstado === 'rechazada') {
      await crearNotificacion(s.user_id, 'evaluacion', 'Resultado: Rechazada', `${detalle}. Te invitamos a simular nuevamente o revisar condiciones.`);
    } else {
      await crearNotificacion(s.user_id, 'evaluacion', 'Evaluación en revisión', `${detalle}. Estamos analizando tu perfil crediticio.`);
    }

    // Email resultado evaluación (requiere token admin para leer email destinatario)
    const email = await obtenerEmailUsuario(s.user_id, req);
    if (email) {
      const asunto = `Resultado de evaluación solicitud #${s.id}`;
      const cuerpo = `Hola,

Tu solicitud #${s.id} ha sido ${nuevoEstado}.
${detalle}

Saludos,
Equipo de Créditos`;
      await sendMailIfConfigured({ to: email, subject: asunto, text: cuerpo });
    }

    res.json({ solicitudId: s.id, estado: nuevoEstado, evaluacion: resp.data });
  } catch (err) {
    console.error('Error al evaluar solicitud:', err.message);
    res.status(500).json({ error: 'Error al evaluar solicitud' });
  }
};

exports.listarNotificaciones = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });
    const result = await pool.query('SELECT * FROM notificaciones WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50', [userId]);
    res.json(result.rows || []);
  } catch (e) {
    if (e && e.code === '42P01') {
      // Sin tabla de notificaciones, devolver vacío
      return res.json([]);
    }
    console.error('Error al listar notificaciones:', e);
    res.status(500).json({ error: 'Error al listar notificaciones' });
  }
};
