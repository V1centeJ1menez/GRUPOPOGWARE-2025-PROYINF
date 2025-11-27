// src/components/Navbar.jsx
import React, { useState, useContext } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Button,
  Box,
  Tooltip,
  Divider,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { ThemeModeContext } from "../context/ThemeContext";
import { AuthContext } from "../../features/auth/authContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { mode, toggleColorMode } = useContext(ThemeModeContext);
  const navigate = useNavigate();
  const theme = useTheme();

  const [anchorElAccount, setAnchorElAccount] = useState(null);
  const [anchorElMobile, setAnchorElMobile] = useState(null);
  const openAccount = Boolean(anchorElAccount);
  const openMobile = Boolean(anchorElMobile);

  const handleAccountOpen = (e) => setAnchorElAccount(e.currentTarget);
  const handleAccountClose = () => setAnchorElAccount(null);
  const handleMobileOpen = (e) => setAnchorElMobile(e.currentTarget);
  const handleMobileClose = () => setAnchorElMobile(null);

  const handleLogout = () => {
    logout();
    handleAccountClose();
    handleMobileClose();
    navigate("/");
  };

  const role = user?.role || null;

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backdropFilter: "blur(10px)",
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(18, 18, 18, 0.85)"
            : "rgba(255, 255, 255, 0.65)",
        color: theme.palette.text.primary,
        borderBottom: `1px solid ${theme.palette.divider}`,
        transition: "background-color 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      <Toolbar sx={{ py: 1 }}>
        {/* LOGO + NOMBRE */}
        <Box
          component={RouterLink}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            color: "inherit",
            flexGrow: 1,
            gap: 1.2,
            "&:hover": { opacity: 0.85 },
          }}
        >
          <Box
            component="img"
            src="https://www.svgrepo.com/show/481410/gecko.svg"
            alt="Pogware Logo"
            sx={{
              width: 34,
              height: 34,
              objectFit: "contain",
              filter:
                mode === "dark"
                  ? "invert(1) brightness(1.2)"
                  : "invert(0) brightness(0.9)",
              transition: "filter 0.3s ease",
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              letterSpacing: 0.6,
              userSelect: "none",
            }}
          >
            Pogware
          </Typography>
        </Box>

        {/* MENÚ DESKTOP */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1, alignItems: "center" }}>
          {user && (
            <Button component={RouterLink} to="/dashboard" sx={{ textTransform: "none" }}>
              Dashboard
            </Button>
          )}

          {user && role === "admin" && (
            <Button component={RouterLink} to="/admin" sx={{ textTransform: "none" }}>
              Admin
            </Button>
          )}

          {user ? (
            <Button onClick={handleLogout} sx={{ textTransform: "none" }}>
              Cerrar sesión
            </Button>
          ) : (
            <>
              <Button component={RouterLink} to="/login" sx={{ textTransform: "none" }}>
                Iniciar sesión
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                color="primary"
                sx={{
                  textTransform: "none",
                  borderRadius: "20px",
                  px: 2,
                  fontWeight: 500,
                  boxShadow: "none",
                  "&:hover": { boxShadow: "0 0 10px rgba(0,0,0,0.15)" },
                }}
              >
                Registrarse
              </Button>
            </>
          )}

          <Tooltip title={`Cambiar a modo ${mode === "dark" ? "claro" : "oscuro"}`}>
            <IconButton color="inherit" onClick={toggleColorMode}>
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          {user && (
            <IconButton color="inherit" onClick={handleAccountOpen}>
              <AccountCircle />
            </IconButton>
          )}
        </Box>

        {/* MENÚ MOBILE */}
        <Box sx={{ display: { xs: "flex", md: "none" }, gap: 1 }}>
          <IconButton color="inherit" onClick={toggleColorMode}>
            {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          <IconButton color="inherit" onClick={handleMobileOpen}>
            <MenuIcon />
          </IconButton>
        </Box>
      </Toolbar>

      {/* MENU DE CUENTA */}
      <Menu
        anchorEl={anchorElAccount}
        open={openAccount}
        onClose={handleAccountClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          elevation: 4,
          sx: { borderRadius: 2, mt: 1 },
        }}
      >
        <MenuItem onClick={() => { handleAccountClose(); navigate("/profile"); }}>
          Perfil
        </MenuItem>
        {role === "admin" && (
          <MenuItem onClick={() => { handleAccountClose(); navigate("/admin"); }}>
            Panel Admin
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
      </Menu>

      {/* MENU MOBILE */}
      <Menu
        anchorEl={anchorElMobile}
        open={openMobile}
        onClose={handleMobileClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          elevation: 4,
          sx: { borderRadius: 2, mt: 1, minWidth: 180 },
        }}
      >
        {user ? (
          <>
            <MenuItem onClick={() => { handleMobileClose(); navigate("/dashboard"); }}>
              Dashboard
            </MenuItem>
            <MenuItem onClick={() => { handleMobileClose(); navigate("/profile"); }}>
              Perfil
            </MenuItem>
            {role === "admin" && (
              <MenuItem onClick={() => { handleMobileClose(); navigate("/admin"); }}>
                Panel Admin
              </MenuItem>
            )}
            <Divider />
            <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
          </>
        ) : (
          <>
            <MenuItem onClick={() => { handleMobileClose(); navigate("/login"); }}>
              Iniciar sesión
            </MenuItem>
            <MenuItem onClick={() => { handleMobileClose(); navigate("/register"); }}>
              Registrarse
            </MenuItem>
          </>
        )}
      </Menu>
    </AppBar>
  );
};

export default Navbar;
