import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { Icon } from "./Icons";
import { Avatar } from "./Avatar";
import { useAuth } from "../context/AuthContext";

const SECOES = [
  {
    titulo: "Operação",
    links: [
      { to: "/", label: "Visão geral", icon: "home", end: true },
      { to: "/veiculos", label: "Veículos", icon: "truck" },
      { to: "/motoristas", label: "Motoristas", icon: "users" },
      { to: "/ocorrencias", label: "Ocorrências", icon: "alert" },
    ],
  },
  {
    titulo: "Análises",
    links: [
      { to: "/dashboard", label: "Dashboard", icon: "chart" },
      { to: "/historico", label: "Histórico", icon: "history" },
    ],
  },
];

const hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

export function Layout() {
  const [aberto, setAberto] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, sair, modo } = useAuth();

  const fechar = () => setAberto(false);
  const atual = SECOES.flatMap((s) => s.links)
    .filter((l) => (l.end ? location.pathname === l.to : location.pathname.startsWith(l.to)))
    .pop();

  function handleSair() {
    sair();
    navigate("/entrar");
  }

  return (
    <div className="app-shell">
      <aside className={"sidebar" + (aberto ? " open" : "")}>
        <div className="sidebar-brand">
          <Logo />
        </div>
        <nav className="sidebar-nav" aria-label="Principal">
          {SECOES.map((s) => (
            <div key={s.titulo}>
              <div className="nav-label">{s.titulo}</div>
              {s.links.map((l) => (
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
            </div>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="side-user">
            <Avatar nome={usuario?.nome} />
            <div className="side-user-info">
              <span className="side-user-name">{usuario?.nome}</span>
              <span className="side-user-mail">{usuario?.email}</span>
            </div>
            <button className="side-logout" onClick={handleSair} title="Sair" aria-label="Sair">
              <Icon name="logout" size={17} />
            </button>
          </div>
        </div>
      </aside>

      {aberto && <button className="sidebar-backdrop" aria-hidden="true" tabIndex={-1} onClick={fechar} />}

      <div className="content">
        <header className="topbar">
          <button className="menu-btn" aria-label="Abrir menu" onClick={() => setAberto((o) => !o)}>
            <Icon name="menu" size={20} />
          </button>
          <span className="topbar-title">{atual?.label || "TransLog"}</span>
          <span className="topbar-spacer" />
          <span className="topbar-date">{hoje}</span>
          {modo === "demo" ? (
            <span className="pill" title="Os dados ficam só neste navegador">Modo demo</span>
          ) : (
            <span className="pill pill-ok">API conectada</span>
          )}
        </header>
        <main className="app-main" key={location.pathname}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
