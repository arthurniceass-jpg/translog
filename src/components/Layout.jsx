import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import { Icon } from "./Icons";

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

  // fecha o menu mobile ao trocar de rota
  const fechar = () => setAberto(false);

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
        <div className="sidebar-foot">TransLog · AV1</div>
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
