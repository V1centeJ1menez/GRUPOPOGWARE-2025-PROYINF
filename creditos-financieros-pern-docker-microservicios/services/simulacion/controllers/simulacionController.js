// Controlador de simulación (adaptado a Chile)
const Simulacion = require('../models/Simulacion');
const { pool } = require('../db');

// ===================================
// PARÁMETROS DE CONFIGURACIÓN CHILE
// ===================================
const CONFIG = {
  TASA_BASE_ANUAL: 0.18,                  // 18% anual típico en créditos de consumo
  GASTOS_OPERACIONALES_PORCENTAJE: 0.02, // 2% del monto solicitado
  SEGURO_DESGRAVAMEN_MENSUAL: 0.0012,    // 0.12% mensual
  COMISION_APERTURA: 0.015,               // 1.5% del monto solicitado
  MONTO_MINIMO: 500000,                   // $500.000 CLP
  MONTO_MAXIMO: 10000000,                 // $10.000.000 CLP
  PLAZO_MINIMO: 6,                        // 6 meses mínimo
  PLAZO_MAXIMO: 48,                       // 48 meses máximo
};

/**
 * Calcula la CAE (Carga Anual Equivalente)
 */
function calcularCAE(tasaBase, gastosOperacionales, comisionApertura, monto) {
  const gastosComoTasa = (gastosOperacionales + comisionApertura) / monto;
  return tasaBase + gastosComoTasa;
}

/**
 * Calcula la cuota mensual usando el sistema francés
 */
function calcularCuota(monto, plazo, tasaAnual) {
  const i = tasaAnual / 12;
  if (i === 0) return monto / plazo;
  return +(monto * i / (1 - Math.pow(1 + i, -plazo))).toFixed(2);
}

/**
 * Extrae el user_id del token JWT
 */
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

/**
 * Simula un crédito
 */
const simular = async (req, res) => {
  try {
    const { monto, plazo } = req.body;
    const userId = getUserIdFromToken(req);

    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });
    if (!monto || !plazo) return res.status(400).json({ error: 'Faltan datos: monto y plazo son requeridos' });
    if (monto <= 0 || plazo <= 0) return res.status(400).json({ error: 'Monto y plazo deben ser mayores a 0' });

    // Validaciones rango Chile
    if (monto < CONFIG.MONTO_MINIMO || monto > CONFIG.MONTO_MAXIMO) {
      return res.status(400).json({ error: `Monto debe estar entre $${CONFIG.MONTO_MINIMO} y $${CONFIG.MONTO_MAXIMO}` });
    }
    if (plazo < CONFIG.PLAZO_MINIMO || plazo > CONFIG.PLAZO_MAXIMO) {
      return res.status(400).json({ error: `Plazo debe estar entre ${CONFIG.PLAZO_MINIMO} y ${CONFIG.PLAZO_MAXIMO} meses` });
    }

    // Cálculos
    const gastosOperacionales = monto * CONFIG.GASTOS_OPERACIONALES_PORCENTAJE;
    const comisionApertura = monto * CONFIG.COMISION_APERTURA;
    const costosTotales = gastosOperacionales + comisionApertura;
    const montoLiquido = monto - costosTotales;
    const cuotaMensual = calcularCuota(monto, plazo, CONFIG.TASA_BASE_ANUAL);
    const montoTotal = cuotaMensual * plazo;
    const interesesTotales = montoTotal - monto;
    const cae = calcularCAE(CONFIG.TASA_BASE_ANUAL, gastosOperacionales, comisionApertura, monto);

    // Guardar en DB
    const query = `
      INSERT INTO simulaciones (
        user_id, monto, plazo, tasa_base, cae, cuota_mensual,
        monto_total, monto_liquido, intereses_totales,
        gastos_operacionales, comision_apertura
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *
    `;
    const values = [
      userId, monto, plazo, CONFIG.TASA_BASE_ANUAL, cae, cuotaMensual,
      montoTotal, montoLiquido, interesesTotales,
      gastosOperacionales, comisionApertura,
    ];

    const result = await pool.query(query, values);
    const simulacionGuardada = result.rows[0];

    // Respuesta (simulaciones no contienen estado)
    const simulacion = {
      id: simulacionGuardada.id,
      monto: parseFloat(simulacionGuardada.monto),
      plazo: simulacionGuardada.plazo,
      tasaBase: parseFloat(simulacionGuardada.tasa_base),
      cae: parseFloat(simulacionGuardada.cae),
      cuotaMensual: parseFloat(simulacionGuardada.cuota_mensual),
      montoTotal: parseFloat(simulacionGuardada.monto_total),
      montoLiquido: parseFloat(simulacionGuardada.monto_liquido),
      interesesTotales: parseFloat(simulacionGuardada.intereses_totales),
      gastosOperacionales: parseFloat(simulacionGuardada.gastos_operacionales),
      comisionApertura: parseFloat(simulacionGuardada.comision_apertura),
      fecha: simulacionGuardada.created_at,
    };

    return res.json(simulacion);
  } catch (err) {
    console.error('Error en simulación:', err);
    res.status(500).json({ error: 'Error al procesar la simulación' });
  }
};

