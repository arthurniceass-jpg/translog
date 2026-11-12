/** Gráficos leves em SVG/CSS puro (sem biblioteca). */
export const CORES = ["#2563eb", "#60a5fa", "#1e3a8a", "#93c5fd", "#64748b"];

/** Cor fixa por status, para o mesmo status ter a mesma cor em qualquer gráfico. */
export const COR_STATUS = {
  "Disponível": "#15803d",
  "Em uso": "#2563eb",
  "Manutenção": "#d97706",
  "Em viagem": "#2563eb",
  "Inativo": "#94a3b8",
  "Aberta": "#dc2626",
  "Em análise": "#d97706",
  "Resolvida": "#15803d",
};

/** Rosca: `dados` = { rótulo: quantidade }. Cor por rótulo via COR_STATUS (ou paleta por posição). */
export function Donut({ dados, cores = CORES, rotuloCentro = "total" }) {
  const itens = Object.entries(dados);
  const corDe = (k, i) => COR_STATUS[k] || cores[i % cores.length];
  const total = itens.reduce((s, [, n]) => s + n, 0);
  const R = 56;
  const C = 2 * Math.PI * R;
  let acumulado = 0;

  return (
    <div className="donut-wrap">
      <div className="donut">
        <svg viewBox="0 0 150 150" width="150" height="150" role="img" aria-label="Gráfico de distribuição">
          <circle cx="75" cy="75" r={R} fill="none" stroke="#eef1f5" strokeWidth="18" />
          {total > 0 &&
            itens.map(([k, n], i) => {
              const len = (n / total) * C;
              const visivel = Math.max(len - 2, 0);
              const el = (
                <circle
                  key={k}
                  cx="75" cy="75" r={R} fill="none" stroke={corDe(k, i)} strokeWidth="18"
                  strokeDasharray={`${visivel} ${C - visivel}`}
                  strokeDashoffset={-acumulado}
                />
              );
              acumulado += len;
              return el;
            })}
        </svg>
        <div className="donut-center">
          <b>{total}</b>
          <span>{rotuloCentro}</span>
        </div>
      </div>
      <div className="legend">
        {itens.length === 0 && <span className="muted">Sem dados.</span>}
        {itens.map(([k, n], i) => (
          <div className="legend-item" key={k}>
            <i style={{ background: corDe(k, i) }} />
            <span>{k}</span>
            <b>{n}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Barras horizontais: `dados` = { rótulo: quantidade }. */
export function HBars({ dados }) {
  const itens = Object.entries(dados).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...itens.map(([, n]) => n));
  if (itens.length === 0) return <p className="muted">Sem dados.</p>;
  return (
    <div>
      {itens.map(([k, n]) => (
        <div className="hbar" key={k}>
          <div className="hbar-top"><span>{k}</span><b>{n}</b></div>
          <div className="hbar-track"><div className="hbar-fill" style={{ width: `${(n / max) * 100}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

/** Barras verticais: `serie` = [{ rotulo, valor }]. A última barra é destacada. */
export function ColBars({ serie }) {
  const max = Math.max(1, ...serie.map((s) => s.valor));
  return (
    <div className="bars">
      {serie.map((s) => (
        <div className="bar-col" key={s.rotulo}>
          <b>{s.valor}</b>
          <div className="bar" style={{ height: `${(s.valor / max) * 100}%` }} />
          <span>{s.rotulo}</span>
        </div>
      ))}
    </div>
  );
}
