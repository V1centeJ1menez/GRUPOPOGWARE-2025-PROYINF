import React from "react";

export default function AmortizacionTable({ tabla, styles }) {
  if (!tabla || tabla.length === 0) return null;
  return (
    <div style={{ overflowX: "auto" }}>
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
          {tabla.map((row) => (
            <tr key={row.mes} style={row.mes % 2 === 0 ? styles.trEven : {}}>
              <td style={styles.td}>{row.mes}</td>
              <td style={styles.td}>{row.cuota}</td>
              <td style={styles.td}>{row.interes}</td>
              <td style={styles.td}>{row.capital}</td>
              <td style={styles.td}>{row.saldo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
