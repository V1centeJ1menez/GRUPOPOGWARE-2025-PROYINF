
import React, { useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../auth/authContext";
import { obtenerSimulacionPorId, eliminarSimulacion } from "../services/simulacionApi";

export default function SimulacionDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sim, setSim] = useState(null);
  const [mostrarAmortizacion, setMostrarAmortizacion] = useState(false);

  // Helpers de formato
  const formatCurrency = useCallback((value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "—";
    return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(Math.round(n));
  }, []);

  const formatPercent = useCallback((value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "—";
    return `${(n * 100).toFixed(2)}%`;
  }, []);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString("es-CL", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }, []);

  // Cargar simulación
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    (async () => {
      try {
        const resp = await obtenerSimulacionPorId(id, user.token);
        setSim(resp.data);
      } catch (err) {
        console.error("Error cargando simulación", err);
        setError(err.response?.data?.error || "No se pudo cargar la simulación");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user, navigate]);

  // Generar tabla de amortización
  const tabla = useMemo(() => {
    if (!sim) return [];
    const i = Number(sim.tasaBase) / 12;
    const cuota = Math.round(Number(sim.cuotaMensual));
    let saldo = Number(sim.monto);
    const res = [];
    for (let mes = 1; mes <= Number(sim.plazo); mes++) {
      let interes = Math.round(saldo * i);
      let capital = cuota - interes;
      if (mes === Number(sim.plazo)) {
        capital = saldo;
        interes = Math.max(0, cuota - capital);
      }
      saldo = Math.max(0, Math.round(saldo - capital));
      res.push({ mes, cuota, interes, capital, saldo });
    }
    return res;
  }, [sim]);

  const handleEliminar = async () => {
    if (!window.confirm("¿Eliminar esta simulación?")) return;
    try {
      await eliminarSimulacion(id, user.token);
      navigate("/simulacion");
    } catch (err) {
      setError("No se pudo eliminar la simulación");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#6c757d" }}>
        Cargando simulación...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ background: "#f8d7da", color: "#721c24", padding: 16, borderRadius: 8, marginBottom: 16 }}>❌ {error}</div>
        <button onClick={() => navigate(-1)} style={btnSecondary}>Volver</button>
      </div>
    );
  }

  if (!sim) return null;

  const aprobado = sim.resultado === "aprobado";

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Detalle Simulación #{sim.id}</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => navigate("/simulacion")} style={btnSecondary}>← Volver</button>
          <button onClick={handleEliminar} style={btnDanger}>🗑️ Eliminar</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={card}>
          <div style={{
            padding: 12,
            borderRadius: 8,
            marginBottom: 12,
            color: aprobado ? "#155724" : "#721c24",
            background: aprobado ? "#d4edda" : "#f8d7da",
            textAlign: "center",
            fontWeight: 700,
          }}>
            {aprobado ? "✅ Aprobado" : "❌ Rechazado"}
          </div>

          <div style={{ background: "#f0f4ff", padding: 16, borderRadius: 10, textAlign: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: "#6c757d", marginBottom: 6 }}>Cuota mensual</div>
            <div style={{ fontSize: 34, fontWeight: 800, color: "#667eea" }}>{formatCurrency(sim.cuotaMensual)}</div>
            <div style={{ fontSize: 12, color: "#6c757d", marginTop: 6 }}>por {sim.plazo} meses</div>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <Row label="Monto solicitado" value={formatCurrency(sim.monto)} />
            <Row label="Monto líquido" value={formatCurrency(sim.montoLiquido)} strong color="#28a745" />
            <Row label="Total a pagar" value={formatCurrency(sim.montoTotal)} />
            <Row label="Intereses totales" value={formatCurrency(sim.interesesTotales)} color="#dc3545" />
            <Row label="Gastos operacionales" value={formatCurrency(sim.gastosOperacionales)} />
            <Row label="Comisión de apertura" value={formatCurrency(sim.comisionApertura)} />
            <Row label="Tasa base (anual)" value={formatPercent(sim.tasaBase)} />
            <Row label="CAE" value={formatPercent(sim.cae)} color="#ff6b6b" />
            <Row label="Fecha" value={formatDate(sim.fecha)} />
          </div>
        </div>

        <div style={card}>
          <h3 style={{ marginTop: 0,color:'black' }}>Tabla de Amortización</h3>
          <p style={{ color: "#6c757d", marginTop: 4 }}>Desglose mensual de interés y capital.</p>
          <button onClick={() => setMostrarAmortizacion(!mostrarAmortizacion)} style={{ ...btnSecondary, marginBottom: 12 }}>
            {mostrarAmortizacion ? "Ocultar" : "Ver"} tabla
          </button>

          {mostrarAmortizacion && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14,color:'black' }}>
                <thead>
                  <tr>
                    <Th>Mes</Th>
                    <Th>Cuota</Th>
                    <Th>Interés</Th>
                    <Th>Capital</Th>
                    <Th>Saldo</Th>
                  </tr>
                </thead>
                <tbody>
                  {tabla.map((r) => (
                    <tr key={r.mes} style={{ background: r.mes % 2 === 0 ? "#f8f9fa" : "transparent" }}>
                      <Td>{r.mes}</Td>
                      <Td>{formatCurrency(r.cuota)}</Td>
                      <Td>{formatCurrency(r.interes)}</Td>
                      <Td>{formatCurrency(r.capital)}</Td>
                      <Td>{formatCurrency(r.saldo)}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, strong, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", background: "#f8f9fa", padding: 12, borderRadius: 8 }}>
      <span style={{ color: "#6c757d" }}>{label}</span>
      <span style={{ fontWeight: strong ? 800 : 600, color: color || "#2c3e50" }}>{value}</span>
    </div>
  );
}

function Th({ children }) {
  return (
    <th style={{ textAlign: "left", padding: 10, borderBottom: "2px solid #dee2e6", background: "#f8f9fa" }}>{children}</th>
  );
}

function Td({ children }) {
  return (
    <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{children}</td>
  );
}

const card = { background: "white", padding: 16, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" };
const btnSecondary = { background: "#f8f9fa", border: "1px solid #dee2e6", borderRadius: 8, padding: "8px 12px", cursor: "pointer" };
const btnDanger = { background: "#f44336", color: "white", border: "none", borderRadius: 8, padding: "8px 12px", cursor: "pointer" };