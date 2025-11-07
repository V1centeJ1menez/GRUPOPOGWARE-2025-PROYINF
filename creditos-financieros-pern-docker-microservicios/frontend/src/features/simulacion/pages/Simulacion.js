
import React, { useContext, useState, useEffect, useCallback } from "react";
import { AuthContext } from "../../auth/authContext";
import { useNavigate } from "react-router-dom";
import { crearSimulacion, obtenerHistorial, eliminarSimulacion } from "../services/simulacionApi";

export default function Simulacion() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // ==========================================
  // ESTADOS
  // ==========================================
  
  // Estado del formulario
  const [monto, setMonto] = useState(5000000);
  const [plazo, setPlazo] = useState(24);
  
  // Estado de la simulación guardada
  const [simulacion, setSimulacion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Estado del historial
  const [historial, setHistorial] = useState([]);
  const [mostrarTodoHistorial, setMostrarTodoHistorial] = useState(false);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  // Estado para vista previa (cálculo local sin guardar)
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [mostrarAmortizacion, setMostrarAmortizacion] = useState(false);

  // ==========================================
  // CONFIGURACIÓN (debe coincidir con backend)
  // ==========================================
  const CONFIG = {
    TASA_BASE_ANUAL: 0.18, // 22% anual, rango típico entre 18% y 28%
    GASTOS_OPERACIONALES_PORCENTAJE: 0.02, // 2% aprox de gasto operacional
    COMISION_APERTURA: 0.015, // 0.5% aprox de comisión
    MONTO_MIN: 500000, // desde $100.000 CLP
    MONTO_MAX: 10000000, // hasta $20.000.000 CLP
    PLAZO_MIN: 6,
    PLAZO_MAX: 48,
  };

  // ==========================================
  // FUNCIONES DE FORMATO
  // ==========================================
  
  const formatCurrency = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "—";
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(Math.round(n));
  };

  const formatPercent = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "—";
    return `${(n * 100).toFixed(2)}%`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==========================================
  // CÁLCULO DE VISTA PREVIA LOCAL
  // ==========================================
  
  const calcularVistaPrevia = useCallback((montoInput, plazoInput) => {
    const m = Number(montoInput);
    const p = Number(plazoInput);

    if (!m || !p || m <= 0 || p <= 0) {
      setVistaPrevia(null);
      return;
    }

    // Cálculos financieros
    const gastosOp = Math.round(m * CONFIG.GASTOS_OPERACIONALES_PORCENTAJE);
    const comisionAp = Math.round(m * CONFIG.COMISION_APERTURA);
    const montoLiq = Math.round(m - gastosOp - comisionAp);

    // Cuota mensual (sistema francés)
    const i = CONFIG.TASA_BASE_ANUAL / 12;
    const cuota = Math.round(m * i / (1 - Math.pow(1 + i, -p)));

    const montoTot = Math.round(cuota * p);
    const intereses = Math.round(montoTot - m);
    const cae = parseFloat((CONFIG.TASA_BASE_ANUAL + ((gastosOp + comisionAp) / m)).toFixed(6));
    const resultado = m >= CONFIG.MONTO_MIN && p >= CONFIG.PLAZO_MIN && p <= CONFIG.PLAZO_MAX ? 'aprobado' : 'rechazado';

    setVistaPrevia({
      monto: m,
      plazo: p,
      tasaBase: CONFIG.TASA_BASE_ANUAL,
      cae,
      cuotaMensual: cuota,
      montoTotal: montoTot,
      montoLiquido: montoLiq,
      interesesTotales: intereses,
      gastosOperacionales: gastosOp,
      comisionApertura: comisionAp,
      resultado,
    });
  }, [CONFIG.TASA_BASE_ANUAL, CONFIG.GASTOS_OPERACIONALES_PORCENTAJE, CONFIG.COMISION_APERTURA, CONFIG.MONTO_MIN, CONFIG.PLAZO_MIN, CONFIG.PLAZO_MAX]);

  // Actualizar vista previa cuando cambian monto o plazo
  useEffect(() => {
    calcularVistaPrevia(monto, plazo);
  }, [monto, plazo, calcularVistaPrevia]);

  // ==========================================
  // TABLA DE AMORTIZACIÓN
  // ==========================================
  
  const generarTablaAmortizacion = (sim) => {
    if (!sim) return [];

    const tabla = [];
    let saldo = Number(sim.monto);
    const i = Number(sim.tasaBase) / 12;
    const cuota = Math.round(Number(sim.cuotaMensual));

    for (let mes = 1; mes <= Number(sim.plazo); mes++) {
      let interes = Math.round(saldo * i);
      let capital = cuota - interes;
      // Ajuste en la última cuota para evitar saldo residual por redondeos
      if (mes === Number(sim.plazo)) {
        capital = saldo;
        interes = Math.max(0, cuota - capital);
      }
      saldo = Math.max(0, Math.round(saldo - capital));

      tabla.push({
        mes,
        cuota,
        interes,
        capital,
        saldo,
      });
    }

    return tabla;
  };

  // ==========================================
  // GESTIÓN DE HISTORIAL
  // ==========================================
  
  const cargarHistorial = useCallback(async (limit = null) => {
    if (!user?.token) return;
    
    setLoadingHistorial(true);
    try {
      const response = await obtenerHistorial(user.token, limit);
      setHistorial(response.data);
    } catch (err) {
      console.error("Error al cargar historial:", err);
    } finally {
      setLoadingHistorial(false);
    }
  }, [user?.token]);

  // Redirigir si no hay usuario y cargar historial inicial
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      cargarHistorial(4);
    }
  }, [user, navigate, cargarHistorial]);

  // ==========================================
  // HANDLERS
  // ==========================================
  
  const handleSimular = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSimulacion(null);

    // Validaciones
    if (!monto || !plazo) {
      setError("Por favor, completa todos los campos");
      return;
    }

    if (Number(monto) < CONFIG.MONTO_MIN || Number(monto) > CONFIG.MONTO_MAX) {
      setError(`El monto debe estar entre ${formatCurrency(CONFIG.MONTO_MIN)} y ${formatCurrency(CONFIG.MONTO_MAX)}`);
      return;
    }

    if (Number(plazo) < CONFIG.PLAZO_MIN || Number(plazo) > CONFIG.PLAZO_MAX) {
      setError(`El plazo debe estar entre ${CONFIG.PLAZO_MIN} y ${CONFIG.PLAZO_MAX} meses`);
      return;
    }

    setLoading(true);

    try {
      const response = await crearSimulacion(
        {
          monto: Number(monto),
          plazo: Number(plazo),
        },
        user.token
      );

      setSimulacion(response.data);
      setSuccess("✅ Simulación guardada exitosamente en tu historial");
      cargarHistorial(mostrarTodoHistorial ? null : 4);
      
      // Limpiar mensaje de éxito después de 5 segundos
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error("Error al simular:", err);
      setError(err.response?.data?.error || "Error al procesar la simulación");
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    setMonto(5000000);
    setPlazo(24);
    setSimulacion(null);
    setError(null);
    setSuccess(null);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta simulación?")) {
      return;
    }

    try {
      await eliminarSimulacion(id, user.token);
      cargarHistorial(mostrarTodoHistorial ? null : 4);
      
      if (simulacion && simulacion.id === id) {
        setSimulacion(null);
      }
      
      setSuccess("Simulación eliminada correctamente");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error al eliminar:", err);
      setError("Error al eliminar la simulación");
    }
  };

  const handleVerMas = () => {
    if (mostrarTodoHistorial) {
      cargarHistorial(4);
      setMostrarTodoHistorial(false);
    } else {
      cargarHistorial(null);
      setMostrarTodoHistorial(true);
    }
  };

  const handleSeleccionarSimulacion = (sim) => {
    setSimulacion(sim);
    setMonto(sim.monto);
    setPlazo(sim.plazo);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ==========================================
  // RENDER
  // ==========================================
  
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>💰 Simulador de Crédito</h1>
        <p style={styles.subtitle}>
          Simula tu crédito y conoce las condiciones al instante
        </p>
      </div>

      {/* Alertas */}
      {error && (
        <div style={styles.alertError}>
          ❌ {error}
        </div>
      )}
      
      {success && (
        <div style={styles.alertSuccess}>
          {success}
        </div>
      )}

      {/* Grid Principal */}
      <div style={styles.mainGrid}>
        {/* Columna Izquierda: Formulario */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📝 Configuración del Crédito</h2>
          
          {/* Info Box */}
          <div style={styles.infoBox}>
            <strong style={{color:'black'}}>ℹ️ Requisitos:</strong>
            <ul style={styles.infoList}>
              <li>Monto: {formatCurrency(CONFIG.MONTO_MIN)} - {formatCurrency(CONFIG.MONTO_MAX)}</li>
              <li>Plazo: {CONFIG.PLAZO_MIN} a {CONFIG.PLAZO_MAX} meses</li>
              <li>Tasa base anual: {formatPercent(CONFIG.TASA_BASE_ANUAL)}</li>
            </ul>
          </div>

          <form onSubmit={handleSimular}>
            {/* Monto */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                💵 Monto del Crédito
              </label>
              <input
                type="number"
                value={monto}
                onChange={(e) => setMonto(Number(e.target.value) || 0)}
                style={styles.input}
                min={CONFIG.MONTO_MIN}
                max={CONFIG.MONTO_MAX}
                step="100000"
              />
              <input
                type="range"
                value={monto}
                onChange={(e) => setMonto(Number(e.target.value) || 0)}
                style={styles.slider}
                min={CONFIG.MONTO_MIN}
                max={CONFIG.MONTO_MAX}
                step="100000"
              />
              <div style={styles.rangeLabels}>
                <span>{formatCurrency(CONFIG.MONTO_MIN)}</span>
                <span style={styles.rangeValue}>{formatCurrency(monto)}</span>
                <span>{formatCurrency(CONFIG.MONTO_MAX)}</span>
              </div>
            </div>

            {/* Plazo */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                📅 Plazo (meses)
              </label>
              <input
                type="number"
                value={plazo}
                onChange={(e) => setPlazo(Number(e.target.value) || 0)}
                style={styles.input}
                min={CONFIG.PLAZO_MIN}
                max={CONFIG.PLAZO_MAX}
              />
              <input
                type="range"
                value={plazo}
                onChange={(e) => setPlazo(Number(e.target.value) || 0)}
                style={styles.slider}
                min={CONFIG.PLAZO_MIN}
                max={CONFIG.PLAZO_MAX}
              />
              <div style={styles.rangeLabels}>
                <span>{CONFIG.PLAZO_MIN} meses</span>
                <span style={styles.rangeValue}>{plazo} meses</span>
                <span>{CONFIG.PLAZO_MAX} meses</span>
              </div>
            </div>

            {/* Botones */}
            <div style={styles.buttonGroup}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary,
                  ...(loading ? styles.buttonDisabled : {}),
                }}
              >
                {loading ? "💾 Guardando..." : "💾 Guardar Simulación"}
              </button>
              <button
                type="button"
                onClick={handleLimpiar}
                style={{...styles.button, ...styles.buttonSecondary}}
              >
                🔄 Limpiar
              </button>
            </div>
          </form>
        </div>

        {/* Columna Derecha: Vista Previa */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📊 Vista Previa</h2>
          
          {vistaPrevia ? (
            <>
              {/* Badge de Estado */}
              <div style={{
                ...styles.badge,
                ...(vistaPrevia.resultado === 'aprobado' ? styles.badgeSuccess : styles.badgeError)
              }}>
                {vistaPrevia.resultado === 'aprobado' ? '✅ Aprobado' : '❌ Rechazado'}
              </div>

              {/* Cuota Destacada */}
              <div style={styles.cuotaBox}>
                <div style={styles.cuotaLabel}>Tu cuota mensual será:</div>
                <div style={styles.cuotaValue}>{formatCurrency(vistaPrevia.cuotaMensual)}</div>
                <div style={styles.cuotaSubtext}>por {vistaPrevia.plazo} meses</div>
              </div>

              {/* Detalles */}
              <div style={styles.detailsGrid}>
                <div style={styles.detailItem}>
                  <span>💰 Total a Pagar:</span>
                  <strong>{formatCurrency(vistaPrevia.montoTotal)}</strong>
                </div>
                <div style={styles.detailItem}>
                  <span>💵 Monto Solicitado:</span>
                  <strong>{formatCurrency(vistaPrevia.monto)}</strong>
                </div>
                <div style={styles.detailItem}>
                  <span>💸 Recibirás (líquido):</span>
                  <strong style={{color: '#28a745'}}>{formatCurrency(vistaPrevia.montoLiquido)}</strong>
                </div>
                <div style={styles.detailItem}>
                  <span>📈 Intereses Totales:</span>
                  <strong style={{color: '#dc3545'}}>{formatCurrency(vistaPrevia.interesesTotales)}</strong>
                </div>
                <div style={styles.detailItem}>
                  <span>🔧 Gastos Operacionales:</span>
                  <strong>{formatCurrency(vistaPrevia.gastosOperacionales)}</strong>
                </div>
                <div style={styles.detailItem}>
                  <span>📝 Comisión Apertura:</span>
                  <strong>{formatCurrency(vistaPrevia.comisionApertura)}</strong>
                </div>
                <div style={styles.detailItem}>
                  <span>📊 Tasa Base:</span>
                  <strong>{formatPercent(vistaPrevia.tasaBase)}</strong>
                </div>
                <div style={styles.detailItem}>
                  <span>📈 CAE:</span>
                  <strong style={{color: '#ff6b6b'}}>{formatPercent(vistaPrevia.cae)}</strong>
                </div>
              </div>

              {/* Info CAE */}
              <div style={styles.warningBox}>
                <strong>💡 ¿Qué es el CAE?</strong>
                <p style={{margin: '8px 0 0 0', fontSize: '13px'}}>
                  La Carga Anual Equivalente incluye todos los costos del crédito 
                  (tasa base + gastos + comisiones) y te permite comparar diferentes opciones.
                </p>
              </div>
            </>
          ) : (
            <div style={styles.emptyState}>
              <p>📋 Ajusta los valores para ver la simulación</p>
            </div>
          )}
        </div>
      </div>

      {/* Simulación Guardada */}
      {simulacion && (
        <div style={{...styles.card}}>
          <h2 style={styles.cardTitle}>✅ Simulación Guardada #{simulacion.id}</h2>
          <div style={styles.savedSimInfo}>
            <p style={{margin: 0, color:'black' }}>
              Guardada el {formatDate(simulacion.fecha)}
            </p>
            <button
              onClick={() => setMostrarAmortizacion(!mostrarAmortizacion)}
              style={{...styles.button, ...styles.buttonSecondary, marginTop: '16px'}}
            >
              {mostrarAmortizacion ? '📊 Ocultar' : '📊 Ver'} Tabla de Amortización
            </button>
          </div>

          {/* Tabla de Amortización */}
          {mostrarAmortizacion && (
            <div style={{marginTop: '24px', overflowX: 'auto', color:'black'}}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Mes</th>
                    <th style={styles.th}>Cuota</th>
                    <th style={styles.th}>Interés</th>
                    <th style={styles.th}>Capital</th>
                    <th style={styles.th}>Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {generarTablaAmortizacion(simulacion).map((row) => (
                    <tr key={row.mes} style={row.mes % 2 === 0 ? styles.trEven : {}}>
                      <td style={styles.td}>{row.mes}</td>
                      <td style={styles.td}>{formatCurrency(row.cuota)}</td>
                      <td style={styles.td}>{formatCurrency(row.interes)}</td>
                      <td style={styles.td}>{formatCurrency(row.capital)}</td>
                      <td style={styles.td}>{formatCurrency(row.saldo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Historial */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>📚 Historial de Simulaciones</h2>

        {loadingHistorial ? (
          <div style={styles.loading}>
            <div style={styles.spinner}></div>
            <p>Cargando historial...</p>
          </div>
        ) : historial.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={{fontSize: '18px', marginBottom: '8px'}}>
              No tienes simulaciones previas
            </p>
            <p style={{fontSize: '14px', color: '#6c757d'}}>
              Guarda tu primera simulación usando el botón "Guardar Simulación"
            </p>
          </div>
        ) : (
          <>
            <div style={styles.historialGrid}>
              {historial.map((sim) => (
                <div
                  key={sim.id}
                  style={styles.historialCard}
                  onClick={() => handleSeleccionarSimulacion(sim)}
                >
                  <div style={styles.historialHeader}>
                    <span style={{
                      ...styles.historialBadge,
                      ...(sim.resultado === 'aprobado' ? styles.badgeSuccess : styles.badgeError)
                    }}>
                      {sim.resultado.toUpperCase()}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEliminar(sim.id);
                      }}
                      style={styles.deleteButton}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/simulacion/${sim.id}`); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#007bff',
                        cursor: 'pointer',
                        fontSize: '13px',
                        textDecoration: 'underline'
                      }}
                      title="Ver detalle"
                    >
                      Ver detalle →
                    </button>
                  </div>

                  <div style={styles.historialCuota}>
                    <div style={styles.historialCuotaValue}>
                      {formatCurrency(sim.cuotaMensual)}
                    </div>
                    <div style={styles.historialCuotaLabel}>Cuota mensual</div>
                  </div>

                  <div style={styles.historialDetails}>
                    <div style={styles.historialDetailRow}>
                      <span>Monto:</span>
                      <strong>{formatCurrency(sim.monto)}</strong>
                    </div>
                    <div style={styles.historialDetailRow}>
                      <span>Plazo:</span>
                      <strong>{sim.plazo} meses</strong>
                    </div>
                    <div style={styles.historialDetailRow}>
                      <span>CAE:</span>
                      <strong>{formatPercent(sim.cae)}</strong>
                    </div>
                  </div>

                  <div style={styles.historialFooter}>
                    {formatDate(sim.fecha)}
                  </div>
                </div>
              ))}
            </div>

            {historial.length >= 4 && (
              <div style={{textAlign: 'center', marginTop: '24px'}}>
                <button
                  onClick={handleVerMas}
                  style={{...styles.button, ...styles.buttonSecondary}}
                >
                  {mostrarTodoHistorial ? 'Ver Menos ▲' : 'Ver Más ▼'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ==========================================
// ESTILOS
// ==========================================

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#6c757d',
  },
  alertError: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '24px',
    borderLeft: '4px solid #dc3545',
  },
  alertSuccess: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '24px',
    borderLeft: '4px solid #28a745',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  cardTitle: {
    fontSize: '1.5rem',
    color: '#2c3e50',
    marginTop: 0,
    marginBottom: '20px',
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '24px',
    borderLeft: '4px solid #2196f3',
    fontSize: '14px',
  },
  infoList: {
    margin: '8px 0 0 20px',
    padding: 0,
    color:'#000000ff'
  },
  formGroup: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#495057',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '2px solid #dee2e6',
    borderRadius: '8px',
    marginBottom: '8px',
    boxSizing: 'border-box',
  },
  slider: {
    width: '100%',
    height: '8px',
    borderRadius: '4px',
    background: 'linear-gradient(to right, #667eea, #764ba2)',
    outline: 'none',
    marginTop: '8px',
  },
  rangeLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#6c757d',
    marginTop: '4px',
  },
  rangeValue: {
    fontWeight: 'bold',
    color: '#667eea',
    fontSize: '14px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
  },
  button: {
    flex: 1,
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  buttonPrimary: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  },
  buttonSecondary: {
    backgroundColor: '#f8f9fa',
    color: '#495057',
    border: '1px solid #dee2e6',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  badge: {
    display: 'inline-block',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '20px',
  },
  badgeSuccess: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  badgeError: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  cuotaBox: {
    backgroundColor: '#f0f4ff',
    padding: '24px',
    borderRadius: '12px',
    textAlign: 'center',
    marginBottom: '24px',
  },
  cuotaLabel: {
    fontSize: '14px',
    color: '#6c757d',
    marginBottom: '8px',
  },
  cuotaValue: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#667eea',
  },
  cuotaSubtext: {
    fontSize: '14px',
    color: '#6c757d',
    marginTop: '8px',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px',
    marginBottom: '20px',
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    fontSize: '14px',
    color:'black'
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    padding: '16px',
    borderRadius: '8px',
    borderLeft: '4px solid #ffc107',
    fontSize: '14px',
    color: '#856404',
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px 24px',
    color: '#6c757d',
  },
  savedSimInfo: {
    backgroundColor: '#f8f9fa',
    padding: '16px',
    borderRadius: '8px',
    textAlign: 'center',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  th: {
    backgroundColor: '#f8f9fa',
    padding: '12px',
    textAlign: 'left',
    fontWeight: '600',
    borderBottom: '2px solid #dee2e6',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #dee2e6',
  },
  trEven: {
    backgroundColor: '#f8f9fa',
  },
  loading: {
    textAlign: 'center',
    padding: '48px',
    color: '#6c757d',
  },
  spinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px',
  },
  historialGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
    marginBottom: '16px',
  },
  historialCard: {
    backgroundColor: 'white',
    border: '2px solid #dee2e6',
    borderRadius: '12px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    color: 'black'
  },
  historialHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  historialBadge: {
    fontSize: '11px',
    padding: '4px 8px',
    borderRadius: '12px',
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px 8px',
  },
  historialCuota: {
    marginBottom: '16px',
  },
  historialCuotaValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#667eea',
  },
  historialCuotaLabel: {
    fontSize: '12px',
    color: '#6c757d',
  },
  historialDetails: {
    fontSize: '14px',
    marginBottom: '12px',
  },
  historialDetailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  historialFooter: {
    fontSize: '11px',
    color: '#999',
    paddingTop: '12px',
    borderTop: '1px solid #eee',
  },
};

// Agregar animación para el spinner
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .historial-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    border-color: #667eea;
  }
`;
document.head.appendChild(styleSheet);
