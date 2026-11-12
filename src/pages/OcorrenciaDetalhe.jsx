import { useNavigate, useParams } from "react-router-dom";
import { useData } from "../context/DataContext";
import { PageHeader } from "../components/PageHeader";
import { Badge, statusVariant } from "../components/Badge";
import { Avatar } from "../components/Avatar";
import { Icon } from "../components/Icons";
import { TableSkeleton } from "../components/Loading";
import { ICONE_TIPO } from "../data/constants";
import { dataBR } from "../lib/format";

export function OcorrenciaDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOcorrencia, getVeiculo, getMotorista, carregando } = useData();

  if (carregando) return <div className="card"><TableSkeleton linhas={5} /></div>;

  const o = getOcorrencia(id);
  if (!o) {
    return (
      <div className="card card-pad">
        <p>Ocorrência não encontrada.</p>
        <button className="btn btn-outline mt" onClick={() => navigate("/ocorrencias")}>Voltar</button>
      </div>
    );
  }

  const veiculo = getVeiculo(o.veiculoId);
  const motorista = o.motoristaId ? getMotorista(o.motoristaId) : null;

  return (
    <>
      <PageHeader titulo={o.titulo} sub={`${o.tipo} · ${dataBR(o.data)}`} voltar={{ to: "/ocorrencias", label: "Ocorrências" }}>
        <button className="btn btn-outline" onClick={() => navigate(`/ocorrencias/${o.id}/editar`)}>
          <Icon name="edit" size={17} /> Editar
        </button>
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
          <h2 className="card-title" style={{ marginBottom: "1.1rem" }}>Detalhes</h2>
          <dl className="dl">
            <dt>Tipo</dt>
            <dd className="row" style={{ gap: "0.5rem" }}>
              <span className={"type-ico " + o.tipo} style={{ width: 30, height: 30 }}><Icon name={ICONE_TIPO[o.tipo] || "inbox"} size={16} /></span>
              {o.tipo}
            </dd>
            <dt>Data</dt><dd>{dataBR(o.data)}</dd>
            <dt>Veículo</dt>
            <dd>
              {veiculo ? <><span className="plate">{veiculo.placa}</span><div className="muted" style={{ fontSize: "0.85rem", marginTop: 4 }}>{veiculo.marca} {veiculo.modelo}</div></> : "—"}
            </dd>
            <dt>Motorista</dt>
            <dd>
              {motorista ? <span className="row" style={{ gap: "0.55rem" }}><Avatar nome={motorista.nome} small />{motorista.nome}</span> : <span className="muted">Não informado</span>}
            </dd>
          </dl>
        </div>
      </div>
    </>
  );
}
