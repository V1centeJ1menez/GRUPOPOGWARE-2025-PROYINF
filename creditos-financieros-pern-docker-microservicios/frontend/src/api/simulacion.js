import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";
const API_URL = `${API_BASE}/simulacion`;

// Health check del servicio
export const healthCheck = () => axios.get(`${API_URL}/health`);

// Obtener configuración del simulador
export const obtenerConfiguracion = () => {
  return axios.get(`${API_URL}/api/config`);
};

// Crear una nueva simulación
export const crearSimulacion = (data, token) => 
  axios.post(`${API_URL}/api/simular`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Obtener historial de simulaciones (con límite opcional)
export const obtenerHistorial = (token, limit = null) => {
  const url = limit ? `${API_URL}/api/historial?limit=${limit}` : `${API_URL}/api/historial`;
  return axios.get(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Obtener una simulación por ID
export const obtenerSimulacionPorId = (id, token) => 
  axios.get(`${API_URL}/api/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Eliminar una simulación
export const eliminarSimulacion = (id, token) => 
  axios.delete(`${API_URL}/api/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
