// src/pages/Login.js
import { useState, useContext } from "react";
import { AuthContext } from "../authContext";
import { login as loginUser } from "../services/authApi";
import { crearSimulacion } from "../../simulacion/services/simulacionApi";
import {
  Button,
  TextField,
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Avatar,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  function getRoleFromToken(token) {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      let payload = parts[1].replace(/-/g,'+').replace(/_/g,'/');
      while (payload.length % 4 !== 0) payload += '=';
      const data = JSON.parse(atob(payload));
      return data.role || null;
    } catch { return null; }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(form);
      const token = res.data.token;
      login(token);
      const role = getRoleFromToken(token);

      // Si es admin, redirigir inmediatamente al panel sin procesar flujo de simulación pendiente
      if (role === 'admin') {
        navigate('/admin', { replace: true });
        return;
      }
      // Redirección según intención:
      try {
        const raw = localStorage.getItem("pending_simulation");
        const action = localStorage.getItem("pending_action");
        if (raw) {
          const sim = JSON.parse(raw);
          if (action === 'save_to_history') {
            try { await crearSimulacion({ monto: sim.monto, plazo: sim.plazo }, res.data.token); } catch {}
            try { localStorage.setItem('notify_saved_sim', '1'); } catch {}
            localStorage.removeItem('pending_action');
            navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true });
            return;
          }
          if (from === "/solicitud/nueva") {
            navigate("/solicitud/nueva", { replace: true, state: { sim } });
            return;
          }
        }
      } catch {}
      // Caso general (usuario normal): ir a la ruta de retorno o dashboard
      navigate(from, { replace: true });
    } catch {
      alert("Usuario o contraseña incorrectos");
    }
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          width: "100%",
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        <Stack alignItems="center" spacing={1}>
          <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
            <LockOutlinedIcon fontSize="large" />
          </Avatar>
          <Typography variant="h5" fontWeight={600}>
            Iniciar sesión
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Accede a tu cuenta de Pogware
          </Typography>
        </Stack>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Usuario"
            name="username"
            margin="normal"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
          <TextField
            fullWidth
            label="Contraseña"
            name="password"
            type="password"
            margin="normal"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3, borderRadius: 2 }}
          >
            Ingresar
          </Button>

          <Button
            fullWidth
            variant="text"
            sx={{ mt: 2 }}
            onClick={() => navigate("/register")}
          >
            ¿No tienes cuenta? Crear una
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
