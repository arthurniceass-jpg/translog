import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useData } from "../context/data";
import { dinheiro, numero, STATUS_MANUTENCAO } from "../lib/operacao";
import { PageHeader } from "../components/PageHeader";
import { Badge } from "../components/Badge";
import { statusVariant } from "../components/badgeVariants";
import { Icon } from "../components/Icons";
import { dataBR } from "../lib/format";
import { ErroCarga, TableSkeleton } from "../components/Loading";
import { OcorrenciasVinculadas } from "../components/OcorrenciasVinculadas";

export function VeiculoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const origem = state?.origem || "/veiculos";
  const { getVeiculo, ocorrencias, carregando, manutencoes, carregandoOperacao, falhas, recarregar } = useData();

  if (carregando) return <div className="card"><TableSkeleton linhas={5} /></div>;

  if (falhas.includes("veiculos")) return <ErroCarga mensagem="Não foi possível carregar o veículo." onTentar={recarregar} />;

  const v = getVeiculo(id);
  if (!v) {
    return (
      <div className="card card-pad">
        <p>Veículo não encontrado.</p>
        <button className="btn btn-outline mt" onClick={() => navigate(origem)}>Voltar</button>
      </div>
    );
  }

  const doVeiculo = ocorrencias.filter((o) => String(o.veiculoId) === String(v.id));
  const servicos = manutencoes.filter((m) => m.veiculoId === v.id);
  const abertas = doVeiculo.filter((o) => o.status !== "Resolvida").length;

  return (
    <>
      <PageHeader titulo={`${v.marca} ${v.modelo}`} sub={`Placa ${v.placa} · ano ${v.ano}`} voltar={{ to: origem, label: "Veículos" }}>
        <button className="btn btn-outline" onClick={() => navigate(`/veiculos/${v.id}/editar`)}>
          <Icon name="edit" size={17} /> Editar
        </button>
      </PageHeader>

      <div className="detail">
        <div className="card">
          <div className="card-head card-pad">
            <h2 className="card-title">Ocorrências do veículo</h2>
            <span className="muted">{doVeiculo.length} no total · {abertas} em aberto</span>
          </div>
          <OcorrenciasVinculadas ocorrencias={doVeiculo} />
        </div>

        <div className="card card-pad">
          <h2 className="card-title" style={{ marginBottom: "1.1rem" }}>Dados do veículo</h2>
          <dl className="dl">
            <dt>Placa</dt><dd><span className="plate">{v.placa}</span></dd>
            <dt>Marca</dt><dd>{v.marca}</dd>
            <dt>Modelo</dt><dd>{v.modelo}</dd>
            <dt>Ano</dt><dd>{v.ano}</dd>
            <dt>Quilometragem</dt><dd>{v.quilometragem == null ? "—" : `${numero.format(v.quilometragem)} km`}</dd>
            <dt>Status</dt><dd><Badge variant={statusVariant(v.status)}>{v.status}</Badge></dd>
          </dl>
        </div>
      </div>

      <section className="card overview-panel mt">
        <div className="card-head">
          <h2 className="card-title">Manutenções do veículo</h2>
          <Link className="link-more" to={`/manutencoes?q=${encodeURIComponent(v.placa)}`}>Ver serviços <Icon name="arrow" size={15} /></Link>
        </div>
        {carregandoOperacao ? <TableSkeleton linhas={3} /> : falhas.includes("manutencoes")
          ? <p className="panel-message">Histórico de manutenções indisponível.</p>
          : servicos.length === 0 ? <p className="panel-message">Nenhuma manutenção registrada para esta placa.</p> : (
            <ul className="overview-events">
              {servicos.slice(0, 5).map((item) => (
                <li key={item.id}>
                  <Link className="list-item" to={`/manutencoes?editar=${item.id}`}>
                    <div className="grow">
                      <strong>{item.descricao}</strong>
                      <small>{[STATUS_MANUTENCAO[item.status], item.concluidaEm && dataBR(item.concluidaEm), item.custo != null && dinheiro.format(item.custo)].filter(Boolean).join(" · ")}</small>
                    </div>
                    <Icon name="arrow" size={15} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
      </section>
    </>
  );
}
