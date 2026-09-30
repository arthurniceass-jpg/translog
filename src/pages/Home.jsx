import { Link } from "react-router-dom";
import { useData } from "../context/DataContext";

export function Home() {
  const { veiculos, motoristas, ocorrencias } = useData();
  const ocorrenciasAbertas = ocorrencias.filter((o) => o.status === "Aberta").length;

  return (
    <>
      <div className="page-head">
        <div>
          <span className="kicker">Sistema de Gestão de Transporte</span>
          <h1 className="page-title">Bem-vindo ao TransLog</h1>
          <p className="page-sub">
            Centralize o controle da frota: cadastre veículos e motoristas e
            acompanhe as ocorrências da operação em um só lugar.
          </p>
        </div>
        <Link to="/veiculos" className="btn btn-primary">Gerenciar veículos</Link>
      </div>

      {/* Indicadores rápidos (calculados dos dados locais) */}
      <div className="stats-grid">
        <Link to="/veiculos" className="card stat">
          <div className="stat-label">Veículos cadastrados</div>
          <div className="stat-value">{veiculos.length}</div>
        </Link>
        <Link to="/motoristas" className="card stat">
          <div className="stat-label">Motoristas cadastrados</div>
          <div className="stat-value">{motoristas.length}</div>
        </Link>
        <Link to="/ocorrencias" className="card stat">
          <div className="stat-label">Ocorrências abertas</div>
          <div className="stat-value" style={{ color: ocorrenciasAbertas > 0 ? "var(--danger)" : "var(--success)" }}>
            {ocorrenciasAbertas}
          </div>
        </Link>
      </div>

      <div className="card card-pad mt">
        <h2 style={{ marginBottom: "0.5rem" }}>O que dá pra fazer</h2>
        <ul style={{ color: "var(--muted)", lineHeight: 2, paddingLeft: "1.2rem" }}>
          <li><strong>Veículos</strong> — cadastrar, editar, buscar e acompanhar o status da frota.</li>
          <li><strong>Motoristas</strong> — gerenciar condutores, CNH e disponibilidade.</li>
          <li><strong>Ocorrências</strong> — registrar acidentes, manutenções e atrasos com filtros.</li>
          <li><strong>Dashboard</strong> — visão geral com indicadores da operação.</li>
          <li><strong>Histórico</strong> — consulta de ocorrências com filtros por status, tipo e período.</li>
        </ul>
      </div>
    </>
  );
}
