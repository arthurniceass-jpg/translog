import { Link } from "react-router-dom";
import { useData } from "../context/data";
import { useFiltros } from "../hooks/useFiltros";
import { useRelogioFrota } from "../hooks/useRelogioFrota";
import { agoraNaFrota, dinheiro, horarioComparavel, resumoDeCustos } from "../lib/operacao";
import { Field } from "./Field";
import { TableSkeleton } from "./Loading";
import { Icon } from "./Icons";

function duracao(segundos) {
  if (segundos < 60) return "< 1 min";
  const minutos = Math.round(segundos / 60);
  const horas = Math.floor(minutos / 60);
  return horas === 0 ? `${minutos} min` : `${horas} h ${minutos % 60} min`;
}

export function IndicadoresOperacionais() {
  const dados = useData();
  const agora = useRelogioFrota();
  const { ler, alterar } = useFiltros();
  const parametro = ler("mes");
  const mes = /^\d{4}-(0[1-9]|1[0-2])$/.test(parametro) ? parametro : agora.slice(0, 7);
  if (dados.carregandoOperacao) return <section className="card mt"><TableSkeleton linhas={3} /></section>;

  const concluidas = dados.viagens.filter((v) => v.status === "CONCLUIDA" && v.chegadaReal?.startsWith(mes));
  const atrasos = concluidas.filter((v) => horarioComparavel(v.chegadaReal) > horarioComparavel(v.chegadaPrevista)).length;
  const medicoes = dados.resolucoes.filter((r) => agoraNaFrota(new Date(r.resolvidaEm)).startsWith(mes));
  const media = medicoes.length ? medicoes.reduce((total, r) => total + r.segundos, 0) / medicoes.length : null;
  const custo = resumoDeCustos(dados, mes);
  const falhaCustos = ["manutencoes", "abastecimentos", "viagens"].some((r) => dados.falhas.includes(r));

  return (
    <section className="card card-pad mt" aria-labelledby="indicadores-operacionais">
      <div className="card-head indicadores-head">
        <div>
          <h2 className="card-title" id="indicadores-operacionais">Desempenho operacional</h2>
          <p className="chart-description">Indicadores por mês de conclusão, com base nos registros disponíveis.</p>
        </div>
        <Field label="Mês de referência" name="mes-indicadores" type="month" value={mes}
          onChange={(e) => alterar("mes", e.target.value)} />
      </div>
      <dl className="stats-grid indicadores-operacao">
        <div className="stat">
          <dt className="stat-label">Tempo médio de resolução</dt>
          <dd className="stat-value">{media === null || dados.falhas.includes("resolucoes") ? "—" : duracao(media)}</dd>
          <dd className="operacao-nota">{medicoes.length} com histórico de abertura e resolução</dd>
        </div>
        <div className="stat">
          <dt className="stat-label">Viagens com atraso</dt>
          <dd className="stat-value">{!concluidas.length || dados.falhas.includes("viagens") ? "—" : `${Math.round(100 * atrasos / concluidas.length)}%`}</dd>
          <dd className="operacao-nota">{atrasos} de {concluidas.length} concluídas</dd>
        </div>
        <div className="stat">
          <dt className="stat-label">Custo por km registrado</dt>
          <dd className="stat-value">{falhaCustos || custo.porKm == null ? "—" : dinheiro.format(custo.porKm)}</dd>
          <dd><Link to={`/custos?mes=${mes}`} className="link-more">Ver custos <Icon name="arrow" size={14} /></Link></dd>
        </div>
      </dl>
    </section>
  );
}
