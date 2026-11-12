/** Esqueleto de carregamento para tabelas e cards. */
export function TableSkeleton({ linhas = 6 }) {
  return (
    <div aria-busy="true" aria-label="Carregando">
      {Array.from({ length: linhas }, (_, i) => (
        <div key={i} className="skeleton sk-line" style={{ width: `${70 + ((i * 13) % 25)}%` }} />
      ))}
    </div>
  );
}

export function CardsSkeleton({ n = 4 }) {
  return (
    <div className="stats-grid" aria-busy="true">
      {Array.from({ length: n }, (_, i) => <div key={i} className="skeleton sk-card" />)}
    </div>
  );
}

/** Aviso de falha ao carregar, com botão de tentar de novo. */
export function ErroCarga({ mensagem, onTentar }) {
  return (
    <div className="alert alert-danger">
      <span style={{ flex: 1 }}>{mensagem}</span>
      <button className="btn btn-outline btn-sm" onClick={onTentar}>Tentar de novo</button>
    </div>
  );
}
