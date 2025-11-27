import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../auth/authContext';
import { listarTodasSolicitudes, actualizarEstadoSolicitud } from '../services/solicitudApi';

export default function AdminSolicitudes() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const isAdmin = user?.role === 'admin';

  const fetchAll = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const resp = await listarTodasSolicitudes(user.token);
      setSolicitudes(resp.data);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar solicitudes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [user?.token]);

  const changeEstado = async (id, estado) => {
    if (!window.confirm(`¿Confirmar cambiar estado a '${estado}'?`)) return;
    setActionLoading(true);
    try {
      await actualizarEstadoSolicitud(id, estado, user.token);
      fetchAll();
      // nothing else needed. AdminDetalle actualizará si está abierta.
    } catch (err) {
      console.error(err);
      setError('No se pudo actualizar estado');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReevaluarToEnviada = async (id) => {
    setActionLoading(true);
    try {
      await actualizarEstadoSolicitud(id, 'enviada', user.token);
      fetchAll();
    } catch (err) {
      console.error(err);
      setError('No se pudo reiniciar el estado a enviada');
    } finally {
      setActionLoading(false);
    }
  };

  if (!user) return <div style={{ padding: 20 }}>Acceso denegado. Inicia sesión.</div>;

  return (
    <div style={{ padding: 20, maxWidth: 1100, margin: '0 auto' }}>
      <h2>Panel Admin — Solicitudes</h2>
      {error && <div style={{ background: '#fee', padding: 10, borderRadius: 6, marginBottom: 12 }}>{error}</div>}
      {loading ? <div>Cargando...</div> : (
        <div style={{ display: 'grid', gap: 12 }}>
          {solicitudes.map(s => (
            <div key={s.id} style={{ background: 'white', padding: 12, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>Solicitud #{s.id}</strong> — <span>{s.estado}</span>
                  <div style={{ fontSize: 13, color: '#444' }}>Monto: ${Number(s.monto).toLocaleString()} • Plazo: {s.plazo} meses</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => navigate(`/admin/solicitudes/${s.id}`)}>Ver solicitud</button>
                  {isAdmin && (
                    <>
                      <button disabled={actionLoading} onClick={() => changeEstado(s.id, 'aprobada')}>Aceptar</button>
                      <button disabled={actionLoading} onClick={() => changeEstado(s.id, 'rechazada')}>Rechazar</button>
                      <button disabled={actionLoading} onClick={() => handleReevaluarToEnviada(s.id)} title="Reinicia a estado 'enviada'">Re-evaluar</button>
                    </>
                  )}
                </div>
              </div>
              {s.evaluacion && (
                <div style={{ marginTop: 8, fontSize: 13, color: '#333' }}>
                  Última evaluación: <strong>{s.evaluacion.decision}</strong> • score: {s.evaluacion.score}
                </div>
              )}

              {/* detalle inline removido: usar página de detalle en /admin/solicitudes/:id */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
