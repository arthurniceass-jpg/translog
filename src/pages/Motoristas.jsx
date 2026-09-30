import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import { SearchBar } from "../components/SearchBar";
import { EmptyState } from "../components/EmptyState";
import { Badge, statusVariant } from "../components/Badge";
import { ConfirmDialog } from "../components/ConfirmDialog";

const STATUS = ["Disponível", "Em viagem", "Inativo"];

export function Motoristas() {
  const { motoristas, removeMotorista } = useData();
  const location = useLocation();
  const navigate = useNavigate();

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [excluir, setExcluir] = useState(null);
  const [msg, setMsg] = useState(location.state?.msg || "");

  // Busca por nome ou CNH + filtro por status, controlados por estado
  const termo = busca.trim().toLowerCase();
  const lista = motoristas.filter((m) => {
    const casaBusca =
      !termo ||
      m.nome.toLowerCase().includes(termo) ||
      m.cnh.toLowerCase().includes(termo);
    const casaStatus = !filtroStatus || m.status === filtroStatus;
    return casaBusca && casaStatus;
  });

  function confirmarExclusao() {
    removeMotorista(excluir.id);
    setMsg(`Motorista ${excluir.nome} excluído.`);
    setExcluir(null);
  }

  return (
    <>
      <div className="page-head">
        <div>
          <span className="kicker">Equipe</span>
          <h1 className="page-title">Motoristas</h1>
          <p className="page-sub">Cadastre e acompanhe os condutores da empresa.</p>
        </div>
        <Link to="/motoristas/novo" className="btn btn-primary">+ Novo motorista</Link>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}

      <div className="toolbar">
        <div className="grow">
          <SearchBar value={busca} onChange={setBusca} placeholder="Buscar por nome ou CNH..." />
        </div>
        <select className="select" style={{ maxWidth: 200 }} value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
          <option value="">Todos os status</option>
          {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card">
        {lista.length === 0 ? (
          <EmptyState
            emoji="🧑‍✈️"
            titulo={motoristas.length === 0 ? "Nenhum motorista cadastrado" : "Nenhum resultado"}
            texto={motoristas.length === 0 ? "Clique em “Novo motorista” para começar." : "Tente ajustar a busca ou o filtro."}
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CNH</th>
                  <th>Cat.</th>
                  <th>Telefone</th>
                  <th>Status</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((m) => (
                  <tr key={m.id}>
                    <td><strong>{m.nome}</strong></td>
                    <td>{m.cnh}</td>
                    <td>{m.categoria}</td>
                    <td>{m.telefone}</td>
                    <td><Badge variant={statusVariant(m.status)}>{m.status}</Badge></td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/motoristas/${m.id}/editar`)}>Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setExcluir(m)}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="muted mt">{lista.length} de {motoristas.length} motorista(s)</p>

      <ConfirmDialog
        aberto={!!excluir}
        titulo="Excluir motorista"
        mensagem={excluir ? `Tem certeza que deseja excluir ${excluir.nome}? Esta ação não pode ser desfeita.` : ""}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setExcluir(null)}
      />
    </>
  );
}
