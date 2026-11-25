import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth";
import { DataProvider } from "../context/DataContext";
import { Logo } from "./Logo";

export function ProtectedRoute() {
  const { usuario, autenticado, verificando } = useAuth();
  const location = useLocation();

  if (verificando) {
    return (
      <div className="boot" aria-busy="true" aria-label="Verificando sessão">
        <div className="row"><Logo /> <span className="spinner" /></div>
      </div>
    );
  }
  if (!autenticado) return <Navigate to="/entrar" replace state={{ from: location.pathname + location.search }} />;
  return <DataProvider key={usuario.id}><Outlet /></DataProvider>;
}
