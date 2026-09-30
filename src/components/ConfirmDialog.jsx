/** Modal simples de confirmação (ex.: excluir registro). */
export function ConfirmDialog({ aberto, titulo, mensagem, onConfirmar, onCancelar }) {
  if (!aberto) return null;
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onCancelar()}>
      <div className="dialog" role="dialog" aria-modal="true">
        <h3>{titulo}</h3>
        <p>{mensagem}</p>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onCancelar}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirmar}>Excluir</button>
        </div>
      </div>
    </div>
  );
}
