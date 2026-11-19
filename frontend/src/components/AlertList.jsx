import { Link } from "react-router-dom";
import { Badge } from "./Badge";
import { Icon } from "./Icons";

export function AlertList({ alertas }) {
  if (!alertas.length) return <p className="panel-message">Nenhuma pendência com esses filtros.</p>;

  return (
    <ul className="overview-events">
      {alertas.map(({ chave, tipo, titulo, texto, critico, to }) => (
        <li key={chave}>
          <Link to={to} state={{ origem: "/alertas" }} className="list-item">
            <div className="grow"><strong>{titulo}</strong><small>{tipo} · {texto}</small></div>
            <Badge variant={critico ? "danger" : "warn"}>{critico ? "Prioritário" : "Atenção"}</Badge>
            <Icon name="arrow" size={15} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
