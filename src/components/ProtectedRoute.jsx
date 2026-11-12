import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logo } from "./Logo";

export function ProtectedRoute() {
  const { autenticado, verificando } = useAuth();
  const location = useLocation();

  if (verificando) {
    return (
      <div className="boot">
        <div className="row"><Logo /> <span className="spinner" /></div>
      </div>
    );
  }
  if (!autenticado) return <Navigate to="/entrar" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
