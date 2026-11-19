import { Link } from "react-router-dom";
import { Badge } from "./Badge";
import { statusVariant } from "./badgeVariants";
import { EmptyState } from "./EmptyState";
import { Icon } from "./Icons";
import { ICONE_TIPO } from "../data/constants";
import { dataBR } from "../lib/format";

/** Tabela compacta das ocorrências de um veículo ou motorista (mais recentes primeiro). */
export function OcorrenciasVinculadas({ ocorrencias }) {
  if (ocorrencias.length === 0) {
    return <EmptyState icon="check" titulo="Nenhuma ocorrência" texto="Não há ocorrências registradas para este cadastro." />;
  }

  const lista = [...ocorrencias].sort((a, b) => b.data.localeCompare(a.data));
  return (
    <div className="table-wrap">
      <table className="table stack">
        <thead>
          <tr>
            <th>Ocorrência</th>
            <th>Data</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {lista.map((o) => (
            <tr key={o.id}>
              <td className="cell-first" data-label="Ocorrência">
                <div className="cell-main">
                  <span className={"type-ico " + o.tipo}><Icon name={ICONE_TIPO[o.tipo] || "inbox"} size={18} /></span>
                  <div>
                    <Link to={`/ocorrencias/${o.id}`}><strong>{o.titulo}</strong></Link>
                    <small>{o.tipo}</small>
                  </div>
                </div>
              </td>
              <td data-label="Data" className="muted">{dataBR(o.data)}</td>
              <td data-label="Status"><Badge variant={statusVariant(o.status)}>{o.status}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
