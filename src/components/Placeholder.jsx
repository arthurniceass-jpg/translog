import { Link } from "react-router-dom";

/**
 * Página placeholder — usada nos módulos que ainda serão implementados
 * pelos colegas (Motoristas, Ocorrências, Dashboard/Histórico).
 * Cada responsável substitui o conteúdo da sua página seguindo o
 * módulo Veículos como referência.
 */
export function Placeholder({ titulo, dono, descricao }) {
  return (
    <>
      <div className="page-head">
        <div>
          <span className="kicker">Módulo</span>
          <h1 className="page-title">{titulo}</h1>
          {descricao && <p className="page-sub">{descricao}</p>}
        </div>
      </div>
      <div className="card card-pad empty">
        <div className="empty-emoji">🚧</div>
        <h3>Em construção</h3>
        <p>
          Este módulo será implementado por <strong>{dono}</strong>, seguindo o
          módulo <Link to="/veiculos" style={{ color: "var(--primary)", fontWeight: 700 }}>Veículos</Link> como referência.
        </p>
      </div>
    </>
  );
}
