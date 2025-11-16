import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../../features/auth/authContext";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { listarSolicitudes } from "../../features/solicitud/services/solicitudApi";

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifySaved, setNotifySaved] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);
  const [errorSolicitudes, setErrorSolicitudes] = useState(null);
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

  useEffect(() => {
    const fetchNotifs = async () => {
      if (!user?.token) return;
      try {
        const resp = await fetch(`${API_BASE}/evaluacion/api/notificaciones`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (resp.ok) {
          const data = await resp.json();
          setNotifs(Array.isArray(data) ? data : []);
        }
      } catch {}
    };
    fetchNotifs();
  }, [user?.token]);

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
    fetchSolicitudes();
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
      {notifs.length > 0 && (
        <div style={{ background: '#eef6ff', color: '#09396b', padding: 12, borderRadius: 8, margin: '12px 0' }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>{notifs[0].titulo}</div>
          <div style={{ marginBottom: 8 }}>{notifs[0].mensaje}</div>
          {String(notifs[0].titulo || '').toLowerCase().includes('aprobada') && (
            <Button variant="outlined" onClick={() => navigate('/admin')}>Avanzar a firma</Button>
          )}
        </div>
      )}

      <div style={{ marginTop: 24 }}>
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
                    <span style={badgeMuted}>Borrador</span>
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
                    <span style={{ ...badge, ...(s.estado === 'aprobada' ? badgeSuccess : s.estado === 'rechazada' ? badgeError : badgeInfo) }}>
                      {s.estado === 'aprobada' ? 'Aceptada' : s.estado === 'rechazada' ? 'Rechazada' : (s.estado || 'En trámite')}
                    </span>
                    {s.estado === 'aprobada' && (
                      <Button size="small" variant="outlined" onClick={() => navigate('/admin')}>Ir a firmar</Button>
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
