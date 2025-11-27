import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../features/auth/authContext";
import { Button, TextField } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { obtenerPorId as obtenerSolicitud } from "../../features/solicitud/services/solicitudApi"; // Asumiendo que existe esta función en solicitudApi

export default function Desembolso() {
  const { user } = useContext(AuthContext);
  const { id } = useParams(); // id de la solicitud
  const navigate = useNavigate();
  
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cuentaDestino, setCuentaDestino] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    const fetchSolicitud = async () => {
      if (!user?.token || !id) return;
      setLoading(true);
      setError(null);
      try {
        const resp = await obtenerSolicitud(id, user.token);
        setSolicitud(resp.data);
      } catch (e) {
        setError(e.response?.data?.error || 'No se pudo cargar la solicitud');
      } finally {
        setLoading(false);
      }
    };
    fetchSolicitud();
  }, [user?.token, id]);

  const handleSubmit = async () => {
    if (!cuentaDestino || !solicitud?.monto) return;
    setProcessing(true);
    try {
      await procesarDesembolso(id, solicitud.monto, cuentaDestino, user.token);
      setSuccess(true);
      // Opcional: redirigir después de éxito
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (e) {
      setError(e.response?.data?.error || 'Error al procesar desembolso');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!solicitud || solicitud.estado.toLowerCase() !== 'firmada') return <div>Solicitud no válida para desembolso.</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Procesar Desembolso para Solicitud #{id}</h2>
      <p>Monto aprobado: ${Number(solicitud.monto).toLocaleString()}</p>
      <TextField
        label="Cuenta Destino (RUT/CBU/etc)"
        value={cuentaDestino}
        onChange={(e) => setCuentaDestino(e.target.value)}
        fullWidth
        margin="normal"
        required
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={processing || success}
      >
        {processing ? 'Procesando...' : success ? 'Desembolso Completado' : 'Procesar Desembolso'}
      </Button>
      {success && <div style={{ color: 'green', marginTop: 16 }}>Desembolso procesado exitosamente.</div>}
    </div>
  );
}