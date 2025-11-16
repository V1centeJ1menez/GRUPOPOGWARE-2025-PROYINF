// src/pages/Register.js
import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Paper,
  Stack,
  Avatar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { register as registerApi } from "../services/authApi";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!form.username || !form.email || !form.password) {
      setMessage({
        type: "error",
        text: "Completa usuario, email y contraseña",
      });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setMessage({ type: "error", text: "Email inválido" });
      return;
    }
    if (form.password.length < 6) {
      setMessage({
        type: "error",
        text: "La contraseña debe tener al menos 6 caracteres",
      });
      return;
    }

    try {
      await registerApi({ username: form.username, email: form.email, password: form.password });
      // Ir a pantalla de éxito; desde ahí el usuario va a Login
      navigate("/register/success", {
        replace: true,
        state: { username: form.username, email: form.email },
      });
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || "Error al registrarse";
      setMessage({ type: "error", text: msg });
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
            <PersonAddAltIcon fontSize="large" />
          </Avatar>
          <Typography variant="h5" fontWeight={600}>
            Crear cuenta
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Usuarios del negocio Pogware
          </Typography>
        </Stack>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Nombre de usuario"
            name="username"
            margin="normal"
            value={form.username}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            margin="normal"
            value={form.email}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            label="Contraseña"
            name="password"
            type="password"
            margin="normal"
            value={form.password}
            onChange={handleChange}
            required
            helperText="Mínimo 6 caracteres"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3, borderRadius: 2 }}
          >
            Registrarse
          </Button>

          <Button
            fullWidth
            variant="text"
            sx={{ mt: 2 }}
            onClick={() => navigate("/login")}
          >
            ¿Ya tienes cuenta? Inicia sesión
          </Button>
        </Box>

        {message && (
          <Alert sx={{ mt: 3 }} severity={message.type}>
            {message.text}
          </Alert>
        )}
      </Paper>
    </Container>
  );
}
