// src/features/auth/services/authApi.js
import axios from "axios";
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";
const API_URL = `${API_BASE}/auth`;
export const register = (data) => axios.post(`${API_URL}/register`, data);
export const login = (data) => axios.post(`${API_URL}/login`, data);