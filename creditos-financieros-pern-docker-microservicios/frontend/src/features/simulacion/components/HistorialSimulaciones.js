import React from "react";
import { useNavigate } from "react-router-dom";

export default function HistorialSimulaciones({
  historial,
  loadingHistorial,
  handleEliminar,
  handleSeleccionarSimulacion,
  mostrarTodoHistorial,
  handleVerMas,
  styles,
  formatCurrency,
  formatPercent,
  formatDate,
  modoLocal = false,
}) {
  const navigate = useNavigate();

  if (loadingHistorial) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Cargando historial...</p>
      </div>
    );
  }

  if (!historial || historial.length === 0) {
    return (
      <div style={styles.emptyState}>
        <p style={{ fontSize: "18px", marginBottom: "8px" }}>No tienes simulaciones previas</p>
        <p style={{ fontSize: "14px", color: "#6c757d" }}>
          Guarda tu primera simulación usando el botón "Guardar Simulación"
        </p>
      </div>
    );
  }

  return (
    <>
      <div style={styles.historialGrid}>
        {historial.map((sim) => (
          <div key={sim.id} style={styles.historialCard} onClick={() => handleSeleccionarSimulacion && handleSeleccionarSimulacion(sim)}>
            <div style={styles.historialHeader}>
              <div style={{ flex: 1 }} />
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
            {!modoLocal && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/simulacion/${sim.id}`);
                  }}
                  style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer", fontSize: "13px", textDecoration: "underline" }}
                  title="Ver detalle"
                >
                  Ver detalle →
                </button>
              </div>
            )}

            <div style={styles.historialCuota}>
              <div style={styles.historialCuotaValue}>{formatCurrency(sim.cuotaMensual)}</div>
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

            <div style={styles.historialFooter}>{formatDate(sim.fecha)}</div>
          </div>
        ))}
      </div>

      {historial.length >= 4 && (
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <button onClick={handleVerMas} style={{ ...styles.button, ...styles.buttonSecondary }}>
            {mostrarTodoHistorial ? "Ver Menos ▲" : "Ver Más ▼"}
          </button>
        </div>
      )}
    </>
  );
}
