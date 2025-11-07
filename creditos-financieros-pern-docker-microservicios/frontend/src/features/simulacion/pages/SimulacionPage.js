import React from "react";
import { AuthContext } from "../../auth/authContext";
import SimulacionForm from "../components/SimulacionForm";
import SimulacionPreview from "../components/SimulacionPreview";
import HistorialSimulaciones from "../components/HistorialSimulaciones";
import { formatCurrency, formatPercent, formatDate, generarTablaAmortizacion } from "../utils/simulacionUtils";
import styles from "../styles/simulacionStyles";
import useSimulacion from "../hooks/useSimulacion";

export default function SimulacionPage() {
  const { user } = React.useContext(AuthContext);

  const {
    monto,
    setMonto,
    plazo,
    setPlazo,
    simulacion,
    loading,
    error,
    success,
    historial,
    mostrarTodoHistorial,
    loadingHistorial,
    vistaPrevia,
    mostrarAmortizacion,
    setMostrarAmortizacion,
    handleSimular,
    handleLimpiar,
    handleEliminar,
    handleVerMas,
    handleSeleccionarSimulacion,
    CONFIG,
  } = useSimulacion(user);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>💰 Simulador de Crédito</h1>
        <p style={styles.subtitle}>Simula tu crédito y conoce las condiciones al instante</p>
      </div>

      {error && <div style={styles.alertError}>❌ {error}</div>}
      {success && <div style={styles.alertSuccess}>{success}</div>}

      <div style={styles.mainGrid}>
        <SimulacionForm
          monto={monto}
          setMonto={setMonto}
          plazo={plazo}
          setPlazo={setPlazo}
          handleSimular={(e) => {
            e.preventDefault();
            handleSimular({ monto: Number(monto), plazo: Number(plazo) });
          }}
          loading={loading}
          handleLimpiar={handleLimpiar}
          CONFIG={CONFIG}
          styles={styles}
          formatCurrency={formatCurrency}
        />

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

      {simulacion && (
        <div style={{ ...styles.card }}>
          <h2 style={styles.cardTitle}>✅ Simulación Guardada #{simulacion.id}</h2>
          <div style={styles.savedSimInfo}>
            <p style={{ margin: 0, color: "black" }}>Guardada el {formatDate(simulacion.fecha)}</p>
            <button onClick={() => setMostrarAmortizacion(!mostrarAmortizacion)} style={{ ...styles.button, ...styles.buttonSecondary, marginTop: "16px" }}>
              {mostrarAmortizacion ? "📊 Ocultar" : "📊 Ver"} Tabla de Amortización
            </button>
          </div>

          {mostrarAmortizacion && (
            <div style={{ marginTop: "24px", overflowX: "auto", color: "black" }}>
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
                      <td style={styles.td}>{formatCurrency(row.cuota)}</td>
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

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>📚 Historial de Simulaciones</h2>
        <HistorialSimulaciones
          historial={historial}
          loadingHistorial={loadingHistorial}
          handleEliminar={handleEliminar}
          handleSeleccionarSimulacion={handleSeleccionarSimulacion}
          mostrarTodoHistorial={mostrarTodoHistorial}
          handleVerMas={handleVerMas}
          styles={styles}
          formatCurrency={formatCurrency}
          formatPercent={formatPercent}
          formatDate={formatDate}
        />
      </div>
    </div>
  );
}
