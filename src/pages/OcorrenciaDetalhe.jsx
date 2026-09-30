import { useNavigate, useParams } from "react-router-dom";
import { useData } from "../context/DataContext";
import { Badge, statusVariant } from "../components/Badge";

export function OcorrenciaDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOcorrencia, getVeiculo, getMotorista } = useData();

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
  const dataFmt = new Date(o.data + "T00:00:00").toLocaleDateString("pt-BR");

  return (
    <>
      <div className="page-head">
        <div>
          <span className="kicker">Ocorrência</span>
          <h1 className="page-title">{o.titulo}</h1>
          <p className="page-sub">{o.tipo} · {dataFmt}</p>
        </div>
        <div className="row">
          <button className="btn btn-outline" onClick={() => navigate(`/ocorrencias/${o.id}/editar`)}>Editar</button>
          <button className="btn btn-ghost" onClick={() => navigate("/ocorrencias")}>Voltar</button>
        </div>
      </div>

      <div className="card card-pad">
        <div className="row" style={{ marginBottom: "1rem" }}>
          <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
        </div>

        <dl style={{ display: "grid", gridTemplateColumns: "160px 1fr", rowGap: "0.75rem", columnGap: "1rem" }}>
          <dt className="muted">Tipo</dt><dd>{o.tipo}</dd>
          <dt className="muted">Data</dt><dd>{dataFmt}</dd>
          <dt className="muted">Veículo</dt><dd>{veiculo ? `${veiculo.placa} — ${veiculo.marca} ${veiculo.modelo}` : "—"}</dd>
          <dt className="muted">Motorista</dt><dd>{motorista ? motorista.nome : "Não informado"}</dd>
          <dt className="muted">Descrição</dt><dd>{o.descricao}</dd>
        </dl>
      </div>
    </>
  );
}
