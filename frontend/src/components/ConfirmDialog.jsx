import { useEffect, useRef } from "react";
import { Icon } from "./Icons";

export function ConfirmDialog({ aberto, titulo, mensagem, carregando = false, onConfirmar, onCancelar }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (aberto && !dialog.open) dialog.showModal();
    if (!aberto && dialog.open) dialog.close();
  }, [aberto]);

  function cancelar() {
    if (!carregando) onCancelar();
  }

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      aria-labelledby="dlg-titulo"
      aria-describedby="dlg-mensagem"
      onCancel={(e) => { e.preventDefault(); cancelar(); }}
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        const { top, right, bottom, left } = e.currentTarget.getBoundingClientRect();
        if (e.clientX < left || e.clientX > right || e.clientY < top || e.clientY > bottom) cancelar();
      }}
    >
      <span className="dialog-ico"><Icon name="trash" size={22} /></span>
      <h2 id="dlg-titulo">{titulo}</h2>
      <p id="dlg-mensagem">{mensagem}</p>
      <div className="form-actions">
        <button className="btn btn-outline" onClick={cancelar} disabled={carregando}>Cancelar</button>
        <button className="btn btn-danger" onClick={onConfirmar} disabled={carregando}>
          {carregando && <span className="spinner" />} Excluir
        </button>
      </div>
    </dialog>
  );
}
