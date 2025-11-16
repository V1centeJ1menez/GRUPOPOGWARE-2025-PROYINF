import React from "react";
import AmortizacionTable from "./AmortizacionTable";

export default function SimulacionPreview({
  vistaPrevia,
  mostrarAmortizacion,
  setMostrarAmortizacion,
  generarTablaAmortizacion,
  formatCurrency,
  formatPercent,
  styles,
}) {
  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>Vista Previa</h2>

      {vistaPrevia ? (
        <>
          <div
            style={{
              ...styles.badge,
              ...(vistaPrevia.resultado === "aprobado" ? styles.badgeSuccess : styles.badgeError),
            }}
          >
            {vistaPrevia.resultado === "aprobado" ? "✅ Aprobado" : "❌ Rechazado"}
          </div>

          <div style={styles.cuotaBox}>
            <div style={styles.cuotaLabel}>Tu cuota mensual será:</div>
            <div style={styles.cuotaValue}>{formatCurrency(vistaPrevia.cuotaMensual)}</div>
            <div style={styles.cuotaSubtext}>por {vistaPrevia.plazo} meses</div>
          </div>

          <div style={styles.detailsGrid}>
            {typeof vistaPrevia.scoreInicial !== 'undefined' && (
              <div style={styles.detailItem}>
                <span>🧮 Scoring inicial:</span>
                <strong>{vistaPrevia.scoreInicial}</strong>
              </div>
            )}
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
              <strong style={{ color: "#28a745" }}>{formatCurrency(vistaPrevia.montoLiquido)}</strong>
            </div>
            <div style={styles.detailItem}>
              <span>📈 Intereses Totales:</span>
              <strong style={{ color: "#dc3545" }}>{formatCurrency(vistaPrevia.interesesTotales)}</strong>
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
              <strong style={{ color: "#ff6b6b" }}>{formatPercent(vistaPrevia.cae)}</strong>
            </div>
          </div>

          <div style={styles.warningBox}>
            <strong>💡 ¿Qué es el CAE?</strong>
            <p style={{ margin: "8px 0 0 0", fontSize: "13px" }}>
              La Carga Anual Equivalente incluye todos los costos del crédito (tasa base + gastos + comisiones)
            </p>
          </div>

          <div style={{ marginTop: 12 }}>
            <button onClick={() => setMostrarAmortizacion(!mostrarAmortizacion)} style={{ ...styles.button, ...styles.buttonSecondary }}>
              {mostrarAmortizacion ? '📊 Ocultar' : '📊 Ver'} Tabla de Amortización
            </button>
          </div>

          {mostrarAmortizacion && (
            <div style={{ marginTop: 16 }}>
              <AmortizacionTable tabla={generarTablaAmortizacion(vistaPrevia)} styles={styles} />
            </div>
          )}
        </>
      ) : (
        <div style={styles.emptyState}>
          <p>📋 Ajusta los valores para ver la simulación</p>
        </div>
      )}
    </div>
  );
}
