// Update frontend src/features/firma/pages/Firma.js to match /firmas and add redirect
import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../auth/authContext";
import { Button, TextField } from "@mui/material";
import axios from "axios";
import { obtenerSolicitud } from "../../solicitud/services/solicitudApi";

export default function Firma() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [firmaCode, setFirmaCode] = useState('');

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

  const handleFirmar = async () => {
    setProcessing(true);
    try {
      const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";
      await axios.post(`${API_BASE}/firma/firmas`, { solicitudId: id, firmaCode }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSuccess(true);
      setTimeout(() => navigate(`/desembolso/${id}`), 3000);
    } catch (e) {
      setError(e.response?.data?.error || 'Error al firmar');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!solicitud || solicitud.estado?.toLowerCase() !== 'aprobada' || solicitud.firmada === true) {
  return <div>Solicitud no válida para firma.</div>;
}

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Firmar Crédito para Solicitud #{id}</h2>
      <p>Monto: ${Number(solicitud.monto).toLocaleString()}</p>
      <TextField
        label="Código de Firma (si aplica)"
        value={firmaCode}
        onChange={(e) => setFirmaCode(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleFirmar}
        disabled={processing || success}
      >
        {processing ? 'Firmando...' : success ? 'Firmado Exitosamente' : 'Firmar Crédito'}
      </Button>
      {success && <div style={{ color: 'green', marginTop: 16 }}>Crédito firmado. Redirigiendo al desembolso...</div>}
    </div>
  );
}