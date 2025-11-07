import React from "react";

export default function SimulacionForm({
  monto,
  setMonto,
  plazo,
  setPlazo,
  handleSimular,
  loading,
  handleLimpiar,
  CONFIG,
  styles,
  formatCurrency,
}) {
  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>📝 Configuración del Crédito</h2>

      <div style={styles.infoBox}>
        <strong style={{ color: "black" }}>ℹ️ Requisitos:</strong>
        <ul style={styles.infoList}>
          <li>
            Monto: {formatCurrency(CONFIG.MONTO_MIN)} - {formatCurrency(CONFIG.MONTO_MAX)}
          </li>
          <li>
            Plazo: {CONFIG.PLAZO_MIN} a {CONFIG.PLAZO_MAX} meses
          </li>
          <li>Tasa base anual: {formatCurrency(CONFIG.TASA_BASE_ANUAL)}</li>
        </ul>
      </div>

      <form onSubmit={handleSimular}>
        <div style={styles.formGroup}>
          <label style={styles.label}>💵 Monto del Crédito</label>
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

        <div style={styles.formGroup}>
          <label style={styles.label}>📅 Plazo (meses)</label>
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
          <button type="button" onClick={handleLimpiar} style={{ ...styles.button, ...styles.buttonSecondary }}>
            🔄 Limpiar
          </button>
        </div>
      </form>
    </div>
  );
}
