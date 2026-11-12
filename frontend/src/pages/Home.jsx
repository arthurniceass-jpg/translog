import { Link } from "react-router-dom";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { Badge, statusVariant } from "../components/Badge";
import { Icon } from "../components/Icons";
import { Donut } from "../components/Charts";
import { CardsSkeleton, ErroCarga } from "../components/Loading";
import { EmptyState } from "../components/EmptyState";
import { ICONE_TIPO } from "../data/constants";
import { contarPor, dataBR, saudacao } from "../lib/format";

export function Home() {
  const { veiculos, motoristas, ocorrencias, carregando, erro, recarregar } = useData();
  const { usuario } = useAuth();

  const abertas = ocorrencias.filter((o) => o.status !== "Resolvida").length;
  const disponiveis = veiculos.filter((v) => v.status === "Disponível").length;
  const recentes = [...ocorrencias].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 5);
  const placaDe = (id) => veiculos.find((v) => String(v.id) === String(id))?.placa || "—";
  const primeiroNome = usuario?.nome?.split(" ")[0] || "";

  return (
    <>
      <section className="hero">
        <div>
          <h1>{saudacao()}, {primeiroNome}.</h1>
          <p>
            {carregando
              ? "Carregando os dados da operação..."
              : abertas > 0
                ? `Você tem ${abertas} ocorrência(s) em aberto e ${disponiveis} veículo(s) disponível(is) agora.`
                : `Operação em dia: nenhuma ocorrência em aberto e ${disponiveis} veículo(s) disponível(is).`}
          </p>
        </div>
        <Link to="/ocorrencias/nova" className="btn btn-primary"><Icon name="plus" size={17} /> Registrar ocorrência</Link>
      </section>

      {erro && <ErroCarga mensagem={erro} onTentar={recarregar} />}

      {carregando ? (
        <CardsSkeleton />
      ) : (
        <div className="stats-grid">
          <Link to="/veiculos" className="card stat">
            <span className="stat-ico blue"><Icon name="truck" size={22} /></span>
            <div><div className="stat-label">Veículos</div><div className="stat-value">{veiculos.length}</div></div>
          </Link>
          <Link to="/motoristas" className="card stat">
            <span className="stat-ico blue"><Icon name="users" size={22} /></span>
            <div><div className="stat-label">Motoristas</div><div className="stat-value">{motoristas.length}</div></div>
          </Link>
          <Link to="/veiculos" className="card stat">
            <span className="stat-ico green"><Icon name="check" size={22} /></span>
            <div><div className="stat-label">Veículos disponíveis</div><div className="stat-value">{disponiveis}</div></div>
          </Link>
          <Link to="/ocorrencias" className="card stat">
            <span className="stat-ico red"><Icon name="alert" size={22} /></span>
            <div><div className="stat-label">Ocorrências em aberto</div><div className="stat-value">{abertas}</div></div>
          </Link>
        </div>
      )}

      {!carregando && (
        <div className="grid-2 mt">
          <div className="card card-pad">
            <div className="card-head">
              <h2 className="card-title">Ocorrências recentes</h2>
              <Link to="/historico" className="link-more">Ver histórico <Icon name="arrow" size={15} /></Link>
            </div>
            {recentes.length === 0 ? (
              <EmptyState icon="alert" titulo="Sem ocorrências" texto="Quando houver registros, eles aparecem aqui." />
            ) : (
              <div className="list">
                {recentes.map((o) => (
                  <Link key={o.id} to={`/ocorrencias/${o.id}`} className="list-item">
                    <span className={"type-ico " + o.tipo}><Icon name={ICONE_TIPO[o.tipo] || "inbox"} size={18} /></span>
                    <div className="grow">
                      <strong>{o.titulo}</strong>
                      <small>{placaDe(o.veiculoId)} · {dataBR(o.data)}</small>
                    </div>
                    <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="card card-pad">
            <div className="card-head">
              <h2 className="card-title">Frota agora</h2>
              <Link to="/dashboard" className="link-more">Dashboard <Icon name="arrow" size={15} /></Link>
            </div>
            <Donut dados={contarPor(veiculos, "status")} rotuloCentro="veículos" />
          </div>
        </div>
      )}
    </>
  );
}
