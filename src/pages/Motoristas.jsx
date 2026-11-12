import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { PageHeader } from "../components/PageHeader";
import { SearchBar } from "../components/SearchBar";
import { EmptyState } from "../components/EmptyState";
import { Badge, statusVariant } from "../components/Badge";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Avatar } from "../components/Avatar";
import { Icon } from "../components/Icons";
import { TableSkeleton, ErroCarga } from "../components/Loading";
import { STATUS_MOTORISTA } from "../data/constants";
import { mascararTelefone } from "../lib/format";

export function Motoristas() {
  const { motoristas, removeMotorista, carregando, erro, recarregar } = useData();
  const navigate = useNavigate();
  const toast = useToast();

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [excluir, setExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  const termo = busca.trim().toLowerCase();
  const lista = motoristas.filter((m) => {
    const casaBusca = !termo || m.nome.toLowerCase().includes(termo) || m.cnh.includes(termo);
    return casaBusca && (!filtroStatus || m.status === filtroStatus);
  });

  async function confirmarExclusao() {
    setExcluindo(true);
    try {
      await removeMotorista(excluir.id);
      toast.sucesso(`Motorista ${excluir.nome} excluído.`);
    } catch (e) {
      toast.erro(e.message);
    } finally {
      setExcluindo(false);
      setExcluir(null);
    }
  }

  return (
    <>
      <PageHeader titulo="Motoristas" sub="Gerencie os condutores, suas CNHs e a disponibilidade.">
        <Link to="/motoristas/novo" className="btn btn-primary"><Icon name="plus" size={17} /> Novo motorista</Link>
      </PageHeader>

      {erro && <ErroCarga mensagem={erro} onTentar={recarregar} />}

      <div className="toolbar">
        <div className="grow">
          <SearchBar value={busca} onChange={setBusca} placeholder="Buscar por nome ou CNH..." />
        </div>
        <div className="chips">
          <button className={"chip" + (!filtroStatus ? " on" : "")} onClick={() => setFiltroStatus("")}>Todos</button>
          {STATUS_MOTORISTA.map((s) => (
            <button key={s} className={"chip" + (filtroStatus === s ? " on" : "")} onClick={() => setFiltroStatus(s)}>{s}</button>
          ))}
        </div>
      </div>

      <div className="card">
        {carregando ? (
          <TableSkeleton />
        ) : lista.length === 0 ? (
          <EmptyState
            icon="users"
            titulo={motoristas.length === 0 ? "Nenhum motorista cadastrado" : "Nenhum resultado"}
            texto={motoristas.length === 0 ? "Cadastre o primeiro condutor da empresa." : "Tente ajustar a busca ou o filtro."}
          >
            {motoristas.length === 0 && <Link to="/motoristas/novo" className="btn btn-primary"><Icon name="plus" size={17} /> Novo motorista</Link>}
          </EmptyState>
        ) : (
          <>
            <div className="table-wrap">
              <table className="table stack">
                <thead>
                  <tr>
                    <th>Motorista</th>
                    <th>CNH</th>
                    <th>Categorias</th>
                    <th>Status</th>
                    <th className="text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((m) => (
                    <tr key={m.id}>
                      <td className="cell-first" data-label="Motorista">
                        <div className="cell-main">
                          <Avatar nome={m.nome} small />
                          <div>
                            <strong>{m.nome}</strong>
                            <small>{mascararTelefone(m.telefone)}</small>
                          </div>
                        </div>
                      </td>
                      <td data-label="CNH" className="mono">{m.cnh}</td>
                      <td data-label="Categorias" className="mono">{(m.categorias || []).join(" · ") || "—"}</td>
                      <td data-label="Status"><Badge variant={statusVariant(m.status)}>{m.status}</Badge></td>
                      <td className="cell-actions">
                        <div className="actions">
                          <button className="icon-btn" title="Editar" aria-label={`Editar ${m.nome}`} onClick={() => navigate(`/motoristas/${m.id}/editar`)}><Icon name="edit" size={17} /></button>
                          <button className="icon-btn danger" title="Excluir" aria-label={`Excluir ${m.nome}`} onClick={() => setExcluir(m)}><Icon name="trash" size={17} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-foot">{lista.length} de {motoristas.length} motorista(s)</div>
          </>
        )}
      </div>

      <ConfirmDialog
        aberto={!!excluir}
        titulo="Excluir motorista"
        mensagem={excluir ? `Tem certeza que deseja excluir ${excluir.nome}? Esta ação não pode ser desfeita.` : ""}
        carregando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setExcluir(null)}
      />
    </>
  );
}
