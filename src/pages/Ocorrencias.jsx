import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import { SearchBar } from "../components/SearchBar";
import { EmptyState } from "../components/EmptyState";
import { Badge, statusVariant } from "../components/Badge";
import { ConfirmDialog } from "../components/ConfirmDialog";

const STATUS = ["Aberta", "Em análise", "Resolvida"];
const TIPOS = ["Manutenção", "Acidente", "Atraso", "Outro"];

export function Ocorrencias() {
  const { ocorrencias, veiculos, removeOcorrencia } = useData();
  const location = useLocation();
  const navigate = useNavigate();

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [excluir, setExcluir] = useState(null);
  const [msg, setMsg] = useState(location.state?.msg || "");

  const placaDe = (veiculoId) => veiculos.find((v) => v.id === veiculoId)?.placa || "—";

  const termo = busca.trim().toLowerCase();
  const lista = ocorrencias.filter((o) => {
    const casaBusca =
      !termo ||
      o.titulo.toLowerCase().includes(termo) ||
      o.descricao.toLowerCase().includes(termo);
    const casaStatus = !filtroStatus || o.status === filtroStatus;
    const casaTipo = !filtroTipo || o.tipo === filtroTipo;
    return casaBusca && casaStatus && casaTipo;
  });

  function confirmarExclusao() {
    removeOcorrencia(excluir.id);
    setMsg(`Ocorrência "${excluir.titulo}" excluída.`);
    setExcluir(null);
  }

  return (
    <>
      <div className="page-head">
        <div>
          <span className="kicker">Operação</span>
          <h1 className="page-title">Ocorrências</h1>
          <p className="page-sub">Registre e acompanhe acidentes, manutenções e atrasos.</p>
        </div>
        <Link to="/ocorrencias/nova" className="btn btn-primary">+ Nova ocorrência</Link>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}

      <div className="toolbar">
        <div className="grow">
          <SearchBar value={busca} onChange={setBusca} placeholder="Buscar por título ou descrição..." />
        </div>
        <select className="select" style={{ maxWidth: 180 }} value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
          <option value="">Todos os status</option>
          {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="select" style={{ maxWidth: 180 }} value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
          <option value="">Todos os tipos</option>
          {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="card">
        {lista.length === 0 ? (
          <EmptyState
            emoji="📋"
            titulo={ocorrencias.length === 0 ? "Nenhuma ocorrência registrada" : "Nenhum resultado"}
            texto={ocorrencias.length === 0 ? "Clique em “Nova ocorrência” para começar." : "Tente ajustar a busca ou os filtros."}
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Tipo</th>
                  <th>Veículo</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((o) => (
                  <tr key={o.id}>
                    <td><strong>{o.titulo}</strong></td>
                    <td>{o.tipo}</td>
                    <td>{placaDe(o.veiculoId)}</td>
                    <td>{new Date(o.data + "T00:00:00").toLocaleDateString("pt-BR")}</td>
                    <td><Badge variant={statusVariant(o.status)}>{o.status}</Badge></td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/ocorrencias/${o.id}`)}>Detalhes</button>
                        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/ocorrencias/${o.id}/editar`)}>Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setExcluir(o)}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="muted mt">{lista.length} de {ocorrencias.length} ocorrência(s)</p>

      <ConfirmDialog
        aberto={!!excluir}
        titulo="Excluir ocorrência"
        mensagem={excluir ? `Tem certeza que deseja excluir "${excluir.titulo}"? Esta ação não pode ser desfeita.` : ""}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setExcluir(null)}
      />
    </>
  );
}
