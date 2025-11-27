// src/features/auth/authContext.js
import React, { createContext, useState, useEffect } from "react";
export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [hydrating, setHydrating] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = safeDecode(token);
      setUser({ token, role: decoded?.role, username: decoded?.username, id: decoded?.id });
    }
    setHydrating(false);
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    const decoded = safeDecode(token);
    setUser({ token, role: decoded?.role, username: decoded?.username, id: decoded?.id });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hydrating }}>
      {children}
    </AuthContext.Provider>
  );
};

function safeDecode(token){
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    let payload = parts[1];
    // base64url -> base64
    payload = payload.replace(/-/g, '+').replace(/_/g, '/');
    // pad
    while (payload.length % 4 !== 0) payload += '=';
    const json = atob(payload);
    return JSON.parse(json);
  } catch { return null; }
}
