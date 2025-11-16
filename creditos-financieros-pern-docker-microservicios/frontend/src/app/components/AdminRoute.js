import { useContext, useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../features/auth/authContext";

function getRoleFromToken(token) {
  try {
    const [, payload] = token.split(".");
    const data = JSON.parse(atob(payload));
    return data.role;
  } catch {
    return null;
  }
}

const AdminRoute = ({ children }) => {
  const { user, hydrating } = useContext(AuthContext);
  const location = useLocation();
  const role = useMemo(() => (user?.token ? getRoleFromToken(user.token) : null), [user?.token]);

  if (hydrating) {
    return <div style={{ padding: 24, textAlign: 'center', color: '#6c757d' }}>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
