import { useData } from "../context/data";
import { dataBR } from "../lib/format";
import { dinheiro, numero, placaDe, resumoDeCustos } from "../lib/operacao";
import { Field } from "./Field";
import { ErroCarga, TableSkeleton } from "./Loading";

export function ResumoCustos({ mes, alterarMes, veiculoId, alterarVeiculo, compacto = false }) {
  const dados = useData();
  const { falhas, recarregar, carregandoOperacao, veiculos } = dados;
  if (carregandoOperacao) return <section className="card"><TableSkeleton linhas={4} /></section>;
  if (["manutencoes", "viagens", "abastecimentos"].some((r) => falhas.includes(r))) {
    return <ErroCarga mensagem="Não foi possível calcular todos os custos." onTentar={recarregar} />;
  }

  const resumo = resumoDeCustos(dados, mes, veiculoId);
  const linhas = [...resumo.linhas].sort((a, b) => b.total - a.total);
  const [ano, m] = mes.split("-");
  const anterior = new Date(Date.UTC(Number(ano), Number(m) - 2, 1)).toISOString().slice(0, 7);
  const anteriorResumo = resumoDeCustos(dados, anterior, veiculoId);

  return (
    <section className="card resumo-custos" aria-labelledby="titulo-custos">
      <div className="card-pad">
        <div className="card-head">
          <div>
            <h2 className="card-title" id="titulo-custos">Custos por mês</h2>
            <p className="chart-description">Combustível e serviços concluídos. O custo por km usa a distância registrada nas viagens concluídas.</p>
          </div>
        </div>
        <div className="row filtros-custos">
          <Field label="Mês" name="mes-custos" type="month" value={mes} onChange={(e) => { if (/^\d{4}-\d{2}$/.test(e.target.value) && e.target.value >= "1900-01") alterarMes(e.target.value); }} />
          {!compacto && <Field label="Veículo" name="veiculo-custos" as="select" placeholderOption="Todos os veículos"
            options={veiculos.map((v) => ({ value: String(v.id), label: v.placa }))} value={veiculoId}
            onChange={(e) => alterarVeiculo(e.target.value)} />}
        </div>
        <dl className="stats-grid custos-indicadores">
          <div className="stat"><dt className="stat-label">Total</dt><dd className="stat-value">{dinheiro.format(resumo.total)}</dd></div>
          <div className="stat"><dt className="stat-label">Mês anterior</dt><dd className="stat-value">{dinheiro.format(anteriorResumo.total)}</dd></div>
          <div className="stat"><dt className="stat-label">Distância registrada</dt><dd className="stat-value">{numero.format(resumo.km)} <small>km</small></dd></div>
          <div className="stat"><dt className="stat-label">Custo por km</dt><dd className="stat-value">{resumo.porKm == null ? "—" : dinheiro.format(resumo.porKm)}</dd></div>
        </dl>
      </div>
      {!compacto && (linhas.length > 0 ? (
        <div className="table-wrap">
          <table className="table stack">
            <thead><tr><th>Veículo</th><th>Combustível</th><th>Manutenção</th><th>Total</th><th>Distância</th><th>Custo por km</th></tr></thead>
            <tbody>{linhas.map((item) => (
              <tr key={item.veiculoId}>
                <td className="cell-first" data-label="Veículo"><span className="plate">{placaDe(veiculos, item.veiculoId)}</span></td>
                <td data-label="Combustível">{dinheiro.format(item.combustivel)}</td>
                <td data-label="Manutenção">{dinheiro.format(item.manutencao)}</td>
                <td data-label="Total">{dinheiro.format(item.total)}</td>
                <td data-label="Distância">{numero.format(item.km)} km</td>
                <td data-label="Custo por km">{item.km ? dinheiro.format(item.total / item.km) : "—"}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : <p className="panel-message">Nenhum custo ou distância registrado no mês de referência {dataBR(mes + "-01").slice(3)}.</p>)}
    </section>
  );
}
