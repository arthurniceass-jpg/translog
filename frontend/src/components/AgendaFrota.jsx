import { Link } from "react-router-dom";
import { dataHoraLocal, nomeDe, placaDe, STATUS_VIAGEM, viagemAtrasada } from "../lib/operacao";
import { Badge } from "./Badge";
import { Icon } from "./Icons";
import { TableSkeleton } from "./Loading";

export function AgendaFrota({ dados, agora }) {
  const dia = agora.slice(0, 10);
  const viagens = dados.viagens
    .filter((v) => v.status !== "CANCELADA" && (v.partida.startsWith(dia) || v.status === "EM_ANDAMENTO"))
    .sort((a, b) => Number(viagemAtrasada(b, agora)) - Number(viagemAtrasada(a, agora)) || a.partida.localeCompare(b.partida));

  return (
    <section className="card overview-panel">
      <div className="card-head">
        <h2 className="card-title">Agenda do dia</h2>
        <Link to="/viagens" className="link-more">Ver viagens <Icon name="arrow" size={15} /></Link>
      </div>
      {dados.carregandoOperacao ? <TableSkeleton linhas={3} />
        : dados.falhas.includes("viagens") ? <p className="panel-message">Agenda de viagens indisponível.</p>
        : viagens.length === 0 ? <p className="panel-message">Nenhuma viagem para hoje.</p> : (
          <ul className="overview-events">
            {viagens.slice(0, 4).map((viagem) => {
              const atrasada = viagemAtrasada(viagem, agora);
              return (
                <li key={viagem.id}>
                  <Link className="list-item" to={`/viagens?editar=${viagem.id}`}>
                    <div className="grow">
                      <strong>{viagem.origem} → {viagem.destino}</strong>
                      <small>{placaDe(dados.veiculos, viagem.veiculoId)} · {nomeDe(dados.motoristas, viagem.motoristaId)}</small>
                      <small>Chegada prevista em {dataHoraLocal(viagem.chegadaPrevista)}</small>
                    </div>
                    <Badge variant={atrasada ? "danger" : viagem.status === "CONCLUIDA" ? "success" : "primary"}>{atrasada ? "Atrasada" : STATUS_VIAGEM[viagem.status]}</Badge>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
    </section>
  );
}
