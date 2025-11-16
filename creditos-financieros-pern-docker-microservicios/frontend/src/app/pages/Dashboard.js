import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../features/auth/authContext";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifySaved, setNotifySaved] = useState(false);

  useEffect(() => {
    try {
      const flag = localStorage.getItem('notify_saved_sim');
      if (flag) {
        setNotifySaved(true);
        localStorage.removeItem('notify_saved_sim');
      }
    } catch {}
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Bienvenido al Dashboard</h2>
      <p>Tu token: {user?.token.slice(0, 20)}...</p>
      {notifySaved && (
        <div style={{ background: '#e6fffb', color: '#006d75', padding: 12, borderRadius: 8, margin: '12px 0' }}>
          ✅ Tu simulación fue guardada en tu historial. Ve a visitarla desde el Simulador.
        </div>
      )}
      <div style={{ margin: "24px 0" }}>
        <Button variant="contained" color="primary" onClick={() => navigate("/simulacion")}>Simular crédito</Button>
      </div>
      <Button variant="outlined" color="error" onClick={logout}>
        Cerrar sesión
      </Button>
    </div>
  );
}
