import { Icon } from "./Icons";

export function EmptyState({ icon = "inbox", titulo = "Nada por aqui", texto }) {
  return (
    <div className="empty">
      <span className="empty-ico">
        <Icon name={icon} size={34} strokeWidth={1.5} />
      </span>
      <h3>{titulo}</h3>
      {texto && <p>{texto}</p>}
    </div>
  );
}