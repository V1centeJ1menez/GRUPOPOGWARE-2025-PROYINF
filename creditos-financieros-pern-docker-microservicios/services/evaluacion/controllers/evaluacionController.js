const { pool } = require('../db');
let mailer = null;
async function sendMailSafe({ to, subject, text }){
  try{
    if(!process.env.SMTP_HOST) return false;
    if(!mailer){
      const nodemailer = require('nodemailer');
      mailer = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT||587),
        secure: Boolean(process.env.SMTP_SECURE||false),
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
      });
    }
    await mailer.sendMail({ from: process.env.SMTP_FROM||'no-reply@evaluacion.local', to, subject, text });
    return true;
  }catch(e){
    console.log('[evaluacion] aviso: no se pudo enviar email:', e.message);
    return false;
  }
}

function decodeToken(req){
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload;
  } catch { return null; }
}

function generarFechasPago(plazo){
  const fechas = [];
  const base = new Date();
  base.setHours(0,0,0,0);
  const dia = Math.min(5, 28);
  for (let i=1;i<=plazo;i++){
    const d = new Date(base.getFullYear(), base.getMonth()+i, dia);
    fechas.push(d.toISOString());
  }
  return fechas;
}

function evaluarReglas({ monto, plazo, cae }){
  // Reglas simples de ejemplo
  const m = Number(monto)||0;
  const p = Number(plazo)||0;
  const c = Number(cae)||0.2;
  let score = 750 - (m/50000) - (p*2) + (1-c)*120; // base 750
  if (!Number.isFinite(score)) score = 500;
  score = Math.max(300, Math.min(850, Math.round(score)));
  let decision = 'en_revision';
  const razones = [];
  if (m <= 10000000 && p <= 48 && score >= 600) {
    decision = 'aprobada';
  } else if (m > 12000000 || p > 60 || score < 520) {
    decision = 'rechazada';
  }
  if (m > 10000000) razones.push('Monto solicitado elevado');
  if (p > 48) razones.push('Plazo alto');
  if (score < 600) razones.push('Score crediticio bajo');
  return { decision, score, razones };
}

