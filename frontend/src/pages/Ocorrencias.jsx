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
import { STATUS_OCORRENCIA, TIPOS_OCORRENCIA, ICONE_TIPO } from "../data/constants";
import { dataBR } from "../lib/format";

export function Ocorrencias() {
  const { ocorrencias, veiculos, removeOcorrencia, carregando, erro, recarregar } = useData();
  const navigate = useNavigate();
  const toast = useToast();

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [excluir, setExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  const placaDe = (id) => veiculos.find((v) => String(v.id) === String(id))?.placa || "—";

  const termo = busca.trim().toLowerCase();
  const lista = ocorrencias
    .filter((o) => {
      const casaBusca = !termo || o.titulo.toLowerCase().includes(termo) || o.descricao.toLowerCase().includes(termo);
      return casaBusca && (!filtroStatus || o.status === filtroStatus) && (!filtroTipo || o.tipo === filtroTipo);
    })
    .sort((a, b) => b.data.localeCompare(a.data));

  async function confirmarExclusao() {
    setExcluindo(true);
    try {
      await removeOcorrencia(excluir.id);
      toast.sucesso(`Ocorrência "${excluir.titulo}" excluída.`);
    } catch (e) {
      toast.erro(e.message);
    } finally {
      setExcluindo(false);
      setExcluir(null);
    }
  }

  return (
    <>
      <PageHeader titulo="Ocorrências" sub="Registre e acompanhe acidentes, manutenções e atrasos da operação.">
        <Link to="/ocorrencias/nova" className="btn btn-primary"><Icon name="plus" size={17} /> Nova ocorrência</Link>
      </PageHeader>

      {erro && <ErroCarga mensagem={erro} onTentar={recarregar} />}

      <div className="toolbar">
        <div className="grow">
          <SearchBar value={busca} onChange={setBusca} placeholder="Buscar por título ou descrição..." />
        </div>
        <select className="select" style={{ width: "auto" }} value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} aria-label="Filtrar por status">
          <option value="">Todos os status</option>
          {STATUS_OCORRENCIA.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="select" style={{ width: "auto" }} value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} aria-label="Filtrar por tipo">
          <option value="">Todos os tipos</option>
          {TIPOS_OCORRENCIA.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="card">
        {carregando ? (
          <TableSkeleton />
        ) : lista.length === 0 ? (
          <EmptyState
            icon="alert"
            titulo={ocorrencias.length === 0 ? "Nenhuma ocorrência registrada" : "Nenhum resultado"}
            texto={ocorrencias.length === 0 ? "Registre a primeira ocorrência da operação." : "Tente ajustar a busca ou os filtros."}
          >
            {ocorrencias.length === 0 && <Link to="/ocorrencias/nova" className="btn btn-primary"><Icon name="plus" size={17} /> Nova ocorrência</Link>}
          </EmptyState>
        ) : (
          <>
            <div className="table-wrap">
              <table className="table stack">
                <thead>
                  <tr>
                    <th>Ocorrência</th>
                    <th>Veículo</th>
                    <th>Data</th>
                    <th>Status</th>
                    <th className="text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((o) => (
                    <tr key={o.id}>
                      <td className="cell-first" data-label="Ocorrência">
                        <div className="cell-main">
                          <span className={"type-ico " + o.tipo}><Icon name={ICONE_TIPO[o.tipo] || "inbox"} size={18} /></span>
                          <div>
                            <strong>{o.titulo}</strong>
                            <small>{o.tipo}</small>
                          </div>
                        </div>
                      </td>
                      <td data-label="Veículo"><span className="plate">{placaDe(o.veiculoId)}</span></td>
                      <td data-label="Data" className="muted">{dataBR(o.data)}</td>
                      <td data-label="Status"><Badge variant={statusVariant(o.status)}>{o.status}</Badge></td>
                      <td className="cell-actions">
                        <div className="actions">
                          <button className="icon-btn" title="Detalhes" aria-label={`Ver ${o.titulo}`} onClick={() => navigate(`/ocorrencias/${o.id}`)}><Icon name="eye" size={17} /></button>
                          <button className="icon-btn" title="Editar" aria-label={`Editar ${o.titulo}`} onClick={() => navigate(`/ocorrencias/${o.id}/editar`)}><Icon name="edit" size={17} /></button>
                          <button className="icon-btn danger" title="Excluir" aria-label={`Excluir ${o.titulo}`} onClick={() => setExcluir(o)}><Icon name="trash" size={17} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-foot">{lista.length} de {ocorrencias.length} ocorrência(s)</div>
          </>
        )}
      </div>

      <ConfirmDialog
        aberto={!!excluir}
        titulo="Excluir ocorrência"
        mensagem={excluir ? `Tem certeza que deseja excluir "${excluir.titulo}"? Esta ação não pode ser desfeita.` : ""}
        carregando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setExcluir(null)}
      />
    </>
  );
}
