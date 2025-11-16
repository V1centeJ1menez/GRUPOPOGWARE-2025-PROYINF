import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../auth/authContext';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export default function AdminHome() {
  const { user } = useContext(AuthContext);
  const [tab, setTab] = useState('solicitudes');
  const [sols, setSols] = useState([]);
  const [sims, setSims] = useState([]);
  const [users, setUsers] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setError(null);
      setLoading(true);
      try {
        if (tab === 'solicitudes') {
          const resp = await axios.get(`${API_BASE}/solicitud/api/solicitudes/admin`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setSols(resp.data || []);
        } else if (tab === 'clientes') {
          const resp = await axios.get(`${API_BASE}/auth/users`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setUsers(resp.data);
        } else if (tab === 'simulaciones') {
          const resp = await axios.get(`${API_BASE}/simulacion/api/admin/all`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setSims(resp.data || []);
        } else if (tab === 'config') {
          const resp = await axios.get(`${API_BASE}/simulacion/api/config`);
          setConfig(resp.data);
        }
      } catch (e) {
        setError(e.response?.data?.error || e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tab, user?.token]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Panel de Administración</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={() => setTab('solicitudes')} style={btn(tab==='solicitudes')}>Solicitudes</button>
        <button onClick={() => setTab('simulaciones')} style={btn(tab==='simulaciones')}>Simulaciones</button>
        <button onClick={() => setTab('clientes')} style={btn(tab==='clientes')}>Clientes</button>
        <button onClick={() => setTab('config')} style={btn(tab==='config')}>Configuración</button>
        <button onClick={() => setTab('metricas')} style={btn(tab==='metricas')}>Métricas</button>
      </div>
            {tab === 'simulaciones' && (
              <div style={card}>
                <h3>Simulaciones</h3>
                <table style={table}>
                  <thead>
                    <tr><th>ID</th><th>User</th><th>Monto</th><th>Plazo</th><th>Cuota</th><th>Tasa Base</th><th>CAE</th><th>Fecha</th></tr>
                  </thead>
                  <tbody>
                    {sims.map(s => (
                      <tr key={s.id}>
                        <td>{s.id}</td>
                        <td>{s.user_id}</td>
                        <td>{formatCurrency(s.monto)}</td>
                        <td>{s.plazo}</td>
                        <td>{formatCurrency(s.cuotaMensual)}</td>
                        <td>{formatPercent(s.tasaBase)}</td>
                        <td>{formatPercent(s.cae)}</td>
                        <td>{new Date(s.fecha).toLocaleString('es-CL')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
      {loading && <div>Cargando...</div>}
      {error && <div style={{ background:'#fde2e2', color:'#b91c1c', padding: 12, borderRadius: 8 }}>{error}</div>}

      {tab === 'solicitudes' && (
        <div style={card}>
          <h3>Solicitudes</h3>
          <table style={table}>
            <thead>
              <tr><th>ID</th><th>User</th><th>Monto</th><th>Plazo</th><th>Estado</th><th>Fecha</th></tr>
            </thead>
            <tbody>
              {sols.map(s => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.user_id}</td>
                  <td>{formatCurrency(s.monto)}</td>
                  <td>{s.plazo}</td>
                  <td>{s.estado}</td>
                  <td>{new Date(s.created_at).toLocaleString('es-CL')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'clientes' && (
        <div style={card}>
          <h3>Clientes</h3>
          <table style={table}>
            <thead>
              <tr><th>ID</th><th>Usuario</th><th>Email</th><th>Rol</th><th>Creado</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.email || '—'}</td>
                  <td>{u.role}</td>
                  <td>{u.created_at ? new Date(u.created_at).toLocaleString('es-CL') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'config' && (
        <div style={card}>
          <h3>Configuración del simulador (solo lectura)</h3>
          {config ? (
            <ul>
              <li>Tasa base anual: {formatPercent(config.tasaBaseAnual)}</li>
              <li>Gastos operacionales: {formatPercent(config.gastosOperacionalesPorcentaje)}</li>
              <li>Comisión apertura: {formatPercent(config.comisionApertura)}</li>
              <li>Monto: {formatCurrency(config.montoMinimo)} - {formatCurrency(config.montoMaximo)}</li>
              <li>Plazo: {config.plazoMinimo} - {config.plazoMaximo} meses</li>
            </ul>
          ) : (
            <div>Sin datos</div>
          )}
        </div>
      )}

      {tab === 'metricas' && (
        <div style={card}>
          <h3>Métricas (placeholder)</h3>
          <p>Próximamente: volumen de simulaciones/solicitudes, tasas de conversión, etc.</p>
        </div>
      )}
    </div>
  );
}

function formatCurrency(n){
  const v = Number(n);
  if (!Number.isFinite(v)) return '—';
  return new Intl.NumberFormat('es-CL',{ style:'currency', currency:'CLP', minimumFractionDigits:0 }).format(Math.round(v));
}
function formatPercent(n){
  const v = Number(n);
  if (!Number.isFinite(v)) return '—';
  return `${(v*100).toFixed(2)}%`;
}

const btn = (active) => ({
  border: '1px solid #e5e7eb', background: active? '#1f2937' : '#f3f4f6', color: active? '#fff':'#111827', borderRadius: 8, padding: '8px 12px', cursor: 'pointer'
});
const card = { background: 'white', padding: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginTop: 8 };
const table = { width: '100%', borderCollapse: 'collapse' };
