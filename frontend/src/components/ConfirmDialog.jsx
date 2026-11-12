import { useEffect } from "react";
import { Icon } from "./Icons";

/** Modal de confirmação de exclusão. Fecha com Esc ou clicando fora. */
export function ConfirmDialog({ aberto, titulo, mensagem, carregando = false, onConfirmar, onCancelar }) {
  useEffect(() => {
    if (!aberto) return;
    const onKey = (e) => e.key === "Escape" && onCancelar();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aberto, onCancelar]);

  if (!aberto) return null;
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onCancelar()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-titulo">
        <span className="dialog-ico"><Icon name="trash" size={22} /></span>
        <h3 id="dlg-titulo">{titulo}</h3>
        <p>{mensagem}</p>
        <div className="form-actions">
          <button className="btn btn-outline" onClick={onCancelar} disabled={carregando}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirmar} disabled={carregando}>
            {carregando && <span className="spinner" />} Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
