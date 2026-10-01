import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { Logo } from "./Logo";
import { Icon } from "./Icons";
import { useAuth } from "../context/AuthContext";

const LINKS = [
  { to: "/", label: "Início", icon: "home", end: true },
  { to: "/veiculos", label: "Veículos", icon: "truck" },
  { to: "/motoristas", label: "Motoristas", icon: "users" },
  { to: "/ocorrencias", label: "Ocorrências", icon: "alert" },
  { to: "/dashboard", label: "Dashboard", icon: "chart" },
  { to: "/historico", label: "Histórico", icon: "history" },
];

export function Layout() {
  const [aberto, setAberto] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, sair } = useAuth();

  // fecha o menu mobile ao trocar de rota
  const fechar = () => setAberto(false);

  function handleSair() {
    sair();
    navigate("/entrar");
  }

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className={"sidebar" + (aberto ? " open" : "")}>
        <div className="sidebar-brand">
          <Logo />
        </div>
        <nav className="sidebar-nav">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={fechar}
              className={({ isActive }) => "side-link" + (isActive ? " active" : "")}
            >
              <span className="side-ico"><Icon name={l.icon} size={19} /></span>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          {usuario ? (
            <div className="side-user">
              <div className="side-user-info">
                <span className="side-user-name">{usuario.nome}</span>
                <span className="side-user-mail">{usuario.email}</span>
              </div>
              <button className="side-logout" onClick={handleSair} title="Sair">
                <Icon name="logout" size={18} />
              </button>
            </div>
          ) : (
            <Link to="/entrar" className="side-login-link">
              <Icon name="login" size={18} /> Entrar
            </Link>
          )}
        </div>
      </aside>

      {/* backdrop do menu mobile */}
      {aberto && <button className="sidebar-backdrop" aria-hidden="true" tabIndex={-1} onClick={fechar} />}

      {/* Conteúdo */}
      <div className="content">
        <header className="topbar">
          <button className="menu-btn" aria-label="Abrir menu" onClick={() => setAberto((o) => !o)}>☰</button>
          <span className="topbar-title">Sistema de Gestão de Transporte</span>
        </header>
        <main className="app-main" key={location.pathname}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
