import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../auth/authContext';
import { obtenerSolicitud, actualizarEstadoSolicitud } from '../services/solicitudApi';

export default function SolicitudDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const isAdmin = user?.role === 'admin';

  const fetchDetalle = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const resp = await obtenerSolicitud(id, user.token);
      setDetalle(resp.data);
    } catch (e) {
      console.error(e);
      setError('No se pudo cargar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetalle(); }, [id, user?.token]);

  const changeEstado = async (estado) => {
    if (!window.confirm(`¿Confirmar cambiar estado a '${estado}'?`)) return;
    setActionLoading(true);
    try {
      await actualizarEstadoSolicitud(id, estado, user.token);
      fetchDetalle();
    } catch (e) {
      console.error(e);
      setError('No se pudo actualizar estado');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReevaluarToEnviada = async () => {
    setActionLoading(true);
    try {
      await actualizarEstadoSolicitud(id, 'enviada', user.token);
      fetchDetalle();
    } catch (e) {
      console.error(e);
      setError('No se pudo reiniciar el estado a enviada');
    } finally {
      setActionLoading(false);
    }
  };

  if (!user) return <div style={{ padding: 20 }}>Acceso denegado. Inicia sesión.</div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 12 }}>← Volver</button>
      <h2>Detalle Solicitud #{id}</h2>
      {error && <div style={{ background: '#fee', padding: 10, borderRadius: 6, marginBottom: 12 }}>{error}</div>}
      {loading ? <div>Cargando...</div> : (
        detalle ? (
          <div style={{ background: 'white', padding: 16, borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div><strong>ID:</strong> {detalle.id}</div>
                <div><strong>Usuario:</strong> {detalle.user ? (detalle.user.username || detalle.user.id) : detalle.user_id}</div>
                <div><strong>Origen:</strong> {detalle.origen || '—'}</div>
                <div><strong>Estado:</strong> {detalle.estado}</div>
                <div style={{ marginTop: 8 }}><strong>Monto:</strong> ${Number(detalle.monto).toLocaleString()}</div>
                <div><strong>Plazo:</strong> {detalle.plazo} meses</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {isAdmin ? (
                  <>
                    <button disabled={actionLoading} onClick={() => changeEstado('aprobada')}>Aceptar</button>
                    <button disabled={actionLoading} onClick={() => changeEstado('rechazada')}>Rechazar</button>
                    <button disabled={actionLoading} onClick={handleReevaluarToEnviada} title="Reinicia a estado 'enviada'">Re-evaluar</button>
                  </>
                ) : (
                  <div style={{ color: '#666' }}>Acciones reservadas a administradores</div>
                )}
              </div>
            </div>

            {detalle.evaluacion && (
              <div style={{ marginTop: 12 }}>
                <h4>Última evaluación</h4>
                <div>Decisión: <strong>{detalle.evaluacion.decision}</strong></div>
                <div>Score: {detalle.evaluacion.score}</div>
                <div>Razones: <pre style={{ whiteSpace: 'pre-wrap' }}>{detalle.evaluacion.razones}</pre></div>
              </div>
            )}

            <div style={{ marginTop: 12 }}>
              <h4>Detalle completo</h4>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>{JSON.stringify(detalle, null, 2)}</pre>
            </div>
          </div>
        ) : <div>No se encontró la solicitud.</div>
      )}
    </div>
  );
}