// Exportar también funciones restantes
const obtenerHistorial = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { limit } = req.query;

    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });

    let query = `SELECT * FROM simulaciones WHERE user_id = $1 ORDER BY created_at DESC`;
    const params = [userId];

    if (limit) {
      query += ` LIMIT $2`;
      params.push(parseInt(limit));
    }

    const result = await pool.query(query, params);

    const simulaciones = result.rows.map(row => ({
      id: row.id,
      monto: parseFloat(row.monto),
      plazo: row.plazo,
      tasaBase: parseFloat(row.tasa_base),
      cae: parseFloat(row.cae),
      cuotaMensual: parseFloat(row.cuota_mensual),
      montoTotal: parseFloat(row.monto_total),
      montoLiquido: parseFloat(row.monto_liquido),
      interesesTotales: parseFloat(row.intereses_totales),
      gastosOperacionales: parseFloat(row.gastos_operacionales),
      comisionApertura: parseFloat(row.comision_apertura),
      fecha: row.created_at,
    }));

    return res.json(simulaciones);
  } catch (err) {
    console.error('Error al obtener historial:', err);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
};

const obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromToken(req);

    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });

    const query = `SELECT * FROM simulaciones WHERE id = $1 AND user_id = $2`;
    const result = await pool.query(query, [id, userId]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Simulación no encontrada' });

    const row = result.rows[0];
    const simulacion = {
      id: row.id,
      monto: parseFloat(row.monto),
      plazo: row.plazo,
      tasaBase: parseFloat(row.tasa_base),
      cae: parseFloat(row.cae),
      cuotaMensual: parseFloat(row.cuota_mensual),
      montoTotal: parseFloat(row.monto_total),
      montoLiquido: parseFloat(row.monto_liquido),
      interesesTotales: parseFloat(row.intereses_totales),
      gastosOperacionales: parseFloat(row.gastos_operacionales),
      comisionApertura: parseFloat(row.comision_apertura),
      fecha: row.created_at,
    };

    return res.json(simulacion);
  } catch (err) {
    console.error('Error al obtener simulación:', err);
    res.status(500).json({ error: 'Error al obtener simulación' });
  }
};

const eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromToken(req);

    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });

    const query = `DELETE FROM simulaciones WHERE id = $1 AND user_id = $2 RETURNING id`;
    const result = await pool.query(query, [id, userId]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Simulación no encontrada' });

    return res.json({ message: 'Simulación eliminada correctamente', id: result.rows[0].id });
  } catch (err) {
    console.error('Error al eliminar simulación:', err);
    res.status(500).json({ error: 'Error al eliminar simulación' });
  }
};

/**
 * Obtiene la configuración del simulador
 * Endpoint público para que el frontend obtenga los parámetros sin duplicarlos
 */
const obtenerConfiguracion = async (req, res) => {
  try {
    return res.json({
      tasaBaseAnual: CONFIG.TASA_BASE_ANUAL,
      gastosOperacionalesPorcentaje: CONFIG.GASTOS_OPERACIONALES_PORCENTAJE,
      seguroDesgravamenMensual: CONFIG.SEGURO_DESGRAVAMEN_MENSUAL,
      comisionApertura: CONFIG.COMISION_APERTURA,
      montoMinimo: CONFIG.MONTO_MINIMO,
      montoMaximo: CONFIG.MONTO_MAXIMO,
      plazoMinimo: CONFIG.PLAZO_MINIMO,
      plazoMaximo: CONFIG.PLAZO_MAXIMO,
    });
  } catch (err) {
    console.error('Error al obtener configuración:', err);
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
};

function isAdminFromToken(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return false;
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.role === 'admin';
  } catch (e) {
    console.error('Error al verificar rol admin:', e);
    return false;
  }
}

const listarTodas = async (req, res) => {
  try {
    if (!isAdminFromToken(req)) return res.status(403).json({ error: 'No autorizado' });
    const result = await pool.query('SELECT * FROM simulaciones ORDER BY created_at DESC');
    const simulaciones = result.rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      monto: parseFloat(row.monto),
      plazo: row.plazo,
      tasaBase: parseFloat(row.tasa_base),
      cae: parseFloat(row.cae),
      cuotaMensual: parseFloat(row.cuota_mensual),
      montoTotal: parseFloat(row.monto_total),
      montoLiquido: parseFloat(row.monto_liquido),
      interesesTotales: parseFloat(row.intereses_totales),
      gastosOperacionales: parseFloat(row.gastos_operacionales),
      comisionApertura: parseFloat(row.comision_apertura),
        // resultado removed: estado/resultado handled by solicitudes
      fecha: row.created_at,
    }));
    return res.json(simulaciones);
  } catch (err) {
    console.error('Error al listar todas las simulaciones:', err);
    res.status(500).json({ error: 'Error al listar todas las simulaciones' });
  }
};

module.exports = { simular, obtenerHistorial, obtenerPorId, eliminar, obtenerConfiguracion, listarTodas, CONFIG };
