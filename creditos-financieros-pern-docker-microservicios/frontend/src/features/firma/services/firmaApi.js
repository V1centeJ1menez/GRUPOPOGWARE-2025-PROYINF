import axios from "axios";
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";
const API_URL = `${API_BASE}/firma`;

export const iniciarFirma = (id, token) =>
    axios.post(`${API_URL}/api/firmar/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
