import { useNavigate, useParams } from "react-router-dom";
import { useData } from "../context/DataContext";
import { PageHeader } from "../components/PageHeader";
import { Badge, statusVariant } from "../components/Badge";
import { Icon } from "../components/Icons";
import { TableSkeleton } from "../components/Loading";
import { OcorrenciasVinculadas } from "../components/OcorrenciasVinculadas";

export function VeiculoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getVeiculo, ocorrencias, carregando } = useData();

  if (carregando) return <div className="card"><TableSkeleton linhas={5} /></div>;

  const v = getVeiculo(id);
  if (!v) {
    return (
      <div className="card card-pad">
        <p>Veículo não encontrado.</p>
        <button className="btn btn-outline mt" onClick={() => navigate("/veiculos")}>Voltar</button>
      </div>
    );
  }

  const doVeiculo = ocorrencias.filter((o) => String(o.veiculoId) === String(v.id));
  const abertas = doVeiculo.filter((o) => o.status !== "Resolvida").length;

  return (
    <>
      <PageHeader titulo={`${v.marca} ${v.modelo}`} sub={`Placa ${v.placa} · ano ${v.ano}`} voltar={{ to: "/veiculos", label: "Veículos" }}>
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
            <dt>Status</dt><dd><Badge variant={statusVariant(v.status)}>{v.status}</Badge></dd>
          </dl>
        </div>
      </div>
    </>
  );
}
