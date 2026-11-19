import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useData } from "../context/data";
import { PageHeader } from "../components/PageHeader";
import { Badge } from "../components/Badge";
import { statusVariant } from "../components/badgeVariants";
import { Avatar } from "../components/Avatar";
import { Icon } from "../components/Icons";
import { ErroCarga, TableSkeleton } from "../components/Loading";
import { OcorrenciasVinculadas } from "../components/OcorrenciasVinculadas";
import { mascararCPF, mascararTelefone } from "../lib/format";

export function MotoristaDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const origem = state?.origem || "/motoristas";
  const { getMotorista, ocorrencias, carregando, falhas, recarregar } = useData();

  if (carregando) return <div className="card"><TableSkeleton linhas={5} /></div>;

  if (falhas.includes("motoristas")) return <ErroCarga mensagem="Não foi possível carregar o motorista." onTentar={recarregar} />;

  const m = getMotorista(id);
  if (!m) {
    return (
      <div className="card card-pad">
        <p>Motorista não encontrado.</p>
        <button className="btn btn-outline mt" onClick={() => navigate(origem)}>Voltar</button>
      </div>
    );
  }

  const doMotorista = ocorrencias.filter((o) => String(o.motoristaId) === String(m.id));
  const abertas = doMotorista.filter((o) => o.status !== "Resolvida").length;

  return (
    <>
      <PageHeader titulo={m.nome} sub={`CNH ${m.cnh} · categoria ${(m.categorias || []).join(", ") || "—"}`} voltar={{ to: origem, label: "Motoristas" }}>
        <button className="btn btn-outline" onClick={() => navigate(`/motoristas/${m.id}/editar`)}>
          <Icon name="edit" size={17} /> Editar
        </button>
      </PageHeader>

      <div className="detail">
        <div className="card">
          <div className="card-head card-pad">
            <h2 className="card-title">Ocorrências do motorista</h2>
            <span className="muted">{doMotorista.length} no total · {abertas} em aberto</span>
          </div>
          <OcorrenciasVinculadas ocorrencias={doMotorista} />
        </div>

        <div className="card card-pad">
          <div className="row" style={{ gap: "0.75rem", marginBottom: "1.1rem" }}>
            <Avatar nome={m.nome} />
            <h2 className="card-title">Dados do motorista</h2>
          </div>
          <dl className="dl">
            <dt>CPF</dt><dd className="mono">{mascararCPF(m.cpf)}</dd>
            <dt>CNH</dt><dd className="mono">{m.cnh}</dd>
            <dt>Categorias</dt><dd className="mono">{(m.categorias || []).join(" · ") || "—"}</dd>
            <dt>Telefone</dt><dd>{mascararTelefone(m.telefone)}</dd>
            <dt>Status</dt><dd><Badge variant={statusVariant(m.status)}>{m.status}</Badge></dd>
          </dl>
        </div>
      </div>
    </>
  );
}
