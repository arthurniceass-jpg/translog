import { Link, useLocation } from "react-router-dom";
import { useData } from "../context/data";
import { useFiltros } from "../hooks/useFiltros";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { Badge } from "../components/Badge";
import { statusVariant } from "../components/badgeVariants";
import { Field } from "../components/Field";
import { Icon } from "../components/Icons";
import { TableSkeleton, ErroCarga } from "../components/Loading";
import { STATUS_OCORRENCIA, TIPOS_OCORRENCIA } from "../data/constants";
import { baixarCSV, dataBR, mesAno } from "../lib/format";

export function Historico() {
  const { ocorrencias, veiculos, motoristas, carregando, falhas, recarregar } = useData();
  const { pathname, search } = useLocation();
  const { ler, alterar, limpar } = useFiltros();
  const status = ler("status", STATUS_OCORRENCIA);
  const tipo = ler("tipo", TIPOS_OCORRENCIA);
  const de = ler("de");
  const ate = ler("ate");
  const filtrado = Boolean(status || tipo || de || ate);
  const periodoInvalido = Boolean(de && ate && de > ate);
  const indisponivel = falhas.includes("ocorrencias");

  const placas = new Map(veiculos.map((v) => [String(v.id), v.placa]));
  const nomes = new Map(motoristas.map((m) => [String(m.id), m.nome]));
  const lista = periodoInvalido ? [] : ocorrencias
    .filter((o) => (!status || o.status === status) && (!tipo || o.tipo === tipo) && (!de || o.data >= de) && (!ate || o.data <= ate))
    .sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id);

  const grupos = new Map();
  for (const ocorrencia of lista) {
    const mes = ocorrencia.data.slice(0, 7);
    if (!grupos.has(mes)) grupos.set(mes, []);
    grupos.get(mes).push(ocorrencia);
  }

  function exportar() {
    baixarCSV("historico-ocorrencias.csv", [
      ["Data", "Título", "Tipo", "Status", "Veículo", "Motorista", "Descrição"],
      ...lista.map((o) => [
        dataBR(o.data), o.titulo, o.tipo, o.status,
        placas.get(String(o.veiculoId)), nomes.get(String(o.motoristaId)), o.descricao,
      ]),
    ]);
  }

  return (
    <>
      <PageHeader titulo="Histórico de ocorrências" sub="Consulte os registros por período, tipo e status.">
        <button type="button" className="btn btn-outline" onClick={exportar} disabled={carregando || indisponivel || lista.length === 0}>
          <Icon name="download" size={17} /> Exportar CSV
        </button>
      </PageHeader>

      <section className="card card-pad history-filters" aria-label="Filtros do histórico">
        <div className="history-filter-grid">
          <Field label="Status" name="h-status" as="select" options={STATUS_OCORRENCIA} placeholderOption="Todos" value={status} onChange={(e) => alterar("status", e.target.value)} />
          <Field label="Tipo" name="h-tipo" as="select" options={TIPOS_OCORRENCIA} placeholderOption="Todos" value={tipo} onChange={(e) => alterar("tipo", e.target.value)} />
          <Field label="Data inicial" name="h-de" type="date" value={de} max={ate || undefined} onChange={(e) => alterar("de", e.target.value)} />
          <Field label="Data final" name="h-ate" type="date" value={ate} min={de || undefined} onChange={(e) => alterar("ate", e.target.value)} error={periodoInvalido ? "Selecione uma data igual ou posterior à inicial." : ""} />
        </div>
        {filtrado && <button type="button" className="btn btn-ghost btn-sm" onClick={limpar}><Icon name="x" size={16} /> Limpar filtros</button>}
      </section>

      {carregando ? (
        <div className="card"><TableSkeleton /></div>
      ) : indisponivel ? (
        <ErroCarga mensagem="Não foi possível carregar o histórico." onTentar={recarregar} />
      ) : !periodoInvalido && (lista.length ? (
        <>
          <p className="results-count" role="status">{lista.length} {lista.length === 1 ? "ocorrência" : "ocorrências"}</p>
          {Array.from(grupos, ([mes, itens]) => (
            <section className="timeline-group" key={mes}>
              <h2 className="timeline-month">{mesAno(mes + "-01")}</h2>
              <ul className="card timeline-list">
                {itens.map((o) => (
                  <li key={o.id}>
                    <Link className="t-item" to={`/ocorrencias/${o.id}`} state={{ origem: `${pathname}${search}` }}>
                      <time className="t-date" dateTime={o.data}><b>{o.data.slice(-2)}</b><span>dia</span></time>
                      <div className="grow">
                        <strong>{o.titulo}</strong>
                        <small>{[o.tipo, placas.get(String(o.veiculoId))].filter(Boolean).join(" · ")}</small>
                      </div>
                      <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
                      <Icon name="arrow" size={15} />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      ) : (
        <div className="card">
          <EmptyState
            icon="history"
            titulo={filtrado ? "Nenhuma ocorrência com esses filtros" : "Nenhuma ocorrência no histórico"}
            texto={filtrado ? "Altere o período, o tipo ou o status." : "Os registros da operação aparecem aqui."}
          />
        </div>
      ))}
    </>
  );
}
