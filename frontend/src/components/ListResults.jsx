import { EmptyState } from "./EmptyState";
import { ErroCarga, TableSkeleton } from "./Loading";

export function ListResults({ total, quantidade, singular, plural, icon, carregando, erro, onTentar, vazio, onLimpar, children }) {
  if (carregando) return <div className="card"><TableSkeleton /></div>;
  if (erro) return <ErroCarga mensagem={erro} onTentar={onTentar} />;

  return (
    <section className="card results-panel" aria-label={`Resultados de ${plural}`}>
      {total === 0 ? vazio : (
        <>
          {quantidade > 0 ? children : (
            <EmptyState icon={icon} titulo="Nenhum resultado" texto="Altere a busca ou os filtros para encontrar registros.">
              <button type="button" className="btn btn-outline" onClick={onLimpar}>Limpar filtros</button>
            </EmptyState>
          )}
          <p className="table-foot" role="status">
            {quantidade === total ? `${total} ${total === 1 ? singular : plural}` : `${quantidade} de ${total} ${plural}`}
          </p>
        </>
      )}
    </section>
  );
}
