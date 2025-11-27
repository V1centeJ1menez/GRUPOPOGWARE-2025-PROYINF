import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Stack,
  Avatar,
  CircularProgress,
  Fade,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useNavigate, useLocation } from "react-router-dom";

export default function RegisterSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const seconds = 120; // tiempo antes de redirigir
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(interval);
          navigate("/login", { replace: true });
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  const email = location.state?.email;
  const username = location.state?.username;

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
      <Fade in timeout={600}>
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
            <Avatar
              sx={{
                bgcolor: "success.main",
                width: 64,
                height: 64,
              }}
            >
              <CheckCircleOutlineIcon fontSize="large" />
            </Avatar>

            <Typography variant="h5" fontWeight={600}>
              ¡Registro completado!
            </Typography>

            <Typography variant="body1" sx={{ mt: 1 }}>
              Tu cuenta se creó correctamente
              {username ? `, ${username}` : ""}.
              {email ? (
                <>
                  <br />
                  Verifica si recibiste un correo en{" "}
                  <strong>{email}</strong>.
                </>
              ) : null}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 2, fontStyle: "italic" }}
            >
              Serás redirigido a “Iniciar sesión” en {remaining} segundos.
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/login", { replace: true })}
                sx={{ borderRadius: 2 }}
              >
                Ir a Iniciar sesión ahora
              </Button>
            </Box>

            <Box
              sx={{
                mt: 3,
                display: "flex",
                alignItems: "center",
                gap: 1,
                justifyContent: "center",
              }}
            >
              <CircularProgress size={20} color="success" />
              <Typography variant="caption" color="text.secondary">
                Redirigiendo automáticamente...
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Fade>
    </Container>
  );
}
