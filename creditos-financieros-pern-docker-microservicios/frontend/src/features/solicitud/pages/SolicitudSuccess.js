import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function SolicitudSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const solicitudId = useMemo(() => location.state?.solicitudId || null, [location.state]);

  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval);
          navigate("/dashboard", { replace: true });
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <div style={cardSuccess}>
        <div style={{ fontSize: 48, lineHeight: 1 }}>✅</div>
        <h2 style={{ margin: "8px 0 4px" }}>¡Solicitud enviada!</h2>
        <p style={{ color: "#374151", margin: 0 }}>
          Hemos recibido tu solicitud correctamente{solicitudId ? ` (ID ${solicitudId})` : ""}. Te avisaremos cuando sea evaluada.
        </p>
        <div style={{ marginTop: 16, color: "#6b7280" }}>
          Serás redirigido al dashboard en <strong>{seconds}</strong> segundos.
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button onClick={() => navigate("/dashboard", { replace: true })} style={btnPrimary}>
            Ir al dashboard ahora
          </button>
        </div>
      </div>
    </div>
  );
}

const cardSuccess = {
  background: "#ecfdf5",
  border: "1px solid #d1fae5",
  color: "#065f46",
  padding: 24,
  borderRadius: 12,
  display: "grid",
  gap: 8,
  justifyItems: "start",
};

const btnPrimary = {
  background: "#10b981",
  color: "white",
  border: 0,
  borderRadius: 8,
  padding: "10px 16px",
  cursor: "pointer",
};
