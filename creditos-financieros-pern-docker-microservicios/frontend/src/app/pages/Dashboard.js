import { useContext } from "react";
import { AuthContext } from "../../features/auth/authContext";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Bienvenido al Dashboard</h2>
      <p>Tu token: {user?.token.slice(0, 20)}...</p>
      <div style={{ margin: "24px 0" }}>
        <Button variant="contained" color="primary" onClick={() => navigate("/simulacion")}>Simular crédito</Button>
      </div>
      <Button variant="outlined" color="error" onClick={logout}>
        Cerrar sesión
      </Button>
    </div>
  );
}
