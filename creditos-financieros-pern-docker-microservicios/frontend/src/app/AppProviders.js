import React from "react";
import { AuthProvider } from "../features/auth/authContext";
import { ThemeModeProvider } from "./context/ThemeContext";

/**
 * AppProviders centraliza los providers globales (Auth, Theme, etc.)
 *
 * Orden recomendado: ThemeModeProvider (externo) -> AuthProvider (interno).
 * Razonamiento: el Theme es un contexto muy global que suelen consumir
 * componentes de presentación y 'providers' secundarios. Mantenerlo por
 * fuera evita que providers que dependan del tema queden sin acceso.
 */
export default function AppProviders({ children }) {
  return (
    <ThemeModeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeModeProvider>
  );
}