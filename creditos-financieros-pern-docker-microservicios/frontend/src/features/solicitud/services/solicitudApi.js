import axios from "axios";
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";
const API_URL = `${API_BASE}/solicitud`;

export const crearSolicitud = (data, token) =>
  axios.post(`${API_URL}/api/solicitudes`, data, { headers: { Authorization: `Bearer ${token}` } });

export const listarSolicitudes = (token) =>
  axios.get(`${API_URL}/api/solicitudes`, { headers: { Authorization: `Bearer ${token}` } });

export const listarTodasSolicitudes = (token) =>
  axios.get(`${API_URL}/api/solicitudes/admin`, { headers: { Authorization: `Bearer ${token}` } });

export const actualizarEstadoSolicitud = (id, estado, token) =>
  axios.patch(`${API_URL}/api/solicitudes/${id}`, { estado }, { headers: { Authorization: `Bearer ${token}` } });

export const eliminarSolicitud = (id, token) =>
  axios.delete(`${API_URL}/api/solicitudes/${id}`, { headers: { Authorization: `Bearer ${token}` } });

export const obtenerSolicitud = (id, token) =>
  axios.get(`${API_URL}/api/solicitudes/${id}`, { headers: { Authorization: `Bearer ${token}` } });

export const evaluarSolicitudAdmin = (id, token) =>
  axios.post(`${API_URL}/api/solicitudes/${id}/evaluar`, {}, { headers: { Authorization: `Bearer ${token}` } });

export const listarNotificaciones = (token) =>
  axios.get(`${API_URL}/api/notificaciones`, { headers: { Authorization: `Bearer ${token}` } });
