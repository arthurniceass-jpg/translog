import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { PageHeader } from "../components/PageHeader";
import { SearchBar } from "../components/SearchBar";
import { EmptyState } from "../components/EmptyState";
import { Badge, statusVariant } from "../components/Badge";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Icon } from "../components/Icons";
import { TableSkeleton, ErroCarga } from "../components/Loading";
import { STATUS_VEICULO } from "../data/constants";

export function Veiculos() {
  const { veiculos, removeVeiculo, carregando, erro, recarregar } = useData();
  const navigate = useNavigate();
  const toast = useToast();

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [excluir, setExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  const termo = busca.trim().toLowerCase();
  const lista = veiculos.filter((v) => {
    const casaBusca = !termo || [v.placa, v.marca, v.modelo].some((t) => t.toLowerCase().includes(termo));
    return casaBusca && (!filtroStatus || v.status === filtroStatus);
  });

  async function confirmarExclusao() {
    setExcluindo(true);
    try {
      await removeVeiculo(excluir.id);
      toast.sucesso(`Veículo ${excluir.placa} excluído.`);
    } catch (e) {
      toast.erro(e.message);
    } finally {
      setExcluindo(false);
      setExcluir(null);
    }
  }

  return (
    <>
      <PageHeader titulo="Veículos" sub="Cadastre e acompanhe os veículos da frota.">
        <Link to="/veiculos/novo" className="btn btn-primary"><Icon name="plus" size={17} /> Novo veículo</Link>
      </PageHeader>

      {erro && <ErroCarga mensagem={erro} onTentar={recarregar} />}

      <div className="toolbar">
        <div className="grow">
          <SearchBar value={busca} onChange={setBusca} placeholder="Buscar por placa, marca ou modelo..." />
        </div>
        <div className="chips">
          <button className={"chip" + (!filtroStatus ? " on" : "")} onClick={() => setFiltroStatus("")}>Todos</button>
          {STATUS_VEICULO.map((s) => (
            <button key={s} className={"chip" + (filtroStatus === s ? " on" : "")} onClick={() => setFiltroStatus(s)}>{s}</button>
          ))}
        </div>
      </div>

      <div className="card">
        {carregando ? (
          <TableSkeleton />
        ) : lista.length === 0 ? (
          <EmptyState
            icon="truck"
            titulo={veiculos.length === 0 ? "Nenhum veículo cadastrado" : "Nenhum resultado"}
            texto={veiculos.length === 0 ? "Cadastre o primeiro veículo da frota para começar." : "Tente ajustar a busca ou o filtro."}
          >
            {veiculos.length === 0 && <Link to="/veiculos/novo" className="btn btn-primary"><Icon name="plus" size={17} /> Novo veículo</Link>}
          </EmptyState>
        ) : (
          <>
            <div className="table-wrap">
              <table className="table stack">
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
                      <td className="cell-first" data-label="Placa"><span className="plate">{v.placa}</span></td>
                      <td data-label="Veículo">
                        <div className="cell-main"><div><strong>{v.marca} {v.modelo}</strong></div></div>
                      </td>
                      <td data-label="Ano" className="muted">{v.ano}</td>
                      <td data-label="Status"><Badge variant={statusVariant(v.status)}>{v.status}</Badge></td>
                      <td className="cell-actions">
                        <div className="actions">
                          <button className="icon-btn" title="Editar" aria-label={`Editar ${v.placa}`} onClick={() => navigate(`/veiculos/${v.id}/editar`)}><Icon name="edit" size={17} /></button>
                          <button className="icon-btn danger" title="Excluir" aria-label={`Excluir ${v.placa}`} onClick={() => setExcluir(v)}><Icon name="trash" size={17} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-foot">{lista.length} de {veiculos.length} veículo(s)</div>
          </>
        )}
      </div>

      <ConfirmDialog
        aberto={!!excluir}
        titulo="Excluir veículo"
        mensagem={excluir ? `Tem certeza que deseja excluir o veículo ${excluir.placa}? Esta ação não pode ser desfeita.` : ""}
        carregando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setExcluir(null)}
      />
    </>
  );
}
