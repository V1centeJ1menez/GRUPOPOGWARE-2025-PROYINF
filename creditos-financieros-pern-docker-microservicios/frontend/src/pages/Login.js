// src/pages/Login.js
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { login as loginUser } from "../api/auth";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(form);
      login(res.data.token);
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
