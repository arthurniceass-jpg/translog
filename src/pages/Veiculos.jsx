import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import { SearchBar } from "../components/SearchBar";
import { EmptyState } from "../components/EmptyState";
import { Badge, statusVariant } from "../components/Badge";
import { ConfirmDialog } from "../components/ConfirmDialog";

const STATUS = ["Disponível", "Em uso", "Manutenção"];

export function Veiculos() {
  const { veiculos, removeVeiculo } = useData();
  const location = useLocation();
  const navigate = useNavigate();

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [excluir, setExcluir] = useState(null); // veículo marcado p/ exclusão
  const [msg, setMsg] = useState(location.state?.msg || "");

  // Busca (placa ou modelo) + filtro por status, controlados por estado
  const termo = busca.trim().toLowerCase();
  const lista = veiculos.filter((v) => {
    const casaBusca =
      !termo ||
      v.placa.toLowerCase().includes(termo) ||
      v.modelo.toLowerCase().includes(termo);
    const casaStatus = !filtroStatus || v.status === filtroStatus;
    return casaBusca && casaStatus;
  });

  function confirmarExclusao() {
    removeVeiculo(excluir.id);
    setMsg(`Veículo ${excluir.placa} excluído.`);
    setExcluir(null);
  }

  return (
    <>
      <div className="page-head">
        <div>
          <span className="kicker">Frota</span>
          <h1 className="page-title">Veículos</h1>
          <p className="page-sub">Cadastre e acompanhe os veículos da empresa.</p>
        </div>
        <Link to="/veiculos/novo" className="btn btn-primary">+ Novo veículo</Link>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}

      <div className="toolbar">
        <div className="grow">
          <SearchBar value={busca} onChange={setBusca} placeholder="Buscar por placa ou modelo..." />
        </div>
        <select className="select" style={{ maxWidth: 200 }} value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
          <option value="">Todos os status</option>
          {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card">
        {lista.length === 0 ? (
          <EmptyState
            emoji="🚚"
            titulo={veiculos.length === 0 ? "Nenhum veículo cadastrado" : "Nenhum resultado"}
            texto={veiculos.length === 0 ? "Clique em “Novo veículo” para começar." : "Tente ajustar a busca ou o filtro."}
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Placa</th>
                  <th>Veículo</th>
                  <th>Ano</th>
                  <th>Status</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((v) => (
                  <tr key={v.id}>
                    <td><strong>{v.placa}</strong></td>
                    <td>{v.marca} {v.modelo}</td>
                    <td>{v.ano}</td>
                    <td><Badge variant={statusVariant(v.status)}>{v.status}</Badge></td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/veiculos/${v.id}/editar`)}>Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setExcluir(v)}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="muted mt">{lista.length} de {veiculos.length} veículo(s)</p>

      <ConfirmDialog
        aberto={!!excluir}
        titulo="Excluir veículo"
        mensagem={excluir ? `Tem certeza que deseja excluir o veículo ${excluir.placa}? Esta ação não pode ser desfeita.` : ""}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setExcluir(null)}
      />
    </>
  );
}
