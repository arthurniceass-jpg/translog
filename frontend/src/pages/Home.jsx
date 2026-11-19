import { Link } from "react-router-dom";
import { useData } from "../context/data";
import { Badge } from "../components/Badge";
import { statusVariant } from "../components/badgeVariants";
import { Icon } from "../components/Icons";
import { CardsSkeleton, ErroCarga, TableSkeleton } from "../components/Loading";
import { EmptyState } from "../components/EmptyState";
import { AlertList } from "../components/AlertList";
import { AgendaFrota } from "../components/AgendaFrota";
import { useRelogioFrota } from "../hooks/useRelogioFrota";
import { alertasDaFrota } from "../lib/operacao";
import { PageHeader } from "../components/PageHeader";
import { STATUS_VEICULO } from "../data/constants";
import { contarPor, dataBR } from "../lib/format";

const FROTA_CORES = {
  "Disponível": "var(--primary)",
  "Em uso": "#8799b3",
  "Manutenção": "#bd822d",
};

export function Home() {
  const dados = useData();
  const { veiculos, motoristas, ocorrencias, carregando, erro, recarregar, falhas } = dados;
  const agora = useRelogioFrota();
  const alertas = alertasDaFrota(dados, agora);
  const alertasParciais = ["manutencoes", "viagens", "documentos", "acompanhamentos", "ocorrencias"].some((r) => falhas.includes(r));
  const frota = contarPor(veiculos, "status");
  const pendentes = ocorrencias.filter((o) => o.status !== "Resolvida").length;
  const recentes = [...ocorrencias].sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id).slice(0, 5);
  const placas = new Map(veiculos.map((v) => [String(v.id), v.placa]));
  const frotaIndisponivel = falhas.includes("veiculos");
  const ocorrenciasIndisponiveis = falhas.includes("ocorrencias");

  const indicadores = [
    { label: "Veículos na frota", valor: veiculos.length, to: "/veiculos", indisponivel: frotaIndisponivel },
    { label: "Veículos disponíveis", valor: frota["Disponível"] || 0, to: "/veiculos?status=Dispon%C3%ADvel", indisponivel: frotaIndisponivel },
    { label: "Motoristas cadastrados", valor: motoristas.length, to: "/motoristas", indisponivel: falhas.includes("motoristas") },
    { label: "Ocorrências pendentes", valor: pendentes, to: "/ocorrencias?status=pendentes", destaque: pendentes > 0, indisponivel: ocorrenciasIndisponiveis },
  ];

  return (
    <>
      <PageHeader titulo="Visão geral" sub="Disponibilidade da frota e últimos registros da operação.">
        <Link to="/ocorrencias/nova" className="btn btn-primary"><Icon name="plus" size={18} /> Registrar ocorrência</Link>
      </PageHeader>

      {erro && <ErroCarga mensagem={erro} onTentar={recarregar} />}

      {carregando ? <CardsSkeleton /> : (
        <>
          <div className="stats-grid">
            {indicadores.map(({ label, valor, to, destaque, indisponivel }) => (
              <Link key={label} to={to} className="stat">
                <span className="stat-label">{label}<Icon name="arrow" size={14} /></span>
                <strong className={destaque && !indisponivel ? "stat-value stat-attention" : "stat-value"}>
                  {indisponivel ? <span aria-label="Indisponível">—</span> : valor}
                </strong>
              </Link>
            ))}
          </div>

          <div className="overview-grid">
            <section className="card overview-panel">
              <div className="card-head">
                <h2 className="card-title">Pendências da operação</h2>
                <Link to="/alertas" className="link-more">Ver alertas <Icon name="arrow" size={15} /></Link>
              </div>
              {alertasParciais && <p className="panel-message">Alguns módulos estão indisponíveis. A fila pode estar incompleta.</p>}
              {dados.carregandoOperacao ? <TableSkeleton linhas={3} /> : <AlertList alertas={alertas.slice(0, 4)} />}
            </section>
            <AgendaFrota dados={dados} agora={agora} />
          </div>

          <div className="overview-grid">
            <section className="card overview-panel" aria-labelledby="ocorrencias-recentes">
              <div className="card-head">
                <h2 className="card-title" id="ocorrencias-recentes">Ocorrências recentes</h2>
                <Link to="/ocorrencias" className="link-more" aria-label="Ver todas as ocorrências">Ver todas <Icon name="arrow" size={15} /></Link>
              </div>
              {ocorrenciasIndisponiveis ? <p className="panel-message">Ocorrências indisponíveis.</p> : recentes.length === 0 ? (
                <EmptyState icon="inbox" titulo="Sem ocorrências registradas" texto="Os novos registros aparecem aqui." />
              ) : (
                <ul className="overview-events">
                  {recentes.map((o) => (
                    <li key={o.id}>
                      <Link to={`/ocorrencias/${o.id}`} className="list-item">
                        <div className="grow">
                          <strong>{o.titulo}</strong>
                          <small>{[o.tipo, placas.get(String(o.veiculoId)), dataBR(o.data)].filter(Boolean).join(" · ")}</small>
                        </div>
                        <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
                        <Icon name="arrow" size={15} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card overview-panel fleet-panel" aria-labelledby="composicao-frota">
              <div className="card-head">
                <h2 className="card-title" id="composicao-frota">Situação da frota</h2>
                <Link to="/veiculos" className="link-more">Ver frota <Icon name="arrow" size={15} /></Link>
              </div>
              {frotaIndisponivel ? <p className="panel-message">Dados da frota indisponíveis.</p> : (
                <div className="fleet-body">
                  <p className="fleet-total"><strong>{veiculos.length}</strong> {veiculos.length === 1 ? "veículo" : "veículos"}</p>
                  <div className="fleet-track" aria-hidden="true">
                    {STATUS_VEICULO.filter((status) => frota[status]).map((status) => (
                      <span key={status} style={{ flexGrow: frota[status], background: FROTA_CORES[status] }} />
                    ))}
                  </div>
                  <dl className="fleet-legend">
                    {STATUS_VEICULO.map((status) => (
                      <div key={status}>
                        <dt><span aria-hidden="true" style={{ background: FROTA_CORES[status] }} />{status}</dt>
                        <dd>{frota[status] || 0}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </>
  );
}
