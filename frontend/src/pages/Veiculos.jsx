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
import { STATUS_VEICULO } from "../data/constants";

import { baixarCSV, normalizarBusca } from "../lib/format";

const COLUNAS = { placa: (v) => v.placa, veiculo: (v) => `${v.marca} ${v.modelo}`, ano: (v) => v.ano, status: (v) => v.status };

export function Veiculos() {
  const { veiculos, removeVeiculo, carregando, falhas, recarregar } = useData();
  const { pathname, search } = useLocation();
  const origem = `${pathname}${search}`;
  const toast = useToast();

  const { ler, alterar, limpar } = useFiltros();
  const busca = ler("q");
  const filtroStatus = ler("status", STATUS_VEICULO);
  const [excluir, setExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  const termo = normalizarBusca(busca);
  const filtrada = veiculos.filter((v) => {
    const casaBusca = !termo || [v.placa, v.marca, v.modelo].some((t) => normalizarBusca(t).includes(termo));
    return casaBusca && (!filtroStatus || v.status === filtroStatus);
  });

  const { ordenada: lista, ordem, ordenarPor } = useOrdenacao(filtrada, COLUNAS);

  function exportar() {
    baixarCSV("veiculos.csv", [["Placa", "Marca", "Modelo", "Ano", "Status"], ...lista.map((v) => [v.placa, v.marca, v.modelo, v.ano, v.status])]);
  }

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
        <Link to="/veiculos/novo" state={{ origem }} className="btn btn-primary"><Icon name="plus" size={17} /> Novo veículo</Link>
        <button type="button" className="btn btn-outline" onClick={exportar} disabled={carregando || !lista.length}>
          <Icon name="download" size={17} /> Exportar CSV
        </button>
      </PageHeader>

      <div className="toolbar" role="group" aria-label="Busca e filtros">
        <div className="grow">
          <SearchBar value={busca} onChange={(valor) => alterar("q", valor)} placeholder="Buscar por placa, marca ou modelo..." />
        </div>
        <div className="chips" role="group" aria-label="Filtrar por status">
          <button aria-pressed={!filtroStatus} className={"chip" + (!filtroStatus ? " on" : "")} onClick={() => alterar("status", "")}>Todos</button>
          {STATUS_VEICULO.map((s) => (
            <button key={s} aria-pressed={filtroStatus === s} className={"chip" + (filtroStatus === s ? " on" : "")} onClick={() => alterar("status", s)}>{s}</button>
          ))}
        </div>
      </div>

      <ListResults
        total={veiculos.length}
        quantidade={lista.length}
        singular="veículo"
        plural="veículos"
        icon="truck"
        carregando={carregando}
        erro={falhas.includes("veiculos") ? "Não foi possível carregar veículos." : ""}
        onTentar={recarregar}
        onLimpar={limpar}
        vazio={
          <EmptyState icon="truck" titulo="Nenhum veículo cadastrado" texto="Cadastre o primeiro veículo da frota.">
            <Link className="btn btn-outline" to="/veiculos/novo">Novo veículo</Link>
          </EmptyState>
        }
      >
        <div className="table-wrap">
          <table className="table stack">
            <thead>
              <tr>
                <ThOrdenavel coluna="placa" ordem={ordem} onOrdenar={ordenarPor}>Placa</ThOrdenavel>
                <ThOrdenavel coluna="veiculo" ordem={ordem} onOrdenar={ordenarPor}>Veículo</ThOrdenavel>
                <ThOrdenavel coluna="ano" ordem={ordem} onOrdenar={ordenarPor}>Ano</ThOrdenavel>
                <ThOrdenavel coluna="status" ordem={ordem} onOrdenar={ordenarPor}>Status</ThOrdenavel>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((v) => (
                <tr key={v.id}>
                  <td className="cell-first" data-label="Placa"><Link className="plate table-record" to={`/veiculos/${v.id}`} state={{ origem }}>{v.placa}</Link></td>
                  <td data-label="Veículo">
                    <div className="cell-main"><div><strong>{v.marca} {v.modelo}</strong></div></div>
                  </td>
                  <td data-label="Ano" className="muted">{v.ano}</td>
                  <td data-label="Status"><Badge variant={statusVariant(v.status)}>{v.status}</Badge></td>
                  <td className="cell-actions">
                    <div className="actions">
                      <Link className="icon-btn" title="Detalhes" aria-label={`Ver ${v.placa}`} to={`/veiculos/${v.id}`} state={{ origem }}><Icon name="eye" size={17} /></Link>
                      <Link className="icon-btn" title="Editar" aria-label={`Editar ${v.placa}`} to={`/veiculos/${v.id}/editar`} state={{ origem }}><Icon name="edit" size={17} /></Link>
                      <button className="icon-btn danger" title="Excluir" aria-label={`Excluir ${v.placa}`} onClick={() => setExcluir(v)}><Icon name="trash" size={17} /></button>
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
        titulo="Excluir veículo"
        mensagem={excluir ? `Tem certeza que deseja excluir o veículo ${excluir.placa}? Esta ação não pode ser desfeita.` : ""}
        carregando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setExcluir(null)}
      />
    </>
  );
}
