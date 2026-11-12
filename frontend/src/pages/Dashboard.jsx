import { Link } from "react-router-dom";
import { useData } from "../context/DataContext";
import { PageHeader } from "../components/PageHeader";
import { Icon } from "../components/Icons";
import { Donut, HBars, ColBars } from "../components/Charts";
import { CardsSkeleton, ErroCarga } from "../components/Loading";
import { contarPor } from "../lib/format";

/** Últimos 6 meses (incluindo o atual) com a contagem de ocorrências de cada um. */
function serieMensal(ocorrencias) {
  const hoje = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - (5 - i), 1);
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return {
      rotulo: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
      valor: ocorrencias.filter((o) => o.data.startsWith(chave)).length,
    };
  });
}

export function Dashboard() {
  const { veiculos, motoristas, ocorrencias, carregando, erro, recarregar } = useData();

  const abertas = ocorrencias.filter((o) => o.status !== "Resolvida").length;
  const resolvidas = ocorrencias.filter((o) => o.status === "Resolvida").length;
  const taxa = ocorrencias.length ? Math.round((resolvidas / ocorrencias.length) * 100) : 0;
  const emOperacao = veiculos.filter((v) => v.status === "Em uso").length;

  const porVeiculo = contarPor(
    ocorrencias.map((o) => ({ placa: veiculos.find((v) => String(v.id) === String(o.veiculoId))?.placa || "—" })),
    "placa",
  );
  const topVeiculos = Object.fromEntries(Object.entries(porVeiculo).sort((a, b) => b[1] - a[1]).slice(0, 5));

  return (
    <>
      <PageHeader titulo="Dashboard" sub="Indicadores da operação calculados a partir dos dados em tempo real." />

      {erro && <ErroCarga mensagem={erro} onTentar={recarregar} />}

      {carregando ? (
        <CardsSkeleton />
      ) : (
        <>
          <div className="stats-grid">
            <Link to="/veiculos" className="card stat">
              <span className="stat-ico blue"><Icon name="truck" size={22} /></span>
              <div><div className="stat-label">Veículos em operação</div><div className="stat-value">{emOperacao}<span className="stat-note"> / {veiculos.length}</span></div></div>
            </Link>
            <Link to="/motoristas" className="card stat">
              <span className="stat-ico blue"><Icon name="users" size={22} /></span>
              <div><div className="stat-label">Motoristas</div><div className="stat-value">{motoristas.length}</div></div>
            </Link>
            <Link to="/ocorrencias" className="card stat">
              <span className="stat-ico red"><Icon name="alert" size={22} /></span>
              <div><div className="stat-label">Ocorrências em aberto</div><div className="stat-value">{abertas}</div></div>
            </Link>
            <div className="card stat">
              <span className="stat-ico green"><Icon name="check" size={22} /></span>
              <div><div className="stat-label">Taxa de resolução</div><div className="stat-value">{taxa}%</div></div>
            </div>
          </div>

          <div className="grid-eq mt">
            <div className="card card-pad">
              <h2 className="card-title" style={{ marginBottom: "1.2rem" }}>Veículos por status</h2>
              <Donut dados={contarPor(veiculos, "status")} rotuloCentro="veículos" />
            </div>
            <div className="card card-pad">
              <h2 className="card-title" style={{ marginBottom: "1.2rem" }}>Motoristas por status</h2>
              <Donut dados={contarPor(motoristas, "status")} rotuloCentro="motoristas" />
            </div>
            <div className="card card-pad">
              <h2 className="card-title" style={{ marginBottom: "1.2rem" }}>Ocorrências por mês</h2>
              <ColBars serie={serieMensal(ocorrencias)} />
            </div>
            <div className="card card-pad">
              <h2 className="card-title" style={{ marginBottom: "1.2rem" }}>Ocorrências por tipo</h2>
              <HBars dados={contarPor(ocorrencias, "tipo")} />
            </div>
            <div className="card card-pad">
              <h2 className="card-title" style={{ marginBottom: "1.2rem" }}>Ocorrências por status</h2>
              <Donut dados={contarPor(ocorrencias, "status")} rotuloCentro="ocorrências" />
            </div>
            <div className="card card-pad">
              <h2 className="card-title" style={{ marginBottom: "1.2rem" }}>Veículos com mais ocorrências</h2>
              <HBars dados={topVeiculos} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
