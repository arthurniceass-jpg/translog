import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { Icon } from "./Icons";
import { Avatar } from "./Avatar";
import { useAuth } from "../context/auth";

const SECOES = [
  {
    titulo: "Operação",
    links: [
      { to: "/", label: "Visão geral", icon: "home", end: true },
      { to: "/veiculos", label: "Veículos", icon: "truck" },
      { to: "/motoristas", label: "Motoristas", icon: "users" },
      { to: "/ocorrencias", label: "Ocorrências", icon: "alert" },
      { to: "/viagens", label: "Viagens", icon: "pin" },
      { to: "/manutencoes", label: "Manutenções", icon: "tool" },
      { to: "/alertas", label: "Alertas", icon: "bell" },
    ],
  },
  {
    titulo: "Análises",
    links: [
      { to: "/custos", label: "Custos", icon: "wallet" },
      { to: "/dashboard", label: "Dashboard", icon: "chart" },
      { to: "/historico", label: "Histórico", icon: "history" },
    ],
  },
];

export function Layout() {
  const [aberto, setAberto] = useState(false);
  const caminhoAnterior = useRef(null);
  const menuRef = useRef(null);
  const fecharRef = useRef(null);
  const mainRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, sair, modo } = useAuth();

  const [hoje] = useState(() => new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" }));

  useEffect(() => {
    if (!aberto) return;

    const quadro = requestAnimationFrame(() => fecharRef.current?.focus());
    const desktop = window.matchMedia("(min-width: 901px)");
    const fecharAoAmpliar = (evento) => {
      if (evento.matches) setAberto(false);
    };
    desktop.addEventListener("change", fecharAoAmpliar);
    return () => {
      cancelAnimationFrame(quadro);
      desktop.removeEventListener("change", fecharAoAmpliar);
    };
  }, [aberto]);

  useEffect(() => {
    const anterior = caminhoAnterior.current;
    caminhoAnterior.current = location.pathname;
    if (anterior && anterior !== location.pathname) {
      window.scrollTo({ top: 0, behavior: "instant" });
      mainRef.current?.focus({ preventScroll: true });
    }
  }, [location.pathname]);

  function fechar(destino = menuRef) {
    setAberto(false);
    if (aberto) requestAnimationFrame(() => destino.current?.focus());
  }

  const atual = SECOES.flatMap((s) => s.links)
    .filter((l) => (l.end ? location.pathname === l.to : location.pathname.startsWith(l.to)))
    .pop();

  function handleSair() {
    setAberto(false);
    sair();
    navigate("/entrar");
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#conteudo" tabIndex={aberto ? -1 : undefined} onClick={(e) => { e.preventDefault(); mainRef.current?.focus(); }}>
        Ir para o conteúdo
      </a>
      <aside
        id="menu-principal"
        className={"sidebar" + (aberto ? " open" : "")}
        role={aberto ? "dialog" : undefined}
        aria-modal={aberto || undefined}
        aria-label={aberto ? "Menu de navegação" : undefined}
        onKeyDown={(e) => {
          if (!aberto) return;
          if (e.key === "Escape") fechar();
          if (e.key === "Tab") {
            const focaveis = e.currentTarget.querySelectorAll("a[href], button");
            const primeiro = focaveis[0];
            const ultimo = focaveis[focaveis.length - 1];
            if (e.shiftKey && document.activeElement === primeiro) {
              e.preventDefault();
              ultimo.focus();
            } else if (!e.shiftKey && document.activeElement === ultimo) {
              e.preventDefault();
              primeiro.focus();
            }
          }
        }}
      >
        <div className="sidebar-brand">
          <Link to="/" onClick={() => fechar(mainRef)} aria-label="TransLog, visão geral"><Logo /></Link>
          <button ref={fecharRef} type="button" className="sidebar-close" aria-label="Fechar menu" onClick={() => fechar()}>
            <Icon name="x" size={20} />
          </button>
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
                  onClick={() => fechar(mainRef)}
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

      {aberto && <button className="sidebar-backdrop" aria-hidden="true" tabIndex={-1} onClick={() => fechar()} />}

      <div className="content" inert={aberto}>
        <header className="topbar">
          <button ref={menuRef} type="button" className="menu-btn" aria-label="Abrir menu" aria-expanded={aberto} aria-controls="menu-principal" onClick={() => setAberto(true)}>
            <Icon name="menu" size={20} />
          </button>
          <span className="topbar-title">{atual?.label || (location.pathname === "/documentos" ? "Documentos" : "TransLog")}</span>
          <span className="topbar-spacer" />
          <span className="topbar-date"><Icon name="calendar" size={15} /> {hoje}</span>
          {modo === "demo" ? (
            <span className="pill" title="Os dados ficam só neste navegador">Modo demo</span>
          ) : (
            <span className="pill">Modo API</span>
          )}
        </header>
        <main className="app-main" id="conteudo" ref={mainRef} tabIndex={-1}>
          <div className="app-main-inner" key={location.pathname}><Outlet /></div>
        </main>
      </div>
    </div>
  );
}
