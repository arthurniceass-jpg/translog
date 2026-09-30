import { NavLink, Outlet } from "react-router-dom";

const LINKS = [
  { to: "/", label: "Início", end: true },
  { to: "/veiculos", label: "Veículos" },
  { to: "/motoristas", label: "Motoristas" },
  { to: "/ocorrencias", label: "Ocorrências" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/historico", label: "Histórico" },
];

export function Layout() {
  return (
    <>
      <header className="navbar">
        <div className="navbar-inner">
          <NavLink to="/" className="brand">
            <span className="brand-mark">🚚</span>
            <span>Trans<b>Log</b></span>
          </NavLink>
          <nav className="nav-links">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </>
  );
}
