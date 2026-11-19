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
import { Avatar } from "../components/Avatar";
import { Icon } from "../components/Icons";
import { ThOrdenavel } from "../components/ThOrdenavel";
import { useOrdenacao } from "../hooks/useOrdenacao";
import { ListResults } from "../components/ListResults";
import { useFiltros } from "../hooks/useFiltros";
import { STATUS_MOTORISTA } from "../data/constants";
import { baixarCSV, mascararCPF, mascararTelefone, normalizarBusca } from "../lib/format";

const COLUNAS = { nome: (m) => m.nome, cnh: (m) => m.cnh, categorias: (m) => (m.categorias || []).join(""), status: (m) => m.status };

export function Motoristas() {
  const { motoristas, removeMotorista, carregando, falhas, recarregar } = useData();
  const { pathname, search } = useLocation();
  const origem = `${pathname}${search}`;
  const toast = useToast();

  const { ler, alterar, limpar } = useFiltros();
  const busca = ler("q");
  const filtroStatus = ler("status", STATUS_MOTORISTA);
  const [excluir, setExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  const termo = normalizarBusca(busca);
  const filtrada = motoristas.filter((m) => {
    const casaBusca = !termo || normalizarBusca(m.nome).includes(termo) || m.cnh.includes(termo);
    return casaBusca && (!filtroStatus || m.status === filtroStatus);
  });

  const { ordenada: lista, ordem, ordenarPor } = useOrdenacao(filtrada, COLUNAS);

  function exportar() {
    baixarCSV("motoristas.csv", [["Nome", "CPF", "CNH", "Categorias", "Telefone", "Status"], ...lista.map((m) => [m.nome, mascararCPF(m.cpf), m.cnh, (m.categorias || []).join(" "), mascararTelefone(m.telefone), m.status])]);
  }

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
        <Link to="/motoristas/novo" state={{ origem }} className="btn btn-primary"><Icon name="plus" size={17} /> Novo motorista</Link>
        <button type="button" className="btn btn-outline" onClick={exportar} disabled={carregando || !lista.length}>
          <Icon name="download" size={17} /> Exportar CSV
        </button>
      </PageHeader>

      <div className="toolbar" role="group" aria-label="Busca e filtros">
        <div className="grow">
          <SearchBar value={busca} onChange={(valor) => alterar("q", valor)} placeholder="Buscar por nome ou CNH..." />
        </div>
        <div className="chips" role="group" aria-label="Filtrar por status">
          <button aria-pressed={!filtroStatus} className={"chip" + (!filtroStatus ? " on" : "")} onClick={() => alterar("status", "")}>Todos</button>
          {STATUS_MOTORISTA.map((s) => (
            <button key={s} aria-pressed={filtroStatus === s} className={"chip" + (filtroStatus === s ? " on" : "")} onClick={() => alterar("status", s)}>{s}</button>
          ))}
        </div>
      </div>

      <ListResults
        total={motoristas.length}
        quantidade={lista.length}
        singular="motorista"
        plural="motoristas"
        icon="users"
        carregando={carregando}
        erro={falhas.includes("motoristas") ? "Não foi possível carregar motoristas." : ""}
        onTentar={recarregar}
        onLimpar={limpar}
        vazio={
          <EmptyState icon="users" titulo="Nenhum motorista cadastrado" texto="Cadastre o primeiro condutor da operação.">
            <Link className="btn btn-outline" to="/motoristas/novo">Novo motorista</Link>
          </EmptyState>
        }
      >
        <div className="table-wrap">
          <table className="table stack">
            <thead>
              <tr>
                <ThOrdenavel coluna="nome" ordem={ordem} onOrdenar={ordenarPor}>Motorista</ThOrdenavel>
                <ThOrdenavel coluna="cnh" ordem={ordem} onOrdenar={ordenarPor}>CNH</ThOrdenavel>
                <ThOrdenavel coluna="categorias" ordem={ordem} onOrdenar={ordenarPor}>Categorias</ThOrdenavel>
                <ThOrdenavel coluna="status" ordem={ordem} onOrdenar={ordenarPor}>Status</ThOrdenavel>
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
                        <Link className="table-record" to={`/motoristas/${m.id}`} state={{ origem }}><strong>{m.nome}</strong></Link>
                        <small>{mascararTelefone(m.telefone)}</small>
                      </div>
                    </div>
                  </td>
                  <td data-label="CNH" className="mono">{m.cnh}</td>
                  <td data-label="Categorias" className="mono">{(m.categorias || []).join(" · ") || "—"}</td>
                  <td data-label="Status"><Badge variant={statusVariant(m.status)}>{m.status}</Badge></td>
                  <td className="cell-actions">
                    <div className="actions">
                      <Link className="icon-btn" title="Detalhes" aria-label={`Ver ${m.nome}`} to={`/motoristas/${m.id}`} state={{ origem }}><Icon name="eye" size={17} /></Link>
                      <Link className="icon-btn" title="Editar" aria-label={`Editar ${m.nome}`} to={`/motoristas/${m.id}/editar`} state={{ origem }}><Icon name="edit" size={17} /></Link>
                      <button className="icon-btn danger" title="Excluir" aria-label={`Excluir ${m.nome}`} onClick={() => setExcluir(m)}><Icon name="trash" size={17} /></button>
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
        titulo="Excluir motorista"
        mensagem={excluir ? `Tem certeza que deseja excluir ${excluir.nome}? Esta ação não pode ser desfeita.` : ""}
        carregando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setExcluir(null)}
      />
    </>
  );
}
