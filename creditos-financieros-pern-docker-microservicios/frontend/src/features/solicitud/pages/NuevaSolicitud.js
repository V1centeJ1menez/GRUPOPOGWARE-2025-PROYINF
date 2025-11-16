import React, { useContext, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { popPendingSimulation } from "../../simulacion/utils/localHistory";
import { formatCurrency } from "../../simulacion/utils/simulacionUtils";
import { AuthContext } from "../../auth/authContext";
import { crearSolicitud, actualizarEstadoSolicitud, eliminarSolicitud } from "../services/solicitudApi";

export default function NuevaSolicitud() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const borrador = location.state?.solicitud || null;
  const pending = useMemo(() => {
    // Permite arrastrar datos por state o storage si no viene un borrador
    if (borrador) return null;
    const stateSim = location.state?.sim || null;
    return stateSim || popPendingSimulation();
  }, [location.state, borrador]);

  if (!pending && !borrador) {
    return (
      <div style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
        <div style={{ background: "#fff3cd", color: "#664d03", padding: 16, borderRadius: 8, marginBottom: 16 }}>
          No encontramos una simulación para precargar. Puedes crear una nueva.
        </div>
        <button onClick={() => navigate("/simular")} style={btnPrimary}>Simular ahora</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>📝 Nueva Solicitud</h2>
      <p style={{ color: "#6b7280" }}>
        {borrador
          ? 'Estás retomando un borrador de solicitud. Puedes enviarlo o eliminarlo.'
          : 'Hemos precargado tu solicitud según tu última simulación.'}
      </p>

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>Resumen {borrador ? 'del borrador' : 'de simulación'}</h3>
        <ul>
          <li>Monto: <strong>{formatCurrency((borrador?.monto ?? pending?.monto) || 0)}</strong></li>
          <li>Plazo: <strong>{(borrador?.plazo ?? pending?.plazo) || 0} meses</strong></li>
          <li>Cuota estimada: <strong>{formatCurrency((borrador?.cuotaMensual ?? pending?.cuotaMensual) || 0)}</strong></li>
          <li>Tasa anual ajustada: <strong>{(((borrador?.tasaBase ?? pending?.tasaBase) || 0) * 100).toFixed(2)}%</strong></li>
        </ul>
      </div>

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>Datos del solicitante</h3>
        <div style={grid}>
          <Field label="Nombres" placeholder="Juan" />
          <Field label="Apellidos" placeholder="Pérez" />
          <Field label="RUT" placeholder="12.345.678-9" />
          <Field label="Email" placeholder="juan@correo.cl" />
          <Field label="Teléfono" placeholder="+56 9 1234 5678" />
          <Field label="Ingreso mensual" placeholder="1.200.000" />
        </div>
      </div>

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>Condiciones del crédito</h3>
        <div style={grid}>
          <Field label="Monto" defaultValue={borrador?.monto ?? pending.monto} />
          <Field label="Plazo (meses)" defaultValue={borrador?.plazo ?? pending.plazo} />
          <Field label="Fecha primer pago" type="date" />
        </div>
      </div>

      {error && (
        <div style={{ background: "#f8d7da", color: "#721c24", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: 'wrap' }}>
        {!borrador && (
          <button
            disabled={sending}
            onClick={async () => {
              setError(null);
              setSending(true);
              try {
                await crearSolicitud({ ...mapSimToSolicitud(pending), estado: 'borrador' }, user.token);
                navigate("/dashboard");
              } catch (e) {
                setError(e.response?.data?.error || 'No se pudo guardar el borrador');
              } finally {
                setSending(false);
              }
            }}
            style={btnSecondary}
          >
            {sending ? 'Guardando...' : 'Guardar borrador'}
          </button>
        )}

        {borrador && (
          <button
            disabled={sending}
            onClick={async () => {
              const confirmar = window.confirm('¿Eliminar este borrador? Esta acción no se puede deshacer.');
              if (!confirmar) return;
              setError(null);
              setSending(true);
              try {
                await eliminarSolicitud(borrador.id, user.token);
                navigate('/dashboard');
              } catch (e) {
                setError(e.response?.data?.error || 'No se pudo eliminar el borrador');
              } finally {
                setSending(false);
              }
            }}
            style={btnSecondary}
          >
            Eliminar borrador
          </button>
        )}

        <button
          disabled={sending}
          onClick={async () => {
            setError(null);
            setSending(true);
            try {
              const confirmar = window.confirm("¿Seguro que quieres enviar tu solicitud ahora?");
              if (!confirmar) {
                setSending(false);
                return;
              }
              if (borrador) {
                await actualizarEstadoSolicitud(borrador.id, 'enviada', user.token);
                navigate("/solicitud/success", { state: { solicitudId: borrador.id } });
              } else {
                const resp = await crearSolicitud({ ...mapSimToSolicitud(pending), estado: 'enviada' }, user.token);
                navigate("/solicitud/success", { state: { solicitudId: resp.data.id } });
              }
            } catch (e) {
              setError(e.response?.data?.error || 'No se pudo enviar la solicitud');
            } finally {
              setSending(false);
            }
          }}
          style={btnPrimary}
        >
          {sending ? 'Enviando...' : 'Enviar solicitud'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, placeholder, defaultValue, type = "text" }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ color: "#6b7280" }}>{label}</span>
      <input type={type} placeholder={placeholder} defaultValue={defaultValue} style={input} />
    </label>
  );
}

const card = { background: "white", padding: 16, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 16 };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 };
const input = { border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 12px" };
const btnPrimary = { background: "#2563eb", color: "white", border: 0, borderRadius: 8, padding: "10px 16px", cursor: "pointer" };
const btnSecondary = { background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 16px", cursor: "pointer" };

function mapSimToSolicitud(sim) {
  return {
    monto: sim.monto,
    plazo: sim.plazo,
    tasaBase: sim.tasaBase,
    cae: sim.cae,
    cuotaMensual: sim.cuotaMensual,
    montoTotal: sim.montoTotal,
    montoLiquido: sim.montoLiquido,
    interesesTotales: sim.interesesTotales,
    gastosOperacionales: sim.gastosOperacionales,
    comisionApertura: sim.comisionApertura,
    origen: 'simulacion',
  };
}
