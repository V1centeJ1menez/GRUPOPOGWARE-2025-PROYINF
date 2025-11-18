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
import SimularAnonPage from "./features/simulacion/pages/SimularAnonPage";
import NuevaSolicitud from "./features/solicitud/pages/NuevaSolicitud";
import SolicitudSuccess from "./features/solicitud/pages/SolicitudSuccess";
import AdminRoute from "./app/components/AdminRoute";
import AdminHome from "./features/admin/pages/AdminHome";
import AdminSolicitudes from "./features/solicitud/pages/AdminSolicitudes";
import SolicitudDetalle from "./features/solicitud/pages/SolicitudDetalle";

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
          {/* Simulación pública sin registro */}
          <Route path="/simular" element={<SimularAnonPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/* Continuación del flujo tras login con datos precargados */}
          <Route
            path="/solicitud/nueva"
            element={
              <ProtectedRoute>
                <NuevaSolicitud />
              </ProtectedRoute>
            }
          />
          <Route
            path="/solicitud/success"
            element={
              <ProtectedRoute>
                <SolicitudSuccess />
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
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminHome />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/solicitudes"
            element={
              <AdminRoute>
                <AdminSolicitudes />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/solicitudes/:id"
            element={
              <AdminRoute>
                <SolicitudDetalle />
              </AdminRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;
