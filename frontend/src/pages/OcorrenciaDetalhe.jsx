import { Link, useLocation, useParams } from "react-router-dom";
import { useData } from "../context/data";
import { OcorrenciaAcompanhamento } from "../components/OcorrenciaAcompanhamento";
import { PageHeader } from "../components/PageHeader";
import { Badge } from "../components/Badge";
import { statusVariant } from "../components/badgeVariants";
import { Avatar } from "../components/Avatar";
import { Icon } from "../components/Icons";
import { ErroCarga, TableSkeleton } from "../components/Loading";
import { ICONE_TIPO } from "../data/constants";
import { dataBR } from "../lib/format";

export function OcorrenciaDetalhe() {
  const { id } = useParams();
  const { state } = useLocation();
  const origem = state?.origem || "/ocorrencias";
  const voltar = { to: origem, label: origem.startsWith("/alertas") ? "Alertas" : origem.startsWith("/historico") ? "Histórico" : "Ocorrências" };
  const { getOcorrencia, getVeiculo, getMotorista, carregando, falhas, recarregar } = useData();

  if (carregando) return <><PageHeader titulo="Ocorrência" voltar={voltar} /><div className="card"><TableSkeleton linhas={5} /></div></>;

  if (falhas.includes("ocorrencias")) {
    return <><PageHeader titulo="Ocorrência" voltar={voltar} /><ErroCarga mensagem="Não foi possível carregar a ocorrência." onTentar={recarregar} /></>;
  }

  const o = getOcorrencia(id);
  if (!o) {
    return <PageHeader titulo="Ocorrência não encontrada" voltar={voltar} sub="Confira se o registro ainda está na lista." />;
  }

  const veiculo = getVeiculo(o.veiculoId);
  const motorista = o.motoristaId ? getMotorista(o.motoristaId) : null;

  return (
    <>
      <PageHeader titulo={o.titulo} sub={`${o.tipo} · ${dataBR(o.data)}`} voltar={voltar}>
        <Link className="btn btn-outline" to={`/ocorrencias/${o.id}/editar`} state={{ origem }}>
          <Icon name="edit" size={17} /> Editar
        </Link>
      </PageHeader>

      <div className="detail">
        <div className="card card-pad">
          <div className="card-head">
            <h2 className="card-title">Descrição</h2>
            <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
          </div>
          <p className="desc-box">{o.descricao}</p>
        </div>

        <div className="card card-pad">
          <h2 className="card-title detail-heading">Detalhes</h2>
          <dl className="dl">
            <dt>Tipo</dt>
            <dd className="row" style={{ gap: "0.5rem" }}>
              <span className={"type-ico " + o.tipo} style={{ width: 30, height: 30 }}><Icon name={ICONE_TIPO[o.tipo] || "inbox"} size={16} /></span>
              {o.tipo}
            </dd>
            <dt>Data</dt><dd>{dataBR(o.data)}</dd>
            <dt>Veículo</dt>
            <dd>
              {veiculo ? <><Link className="plate table-record" to={`/veiculos/${veiculo.id}/editar`}>{veiculo.placa}</Link><div className="muted" style={{ fontSize: "0.85rem", marginTop: 4 }}>{veiculo.marca} {veiculo.modelo}</div></> : "—"}
            </dd>
            <dt>Motorista</dt>
            <dd>
              {motorista ? <span className="row" style={{ gap: "0.55rem" }}><Avatar nome={motorista.nome} small />{motorista.nome}</span> : <span className="muted">{o.motoristaId ? "Motorista indisponível" : "Não informado"}</span>}
            </dd>
          </dl>
        </div>
      </div>
      <OcorrenciaAcompanhamento key={o.id} id={o.id} />
    </>
  );
}
