import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeModeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterSuccess from "./pages/RegisterSuccess";
import Dashboard from "./pages/Dashboard";
import Simulacion from "./pages/Simulacion";
import SimulacionDetalle from "./pages/SimulacionDetalle";

function App() {
  return (
    <ThemeModeProvider>
      <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/success" element={<RegisterSuccess />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/simulacion"
            element={
              <ProtectedRoute>
                <Simulacion />
              </ProtectedRoute>
            }
          />
          <Route
            path="/simulacion/:id"
            element={
              <ProtectedRoute>
                <SimulacionDetalle />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </ThemeModeProvider>
  );
}

export default App;