// Nueva lógica: solo se aprueban evaluaciones asociadas a una solicitud (solicitudId != null).
// Si no viene solicitudId se considera una SIMULACIÓN previa y se guarda como 'simulada'.
// Ya NO se envía correo por simulaciones y el frontend debe guiar a registrar y luego "Solicitar".
exports.evaluar = async (req, res) => {
  try {
    const payload = decodeToken(req);
    if (!payload?.id) return res.status(401).json({ error: 'Usuario no autenticado' });

    const { solicitudId = null, monto, plazo, tasaBase = null, cae = null, cuotaMensual = null, gastosOperacionales = null, comisionApertura = null } = req.body || {};
    if (!monto || !plazo) return res.status(400).json({ error: 'monto y plazo son requeridos' });

    const reglas = evaluarReglas({ monto, plazo, cae });
    const fechasPago = generarFechasPago(plazo);

    // Ajuste de decisión según tipo (solicitud vs simulación)
    let decisionFinal = reglas.decision;
    let esSimulacion = false;
    if (!solicitudId) { // simulación sin solicitud creada todavía
      esSimulacion = true;
      // Nunca aprobar directamente una simulación; convertir a estado 'simulada' independientemente.
      decisionFinal = 'simulada';
    }

    const insertEval = await pool.query(
      `INSERT INTO evaluaciones (user_id, solicitud_id, monto, plazo, tasa_base, cae, cuota_mensual, decision, score, razones)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [payload.id, solicitudId, monto, plazo, tasaBase, cae, cuotaMensual, decisionFinal, reglas.score, JSON.stringify(reglas.razones)]
    );

    // Construcción de título/mensaje adaptado
    const fmt = (v) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(Math.round(Number(v||0)));
    const tasaPct = (((tasaBase ?? cae ?? 0) * 100) || 0).toFixed(2);

    let titulo;
    let mensaje;
    if (esSimulacion) {
      titulo = 'Simulación registrada';
      mensaje = `Resultado preliminar: score ${reglas.score}. Monto ${fmt(monto)} a ${plazo} meses, cuota estimada ${fmt(cuotaMensual)}. Tasa aprox. ${tasaPct}%. Regístrate/Inicia sesión y genera una solicitud para evaluación formal.`;
    } else if (decisionFinal === 'aprobada') {
      titulo = 'Solicitud aprobada';
      mensaje = `Aprobada por ${fmt(monto)} a ${plazo} meses. Cuota estimada ${fmt(cuotaMensual)}. Tasa aprox. ${tasaPct}%. Costos: gastos ${fmt(gastosOperacionales||0)}, comisión ${fmt(comisionApertura||0)}. Puedes avanzar a la firma de documentos.`;
    } else if (decisionFinal === 'rechazada') {
      titulo = 'Solicitud rechazada';
      mensaje = `Solicitud rechazada. Motivos: ${(reglas.razones||[]).join(', ') || 'criterios de riesgo'}.
Simula un monto/plazo diferente para reintentar.`;
    } else {
      titulo = 'Solicitud en revisión';
      mensaje = 'Tu solicitud está en revisión. Te avisaremos pronto.';
    }

    const insertNotif = await pool.query(
      `INSERT INTO notificaciones (user_id, tipo, titulo, mensaje) VALUES ($1,$2,$3,$4) RETURNING *`,
      [payload.id, esSimulacion ? 'simulacion' : 'evaluacion', titulo, mensaje]
    );

    // Envío de correo SOLO si es solicitud aprobada (no simulaciones)
    const maybeEmail = (!esSimulacion && payload.username && /@/.test(payload.username)) ? payload.username : null;
    if (!esSimulacion && decisionFinal === 'aprobada' && maybeEmail) {
      sendMailSafe({ to: maybeEmail, subject: titulo, text: mensaje }).catch(() => {});
    }

    return res.json({
      tipo: esSimulacion ? 'simulacion' : 'solicitud',
      evaluacion: insertEval.rows[0],
      notificacion: insertNotif.rows[0],
      detalle: {
        monto,
        plazo,
        tasaBase,
        cae,
        cuotaMensual,
        gastosOperacionales,
        comisionApertura,
        fechasPago,
        score: reglas.score,
        razones: reglas.razones
      }
    });
  } catch (e) {
    console.error('[evaluacion] error evaluar:', e);
    res.status(500).json({ error: 'Error al evaluar' });
  }
};

// Endpoint público de simulación SIN autenticación: no persiste en BD, sólo devuelve cálculo.
exports.simularPublica = async (req, res) => {
  try {
    const { monto, plazo, tasaBase = null, cae = null } = req.body || {};
    if (!monto || !plazo) return res.status(400).json({ error: 'monto y plazo son requeridos' });
    const reglas = evaluarReglas({ monto, plazo, cae });
    const fechasPago = generarFechasPago(plazo);
    const fmt = (v) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(Math.round(Number(v||0)));
    return res.json({
      tipo: 'simulacion_publica',
      preliminar: true,
      score: reglas.score,
      rangoDecision: reglas.decision, // puede ser en_revision/aprobada/rechazada pero NO es aprobación formal
      mensaje: 'Regístrate y crea una solicitud para evaluación formal. Esta es solo una simulación preliminar.',
      monto: fmt(monto),
      plazo_meses: plazo,
      tasaAproxPct: (((tasaBase ?? cae ?? 0) * 100) || 0).toFixed(2),
      fechasPago
    });
  } catch (e) {
    console.error('[evaluacion] error simulacion publica:', e);
    res.status(500).json({ error: 'Error al simular' });
  }
};

exports.listarNotificaciones = async (req, res) => {
  try {
    const payload = decodeToken(req);
    if (!payload?.id) return res.status(401).json({ error: 'Usuario no autenticado' });
    const result = await pool.query(`SELECT * FROM notificaciones WHERE user_id=$1 ORDER BY created_at DESC`, [payload.id]);
    res.json(result.rows);
  } catch (e) {
    console.error('[evaluacion] error listar notificaciones:', e);
    res.status(500).json({ error: 'Error al listar notificaciones' });
  }
};

exports.marcarNotificacionLeida = async (req, res) => {
  try {
    const payload = decodeToken(req);
    if (!payload?.id) return res.status(401).json({ error: 'Usuario no autenticado' });
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE notificaciones SET leida=true WHERE id=$1 AND user_id=$2 RETURNING *`,
      [id, payload.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Notificación no encontrada' });
    res.json(result.rows[0]);
  } catch (e) {
    console.error('[evaluacion] error marcar leida:', e);
    res.status(500).json({ error: 'Error al marcar notificación' });
  }
};

exports.obtenerUltimaEvaluacion = async (req, res) => {
  try {
    const payload = decodeToken(req);
    if (!payload?.id) return res.status(401).json({ error: 'Usuario no autenticado' });
    const result = await pool.query(
      `SELECT * FROM evaluaciones WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1`,
      [payload.id]
    );
    res.json(result.rows[0] || null);
  } catch (e) {
    console.error('[evaluacion] error ultima evaluacion:', e);
    res.status(500).json({ error: 'Error al obtener evaluación' });
  }
};
