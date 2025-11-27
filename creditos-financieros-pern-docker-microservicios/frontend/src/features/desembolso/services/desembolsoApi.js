// src/features/desembolso/services/desembolsoApi.js
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";

export const procesarDesembolso = (solicitudId, monto, cuentaDestino, token) =>
  axios.post(`${API_BASE}/desembolsos`, { solicitudId, monto, cuentaDestino }, {
    headers: { Authorization: `Bearer ${token}` }
  });