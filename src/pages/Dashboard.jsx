import { useData } from "../context/DataContext";
import { Badge, statusVariant } from "../components/Badge";

// Conta ocorrências de uma lista por chave (status/tipo)
function contarPor(lista, chave) {
  return lista.reduce((acc, item) => {
    acc[item[chave]] = (acc[item[chave]] || 0) + 1;
    return acc;
  }, {});
}

function Distribuicao({ titulo, dados, total }) {
  const chaves = Object.keys(dados);
  return (
    <div className="card card-pad">
      <h2 style={{ fontSize: "1.05rem", marginBottom: "1rem" }}>{titulo}</h2>
      {chaves.length === 0 ? (
        <p className="muted">Sem dados.</p>
      ) : (
        <div style={{ display: "grid", gap: "0.85rem" }}>
          {chaves.map((k) => {
            const pct = total ? Math.round((dados[k] / total) * 100) : 0;
            return (
              <div key={k}>
                <div className="row" style={{ justifyContent: "space-between", marginBottom: "0.3rem" }}>
                  <Badge variant={statusVariant(k)}>{k}</Badge>
                  <span className="muted" style={{ fontSize: "0.85rem" }}>{dados[k]} ({pct}%)</span>
                </div>
                <div style={{ height: 8, background: "var(--surface-2)", borderRadius: 999 }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: "var(--primary)", borderRadius: 999 }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Dashboard() {
  const { veiculos, motoristas, ocorrencias } = useData();

  const abertas = ocorrencias.filter((o) => o.status === "Aberta").length;
  const disponiveis = veiculos.filter((v) => v.status === "Disponível").length;

  return (
    <>
      <div className="page-head">
        <div>
          <span className="kicker">Visão geral</span>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Indicadores da operação calculados a partir dos dados.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="card stat">
          <div className="stat-label">Veículos</div>
          <div className="stat-value">{veiculos.length}</div>
        </div>
        <div className="card stat">
          <div className="stat-label">Veículos disponíveis</div>
          <div className="stat-value" style={{ color: "var(--success)" }}>{disponiveis}</div>
        </div>
        <div className="card stat">
          <div className="stat-label">Motoristas</div>
          <div className="stat-value">{motoristas.length}</div>
        </div>
        <div className="card stat">
          <div className="stat-label">Ocorrências abertas</div>
          <div className="stat-value" style={{ color: abertas > 0 ? "var(--danger)" : "var(--success)" }}>{abertas}</div>
        </div>
      </div>

      <div className="stats-grid mt">
        <Distribuicao titulo="Veículos por status" dados={contarPor(veiculos, "status")} total={veiculos.length} />
        <Distribuicao titulo="Motoristas por status" dados={contarPor(motoristas, "status")} total={motoristas.length} />
        <Distribuicao titulo="Ocorrências por tipo" dados={contarPor(ocorrencias, "tipo")} total={ocorrencias.length} />
        <Distribuicao titulo="Ocorrências por status" dados={contarPor(ocorrencias, "status")} total={ocorrencias.length} />
      </div>
    </>
  );
}
