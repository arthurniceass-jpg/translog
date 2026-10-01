import { Icon } from "./Icons";

/** Mensagem condicional para listas vazias / sem resultados. */
export function EmptyState({ icon = "inbox", titulo = "Nada por aqui", texto }) {
  return (
    <div className="empty">
      <Icon name={icon} size={44} className="empty-ico" strokeWidth={1.5} />
      <h3>{titulo}</h3>
      {texto && <p>{texto}</p>}
    </div>
  );
}
