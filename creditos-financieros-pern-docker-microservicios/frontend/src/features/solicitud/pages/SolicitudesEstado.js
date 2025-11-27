import React from 'react';
import { useNavigate } from 'react-router-dom';

const sample = [
  { id: 101, monto: 1800000, plazo: 24, estado: 'enviada', origen: 'simulacion', evaluacion: { decision: 'en_revision', score: 610 } },
  { id: 102, monto: 5000000, plazo: 36, estado: 'enviada', origen: 'simulacion', evaluacion: { decision: 'rechazada', score: 480, razones: ['Score bajo'] } },
  { id: 103, monto: 2500000, plazo: 12, estado: 'aprobada', origen: 'solicitud', evaluacion: { decision: 'aprobada', score: 720 } },
  { id: 104, monto: 5900000, plazo: 24, estado: 'enviada', origen: 'simulacion', evaluacion: null },
  { id: 105, monto: 900000, plazo: 6, estado: 'rechazada', origen: 'solicitud', evaluacion: { decision: 'rechazada', score: 500, razones: ['Plazo corto', 'Score bajo'] } },
];

function Badge({ children, kind = 'info' }) {
  const styles = {
    base: { padding: '4px 8px', borderRadius: 999, fontSize: 12, textTransform: 'capitalize' },
    info: { background: '#e0f2fe', color: '#075985' },
    success: { background: '#dcfce7', color: '#166534' },
    error: { background: '#fee2e2', color: '#991b1b' },
    muted: { background: '#f3f4f6', color: '#374151' },
  };
  return <span style={{ ...styles.base, ...(styles[kind] || styles.info) }}>{children}</span>;
}

function SolicitudCard({ s }) {
  return (
    <div style={{ background: 'white', padding: 16, borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontWeight: 700 }}>Solicitud #{s.id}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Badge kind={s.estado === 'aprobada' ? 'success' : (s.estado === 'rechazada' ? 'error' : 'info')}>{s.estado}</Badge>
          <Badge kind='muted'>{s.origen}</Badge>
        </div>
      </div>
      <div style={{ marginBottom: 8 }}>
        Monto: <strong>${Number(s.monto).toLocaleString()}</strong> • Plazo: <strong>{s.plazo} meses</strong>
      </div>
      <div style={{ fontSize: 13, color: '#374151' }}>
        {s.evaluacion ? (
          <div>
            <div>Evaluación: <strong>{s.evaluacion.decision}</strong> {s.evaluacion.score ? `• score ${s.evaluacion.score}` : ''}</div>
            {s.evaluacion.razones && <div style={{ color: '#b91c1c' }}>Motivos: {s.evaluacion.razones.join(', ')}</div>}
          </div>
        ) : (
          <div>Evaluación: pendiente</div>
        )}
      </div>
    </div>
  );
}

export default function SolicitudesEstado() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Estado de Solicitudes</h2>
        <div>
          <button onClick={() => navigate('/dashboard')} style={{ marginRight: 8 }}>← Volver</button>
        </div>
      </div>

      <p style={{ color: '#6b7280' }}>Ejemplos de solicitudes con distintos estados y su evaluación asociada. Las entradas son mock para demostración.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
        {sample.map(s => (
          <SolicitudCard key={s.id} s={s} />
        ))}
      </div>
    </div>
  );
}
