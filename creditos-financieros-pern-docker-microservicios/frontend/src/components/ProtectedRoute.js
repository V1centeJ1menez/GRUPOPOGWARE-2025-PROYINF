import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, hydrating } = useContext(AuthContext);
  const location = useLocation();
  if (hydrating) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#6c757d' }}>
        Cargando...
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace state={{ from: location }} />;
};

export default ProtectedRoute;
