import React from "react";
import useSimulacionAnon from "../hooks/useSimulacionAnon";
import styles from "../styles/simulacionStyles";
import SimulacionPreview from "../components/SimulacionPreview";
import HistorialSimulaciones from "../components/HistorialSimulaciones";
import { formatCurrency, formatPercent, generarTablaAmortizacion } from "../utils/simulacionUtils";
import { useNavigate } from "react-router-dom";

export default function SimularAnonPage() {
  const navigate = useNavigate();
  const {
    CONFIG,
    monto, setMonto,
    plazo, setPlazo,
    ingresoMensual, setIngresoMensual,
    vistaPrevia,
    mostrarAmortizacion, setMostrarAmortizacion,
    historial, loadingHistorial,
    success,
    handleGuardarLocal,
    handleEliminarLocal,
    cargarHistorialLocal,
    marcarParaContinuarTrasLogin,
  } = useSimulacionAnon();

  const [revisitando, setRevisitando] = React.useState(null);

  const onSubmit = (e) => {
    e.preventDefault();
    handleGuardarLocal();
  };

  const simularTrasRegistro = () => {
    const saved = marcarParaContinuarTrasLogin();
    if (saved) {
      // marcar intención de guardar en historial tras registro
      try { localStorage.setItem('pending_action', 'save_to_history'); } catch {}
      navigate("/register");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>💡 Simula sin registrarte</h1>
        <p style={styles.subtitle}>Calcula tu cuota preliminar y guarda localmente. Tras registrarte podrás crear una Solicitud formal para evaluación.</p>
      </div>

      {revisitando && (
        <div style={{
          background: "#e0f2fe",
          color: "#075985",
          padding: 12,
          borderRadius: 10,
          margin: "0 0 16px",
          fontWeight: 600,
        }}>
          🔁 Revisitando simulación #{revisitando}
        </div>
      )}

      {success && <div style={styles.alertSuccess}>{success}</div>}

      <div style={styles.mainGrid}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📝 Configuración del Crédito</h2>
          <div style={styles.infoBox}>
            <strong style={{ color: "black" }}>ℹ️ Requisitos:</strong>
            <ul style={styles.infoList}>
              <li>Monto: {formatCurrency(CONFIG.MONTO_MIN)} - {formatCurrency(CONFIG.MONTO_MAX)}</li>
              <li>Plazo: {CONFIG.PLAZO_MIN} a {CONFIG.PLAZO_MAX} meses</li>
            </ul>
          </div>

          <form onSubmit={onSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>💵 Monto del Crédito</label>
              <input type="number" value={monto} onChange={(e) => setMonto(Number(e.target.value)||0)} style={styles.input} min={CONFIG.MONTO_MIN} max={CONFIG.MONTO_MAX} step="100000" />
              <input type="range" value={monto} onChange={(e) => setMonto(Number(e.target.value)||0)} style={styles.slider} min={CONFIG.MONTO_MIN} max={CONFIG.MONTO_MAX} step="100000" />
              <div style={styles.rangeLabels}>
                <span>{formatCurrency(CONFIG.MONTO_MIN)}</span>
                <span style={styles.rangeValue}>{formatCurrency(monto)}</span>
                <span>{formatCurrency(CONFIG.MONTO_MAX)}</span>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>📅 Plazo (meses)</label>
              <input type="number" value={plazo} onChange={(e)=>setPlazo(Number(e.target.value)||0)} style={styles.input} min={CONFIG.PLAZO_MIN} max={CONFIG.PLAZO_MAX} />
              <input type="range" value={plazo} onChange={(e)=>setPlazo(Number(e.target.value)||0)} style={styles.slider} min={CONFIG.PLAZO_MIN} max={CONFIG.PLAZO_MAX} />
              <div style={styles.rangeLabels}>
                <span>{CONFIG.PLAZO_MIN} meses</span>
                <span style={styles.rangeValue}>{plazo} meses</span>
                <span>{CONFIG.PLAZO_MAX} meses</span>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>🧾 Ingreso mensual (opcional)</label>
              <input type="number" value={ingresoMensual ?? ''} onChange={(e)=>setIngresoMensual(e.target.value?Number(e.target.value):null)} style={styles.input} placeholder="Ej: 1.000.000" />
            </div>

            <div style={styles.buttonGroup}>
              <button type="submit" style={{ ...styles.button, ...styles.buttonPrimary }}>💾 Guardar simulación</button>
              <button type="button" onClick={simularTrasRegistro} style={{ ...styles.button, ...styles.buttonSecondary }}>⚡ Solicitar tras registro</button>
            </div>
          </form>
        </div>

        <SimulacionPreview
          vistaPrevia={vistaPrevia}
          mostrarAmortizacion={mostrarAmortizacion}
          setMostrarAmortizacion={setMostrarAmortizacion}
          generarTablaAmortizacion={generarTablaAmortizacion}
          formatCurrency={formatCurrency}
          formatPercent={formatPercent}
          styles={styles}
        />
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>📚 Historial de simulaciones</h2>
        <HistorialSimulaciones
          historial={historial}
          loadingHistorial={loadingHistorial}
          handleEliminar={(id)=>handleEliminarLocal(id)}
          handleSeleccionarSimulacion={(sim) => {
            setRevisitando(sim.id);
            setMonto(sim.monto);
            setPlazo(sim.plazo);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          mostrarTodoHistorial={false}
          handleVerMas={()=>cargarHistorialLocal(null)}
          styles={styles}
          formatCurrency={formatCurrency}
          formatPercent={formatPercent}
          formatDate={(d)=>new Date(d).toLocaleString("es-CL")}
          modoLocal={true}
        />
      </div>
    </div>
  );
}
