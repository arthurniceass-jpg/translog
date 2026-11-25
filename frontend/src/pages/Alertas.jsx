import { Link } from "react-router-dom";
import { useData } from "../context/data";
import { useFiltros } from "../hooks/useFiltros";
import { useRelogioFrota } from "../hooks/useRelogioFrota";
import { alertasDaFrota, DIAS_DOCUMENTO, DIAS_MANUTENCAO, KM_MANUTENCAO } from "../lib/operacao";
import { AlertList } from "../components/AlertList";
import { ErroCarga, TableSkeleton } from "../components/Loading";
import { PageHeader } from "../components/PageHeader";
import { Icon } from "../components/Icons";

const TIPOS = ["Ocorrência", "Manutenção", "Viagem", "Documento"];
const RECURSOS = ["ocorrencias", "acompanhamentos", "viagens", "manutencoes", "documentos", "veiculos", "motoristas"];

export function Alertas() {
  const dados = useData();
  const agora = useRelogioFrota();
  const { ler, alterar } = useFiltros();
  const tipo = ler("tipo", TIPOS);
  const prioridade = ler("prioridade", ["criticos"]);
  const lista = alertasDaFrota(dados, agora).filter((a) => (!tipo || a.tipo === tipo) && (!prioridade || a.critico));

  return (
    <>
      <PageHeader titulo="Alertas" sub="Veja o que precisa de atenção e abra o registro para tomar uma ação.">
        <Link className="btn btn-outline" to="/documentos"><Icon name="shield" size={17} /> Gerenciar documentos</Link>
      </PageHeader>

      {RECURSOS.some((r) => dados.falhas.includes(r)) &&
        <ErroCarga mensagem="Alguns dados da frota estão indisponíveis. A lista pode estar incompleta." onTentar={dados.recarregar} />}
      <div className="toolbar" role="group" aria-label="Filtros de alertas">
        <select className="select" aria-label="Tipo de alerta" value={tipo} onChange={(e) => alterar("tipo", e.target.value)}>
          <option value="">Todos os tipos</option>
          {TIPOS.map((t) => <option key={t}>{t}</option>)}
        </select>
        <button type="button" className={`chip${prioridade ? " on" : ""}`} aria-pressed={Boolean(prioridade)}
          onClick={() => alterar("prioridade", prioridade ? "" : "criticos")}>Só prioritários</button>
      </div>

      <section className="card overview-panel" aria-label="Pendências da frota">
        {dados.carregandoOperacao || dados.carregando ? <TableSkeleton /> : <AlertList alertas={lista} />}
        {!dados.carregandoOperacao && !dados.carregando && <p className="table-foot" role="status">{lista.length} {lista.length === 1 ? "alerta" : "alertas"}</p>}
      </section>
      <p className="operacao-nota mt">
        Documentos entram na fila a {DIAS_DOCUMENTO} dias do vencimento. Manutenções aparecem a {DIAS_MANUTENCAO} dias ou {KM_MANUTENCAO.toLocaleString("pt-BR")} km do limite registrado.
      </p>
    </>
  );
}
