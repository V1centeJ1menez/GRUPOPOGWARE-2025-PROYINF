import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

export const ThemeModeContext = createContext({ mode: "light", toggleColorMode: () => {} });

function getInitialMode() {
  if (typeof window === "undefined") return "light";
  const saved = window.localStorage.getItem("color-mode");
  if (saved === "light" || saved === "dark") return saved;
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(getInitialMode);

  useEffect(() => {
    try {
      window.localStorage.setItem("color-mode", mode);
    } catch {}
  }, [mode]);

  const toggleColorMode = useCallback(() => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode]
  );

  const contextValue = useMemo(() => ({ mode, toggleColorMode }), [mode, toggleColorMode]);

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export default ThemeModeProvider;
