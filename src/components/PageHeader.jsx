import { Link } from "react-router-dom";
import { Icon } from "./Icons";

/** Cabeçalho padrão de página: voltar (opcional), título, subtítulo e ações à direita. */
export function PageHeader({ titulo, sub, voltar, children }) {
  return (
    <div className="page-head">
      <div>
        {voltar && (
          <Link to={voltar.to} className="back-link">
            <Icon name="arrow" size={15} /> {voltar.label}
          </Link>
        )}
        <h1 className="page-title">{titulo}</h1>
        {sub && <p className="page-sub">{sub}</p>}
      </div>
      {children && <div className="row">{children}</div>}
    </div>
  );
}
