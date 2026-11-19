import { Link } from "react-router-dom";

export function FormActions({ salvando, rotulo, voltar, bloqueado = false }) {
  return (
    <div className="form-actions">
      <button type="submit" className="btn btn-primary" disabled={salvando || bloqueado}>
        {salvando ? <><span className="spinner" /> Salvando…</> : rotulo}
      </button>
      {salvando
        ? <button type="button" className="btn btn-ghost" disabled>Cancelar</button>
        : <Link to={voltar} className="btn btn-ghost">Cancelar</Link>}
    </div>
  );
}
