import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { Badge, statusVariant } from "../components/Badge";
import { Icon } from "../components/Icons";
import { TableSkeleton, ErroCarga } from "../components/Loading";
import { STATUS_OCORRENCIA, TIPOS_OCORRENCIA, ICONE_TIPO } from "../data/constants";
import { baixarCSV, dataBR, mesAno } from "../lib/format";

export function Historico() {
  const { ocorrencias, veiculos, motoristas, carregando, erro, recarregar } = useData();
  const navigate = useNavigate();

  const [status, setStatus] = useState("");
  const [tipo, setTipo] = useState("");
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");

  const placaDe = (id) => veiculos.find((v) => String(v.id) === String(id))?.placa || "—";
  const motoristaDe = (id) => motoristas.find((m) => String(m.id) === String(id))?.nome || "";

  const lista = ocorrencias
    .filter((o) => (!status || o.status === status) && (!tipo || o.tipo === tipo) && (!de || o.data >= de) && (!ate || o.data <= ate))
    .sort((a, b) => b.data.localeCompare(a.data));

  // agrupa por mês (a lista já vem ordenada, então a ordem dos grupos se mantém)
  const grupos = lista.reduce((acc, o) => {
    const chave = o.data.slice(0, 7);
    (acc[chave] ||= []).push(o);
    return acc;
  }, {});

  const filtrado = status || tipo || de || ate;
  const limpar = () => { setStatus(""); setTipo(""); setDe(""); setAte(""); };

  function exportar() {
    baixarCSV("historico-ocorrencias.csv", [
      ["Data", "Título", "Tipo", "Status", "Veículo", "Motorista", "Descrição"],
      ...lista.map((o) => [dataBR(o.data), o.titulo, o.tipo, o.status, placaDe(o.veiculoId), motoristaDe(o.motoristaId), o.descricao]),
    ]);
  }

  return (
    <>
      <PageHeader titulo="Histórico de ocorrências" sub="Consulte tudo o que aconteceu, com filtros por status, tipo e período.">
        <button className="btn btn-outline" onClick={exportar} disabled={lista.length === 0}>
          <Icon name="download" size={17} /> Exportar CSV
        </button>
      </PageHeader>

      {erro && <ErroCarga mensagem={erro} onTentar={recarregar} />}

      <div className="card card-pad" style={{ marginBottom: "1.5rem" }}>
        <div className="form-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", marginBottom: "-0.25rem" }}>
          <div className="field">
            <label htmlFor="h-status">Status</label>
            <select id="h-status" className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos</option>
              {STATUS_OCORRENCIA.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="h-tipo">Tipo</label>
            <select id="h-tipo" className="select" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="">Todos</option>
              {TIPOS_OCORRENCIA.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="h-de">De</label>
            <input id="h-de" type="date" className="input" value={de} onChange={(e) => setDe(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="h-ate">Até</label>
            <input id="h-ate" type="date" className="input" value={ate} onChange={(e) => setAte(e.target.value)} />
          </div>
        </div>
        {filtrado && <button className="btn btn-ghost btn-sm" onClick={limpar}><Icon name="x" size={15} /> Limpar filtros</button>}
      </div>

      {carregando ? (
        <div className="card"><TableSkeleton /></div>
      ) : lista.length === 0 ? (
        <div className="card">
          <EmptyState icon="history" titulo="Nenhuma ocorrência no período" texto="Ajuste os filtros para ver o histórico." />
        </div>
      ) : (
        Object.entries(grupos).map(([chave, itens]) => (
          <section className="timeline-group" key={chave}>
            <h2 className="timeline-month">{mesAno(chave + "-01")} <small>{itens.length} registro(s)</small></h2>
            {itens.map((o) => {
              const [, , dia] = o.data.split("-");
              const mes = new Date(o.data + "T00:00:00").toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
              return (
                <div key={o.id} className="card t-item" role="link" tabIndex={0}
                  onClick={() => navigate(`/ocorrencias/${o.id}`)}
                  onKeyDown={(e) => e.key === "Enter" && navigate(`/ocorrencias/${o.id}`)}>
                  <div className="t-date"><b>{dia}</b><span>{mes}</span></div>
                  <span className={"type-ico " + o.tipo}><Icon name={ICONE_TIPO[o.tipo] || "inbox"} size={18} /></span>
                  <div className="grow">
                    <strong>{o.titulo}</strong>
                    <small>{o.tipo} · <span className="mono">{placaDe(o.veiculoId)}</span></small>
                  </div>
                  <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
                </div>
              );
            })}
          </section>
        ))
      )}

      {!carregando && <p className="muted">{lista.length} registro(s) encontrado(s)</p>}
    </>
  );
}
