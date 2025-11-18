import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../../features/auth/authContext";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { listarSolicitudes, listarNotificaciones } from "../../features/solicitud/services/solicitudApi";
import { obtenerHistorial } from "../../features/simulacion/services/simulacionApi";

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifySaved, setNotifySaved] = useState(false);
  
  const [solicitudes, setSolicitudes] = useState([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);
  const [errorSolicitudes, setErrorSolicitudes] = useState(null);
  const [sims, setSims] = useState([]);
  const [loadingSims, setLoadingSims] = useState(false);
  const [errorSims, setErrorSims] = useState(null);
  const [notifs, setNotifs] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [errorNotifs, setErrorNotifs] = useState(null);
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  useEffect(() => {
    try {
      const flag = localStorage.getItem('notify_saved_sim');
      if (flag) {
        setNotifySaved(true);
        localStorage.removeItem('notify_saved_sim');
      }
    } catch {}
  }, []);

  // notifications removed per UX: no notification box shown in dashboard


  useEffect(() => {
    const fetchSolicitudes = async () => {
      if (!user?.token) return;
      setLoadingSolicitudes(true);
      setErrorSolicitudes(null);
      try {
        const resp = await listarSolicitudes(user.token);
        setSolicitudes(Array.isArray(resp.data) ? resp.data : []);
      } catch (e) {
        setErrorSolicitudes(e.response?.data?.error || 'No se pudieron cargar tus solicitudes');
      } finally {
        setLoadingSolicitudes(false);
      }
    };
    const fetchSims = async () => {
      if (!user?.token) return;
      setLoadingSims(true);
      setErrorSims(null);
      try {
        const resp = await obtenerHistorial(user.token, 5);
        setSims(Array.isArray(resp.data) ? resp.data : []);
      } catch (e) {
        setErrorSims(e.response?.data?.error || 'No se pudieron cargar tus simulaciones');
      } finally {
        setLoadingSims(false);
      }
    };
    const fetchNotifs = async () => {
      if (!user?.token) return;
      setLoadingNotifs(true);
      setErrorNotifs(null);
      try {
        const resp = await listarNotificaciones(user.token);
        setNotifs(Array.isArray(resp.data) ? resp.data : []);
      } catch (e) {
        setErrorNotifs(e.response?.data?.error || 'No se pudieron cargar tus notificaciones');
      } finally {
        setLoadingNotifs(false);
      }
    };
    fetchSolicitudes();
    fetchSims();
    fetchNotifs();

    // Poll solicitudes every 10s so user sees admin updates without manual refresh
    const solicitudesInterval = setInterval(fetchSolicitudes, 10000);
    const notifsInterval = setInterval(fetchNotifs, 15000);
    return () => { clearInterval(solicitudesInterval); clearInterval(notifsInterval); };
  }, [user?.token]);

  const borradores = useMemo(() => solicitudes.filter(s => (s.estado || '').toLowerCase() === 'borrador'), [solicitudes]);
  const otras = useMemo(() => solicitudes.filter(s => (s.estado || '').toLowerCase() !== 'borrador'), [solicitudes]);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Bienvenido al Dashboard de Cliente</h2>
      <p>Tu token: {user?.token.slice(0, 20)}...</p>
      {notifySaved && (
        <div style={{ background: '#e6fffb', color: '#006d75', padding: 12, borderRadius: 8, margin: '12px 0' }}>
          ✅ Tu simulación fue guardada en tu historial. Ve a visitarla desde el Simulador.
        </div>
      )}
      <div style={{ margin: "24px 0" }}>
        <Button variant="contained" color="primary" onClick={() => navigate("/simulacion")}>Simular crédito</Button>
      </div>
      {/* notification box removed as requested */}

      <div style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 8 }}>Notificaciones</h3>
        {loadingNotifs && (
          <div style={{ background: '#f3f4f6', color: '#4b5563', padding: 12, borderRadius: 8 }}>Cargando notificaciones...</div>
        )}
        {errorNotifs && (
          <div style={{ background: '#fde2e2', color: '#b91c1c', padding: 12, borderRadius: 8 }}>{errorNotifs}</div>
        )}
        {!loadingNotifs && !errorNotifs && notifs.length === 0 && (
          <div style={{ background: '#f9fafb', color: '#6b7280', padding: 12, borderRadius: 8 }}>Sin notificaciones por ahora.</div>
        )}
        {notifs.length > 0 && (
          <div style={card}>
            <div style={{ display:'grid', gap: 8 }}>
              {notifs.map(n => (
                <div key={n.id} style={row}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{n.titulo || 'Notificación'}</div>
                    <div style={{ color:'#374151', fontSize: 14 }}>{n.mensaje}</div>
                    <div style={{ ...muted, marginTop: 2 }}>Fecha: {new Date(n.created_at).toLocaleString('es-CL')}</div>
                  </div>
                  <span style={{ ...badge, ...(n.tipo === 'evaluacion' ? badgeInfo : badgeMuted) }}>{n.tipo}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <h3 style={{ marginBottom: 8 }}>Mis simulaciones</h3>
        {loadingSims && (
          <div style={{ background: '#f3f4f6', color: '#4b5563', padding: 12, borderRadius: 8 }}>Cargando simulaciones...</div>
        )}
        {errorSims && (
          <div style={{ background: '#fde2e2', color: '#b91c1c', padding: 12, borderRadius: 8 }}>{errorSims}</div>
        )}
        {!loadingSims && !errorSims && sims.length === 0 && (
          <div style={{ background: '#fff7ed', color: '#92400e', padding: 12, borderRadius: 8 }}>No tienes simulaciones guardadas aún. Crea la primera desde el simulador.</div>
        )}

        {sims.length > 0 && (
          <div style={card}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Recientes ({sims.length})</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {sims.map(sim => (
                <div key={sim.id} style={row}>
                  <div>
                    <div style={muted}>ID #{sim.id}</div>
                    <div>
                      Monto: <strong>${Number(sim.monto).toLocaleString()}</strong> • Plazo: <strong>{sim.plazo} meses</strong> • Cuota: <strong>${Number(sim.cuotaMensual).toLocaleString()}</strong>
                    </div>
                    <div style={{ ...muted, marginTop: 2 }}>Fecha: {new Date(sim.fecha).toLocaleString('es-CL')}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button size="small" variant="outlined" onClick={() => navigate(`/simulacion/${sim.id}`)}>Ver detalle</Button>
                    <Button size="small" variant="contained" onClick={() => navigate('/solicitud/nueva', { state: { sim } })}>Solicitar</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <h3 style={{ marginBottom: 8 }}>Mis solicitudes</h3>
        {loadingSolicitudes && (
          <div style={{ background: '#f3f4f6', color: '#4b5563', padding: 12, borderRadius: 8 }}>Cargando solicitudes...</div>
        )}
        {errorSolicitudes && (
          <div style={{ background: '#fde2e2', color: '#b91c1c', padding: 12, borderRadius: 8 }}>{errorSolicitudes}</div>
        )}
        {!loadingSolicitudes && !errorSolicitudes && solicitudes.length === 0 && (
          <div style={{ background: '#fff7ed', color: '#92400e', padding: 12, borderRadius: 8 }}>Aún no tienes solicitudes. Crea tu primera solicitud desde el simulador.</div>
        )}

        {borradores.length > 0 && (
          <div style={card}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Borradores ({borradores.length})</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {borradores.map(b => (
                <div key={b.id} style={row}>
                  <div>
                    <div style={muted}>ID #{b.id}</div>
                    <div>
                      Monto: <strong>${Number(b.monto).toLocaleString()}</strong> • Plazo: <strong>{b.plazo} meses</strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => navigate('/solicitud/nueva', { state: { solicitud: b } })}
                    >
                      Ir a completar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {otras.length > 0 && (
          <div style={card}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>En trámite / Historial ({otras.length})</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {otras.map(s => (
                <div key={s.id} style={row}>
                  <div>
                    <div style={muted}>ID #{s.id}</div>
                    <div>
                      Monto: <strong>${Number(s.monto).toLocaleString()}</strong> • Plazo: <strong>{s.plazo} meses</strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span
                      style={{
                        ...badge,
                        ...(String(s.estado).toLowerCase() === 'aprobada' ? badgeSuccess
                          : String(s.estado).toLowerCase() === 'rechazada' ? badgeError
                          : String(s.estado).toLowerCase() === 'enviada' || String(s.estado).toLowerCase() === 'en_revision' ? badgeInfo
                          : badgeMuted)
                      }}
                    >
                      Estado: {s.estado || '—'}
                    </span>
                    {s.evaluacion && (
                      <div style={{ textAlign: 'right', fontSize: 13, color: '#374151' }}>
                        Decisión: <strong>{s.evaluacion.decision || '—'}</strong>{typeof s.evaluacion.score !== 'undefined' ? ` · score: ${s.evaluacion.score}` : ''}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Button variant="outlined" color="error" onClick={logout}>
        Cerrar sesión
      </Button>
    </div>
  );
}

const card = { background: 'white', padding: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', margin: '12px 0' };
const row = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' };
const muted = { color: '#6b7280', fontSize: 12 };
const badge = { padding: '2px 8px', borderRadius: 999, fontSize: 12, textTransform: 'capitalize' };
const badgeInfo = { background: '#e0f2fe', color: '#075985' };
const badgeSuccess = { background: '#dcfce7', color: '#166534' };
const badgeError = { background: '#fee2e2', color: '#991b1b' };
const badgeMuted = { background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: 999, fontSize: 12 };
