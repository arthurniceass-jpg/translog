/** Mensagem condicional para listas vazias / sem resultados. */
export function EmptyState({ emoji = "📭", titulo = "Nada por aqui", texto }) {
  return (
    <div className="empty">
      <div className="empty-emoji">{emoji}</div>
      <h3>{titulo}</h3>
      {texto && <p>{texto}</p>}
    </div>
  );
}
