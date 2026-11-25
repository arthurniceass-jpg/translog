import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useData } from "../context/data";
import { useToast } from "../context/toast";
import { PageHeader } from "../components/PageHeader";
import { SearchBar } from "../components/SearchBar";
import { EmptyState } from "../components/EmptyState";
import { Badge } from "../components/Badge";
import { statusVariant } from "../components/badgeVariants";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Icon } from "../components/Icons";
import { ThOrdenavel } from "../components/ThOrdenavel";
import { useOrdenacao } from "../hooks/useOrdenacao";
import { ListResults } from "../components/ListResults";
import { useFiltros } from "../hooks/useFiltros";
import { STATUS_OCORRENCIA, TIPOS_OCORRENCIA, ICONE_TIPO } from "../data/constants";
import { dataBR, normalizarBusca } from "../lib/format";

const ORDEM_INICIAL = { coluna: "data", direcao: "desc" };

export function Ocorrencias() {
  const { ocorrencias, veiculos, removeOcorrencia, carregando, falhas, recarregar } = useData();
  const { pathname, search } = useLocation();
  const origem = `${pathname}${search}`;
  const toast = useToast();

  const { ler, alterar, limpar } = useFiltros();
  const busca = ler("q");
  const filtroStatus = ler("status", ["pendentes", ...STATUS_OCORRENCIA]);
  const filtroTipo = ler("tipo", TIPOS_OCORRENCIA);
  const [excluir, setExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  const placaDe = (id) => veiculos.find((v) => String(v.id) === String(id))?.placa || "—";

  const termo = normalizarBusca(busca);
  const filtrada = ocorrencias
    .filter((o) => {
      const casaBusca = !termo || normalizarBusca(o.titulo).includes(termo) || normalizarBusca(o.descricao).includes(termo);
      const casaStatus = filtroStatus === "pendentes" ? o.status !== "Resolvida" : !filtroStatus || o.status === filtroStatus;
      return casaBusca && casaStatus && (!filtroTipo || o.tipo === filtroTipo);
    });

  const colunas = { titulo: (o) => o.titulo, veiculo: (o) => placaDe(o.veiculoId), data: (o) => o.data, status: (o) => o.status };
  const { ordenada: lista, ordem, ordenarPor } = useOrdenacao(filtrada, colunas, ORDEM_INICIAL);

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
        <Link to="/ocorrencias/nova" state={{ origem }} className="btn btn-primary"><Icon name="plus" size={17} /> Nova ocorrência</Link>
      </PageHeader>

      <div className="toolbar" role="group" aria-label="Busca e filtros">
        <div className="grow">
          <SearchBar value={busca} onChange={(valor) => alterar("q", valor)} placeholder="Buscar por título ou descrição..." />
        </div>
        <select className="select"  value={filtroStatus} onChange={(e) => alterar("status", e.target.value)} aria-label="Filtrar por status">
          <option value="">Todos os status</option>
          <option value="pendentes">Pendentes</option>
          {STATUS_OCORRENCIA.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="select"  value={filtroTipo} onChange={(e) => alterar("tipo", e.target.value)} aria-label="Filtrar por tipo">
          <option value="">Todos os tipos</option>
          {TIPOS_OCORRENCIA.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <ListResults
        total={ocorrencias.length}
        quantidade={lista.length}
        singular="ocorrência"
        plural="ocorrências"
        icon="alert"
        carregando={carregando}
        erro={falhas.includes("ocorrencias") ? "Não foi possível carregar ocorrências." : ""}
        onTentar={recarregar}
        onLimpar={limpar}
        vazio={
          <EmptyState icon="alert" titulo="Nenhuma ocorrência registrada" texto="Os registros da operação aparecem aqui.">
            <Link className="btn btn-outline" to="/ocorrencias/nova">Nova ocorrência</Link>
          </EmptyState>
        }
      >
        <div className="table-wrap">
          <table className="table stack">
            <thead>
              <tr>
                <ThOrdenavel coluna="titulo" ordem={ordem} onOrdenar={ordenarPor}>Ocorrência</ThOrdenavel>
                <ThOrdenavel coluna="veiculo" ordem={ordem} onOrdenar={ordenarPor}>Veículo</ThOrdenavel>
                <ThOrdenavel coluna="data" ordem={ordem} onOrdenar={ordenarPor}>Data</ThOrdenavel>
                <ThOrdenavel coluna="status" ordem={ordem} onOrdenar={ordenarPor}>Status</ThOrdenavel>
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
                        <Link className="table-record" to={`/ocorrencias/${o.id}`} state={{ origem }}><strong>{o.titulo}</strong></Link>
                        <small>{o.tipo}</small>
                      </div>
                    </div>
                  </td>
                  <td data-label="Veículo"><span className="plate">{placaDe(o.veiculoId)}</span></td>
                  <td data-label="Data" className="muted">{dataBR(o.data)}</td>
                  <td data-label="Status"><Badge variant={statusVariant(o.status)}>{o.status}</Badge></td>
                  <td className="cell-actions">
                    <div className="actions">
                      <Link className="icon-btn" title="Detalhes" aria-label={`Ver ${o.titulo}`} to={`/ocorrencias/${o.id}`} state={{ origem }}><Icon name="eye" size={17} /></Link>
                      <Link className="icon-btn" title="Editar" aria-label={`Editar ${o.titulo}`} to={`/ocorrencias/${o.id}/editar`} state={{ origem }}><Icon name="edit" size={17} /></Link>
                      <button className="icon-btn danger" title="Excluir" aria-label={`Excluir ${o.titulo}`} onClick={() => setExcluir(o)}><Icon name="trash" size={17} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ListResults>

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
