import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppProviders from "./app/AppProviders";
import ProtectedRoute from "./app/components/ProtectedRoute";
import Navbar from "./app/components/Navbar";
import Landing from "./app/pages/Landing";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import RegisterSuccess from "./features/auth/pages/RegisterSuccess";
import Dashboard from "./app/pages/Dashboard";
import Simulacion from "./features/simulacion/pages/SimulacionPage";
import SimulacionDetalle from "./features/simulacion/pages/SimulacionDetalle";

function App() {
  return (
    <AppProviders>
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
    </AppProviders>
  );
}

export default App;
