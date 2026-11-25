import { useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "../context/data";
import { PageHeader } from "../components/PageHeader";
import { IndicadoresOperacionais } from "../components/IndicadoresOperacionais";
import { Icon } from "../components/Icons";
import { Donut, HBars, ColBars } from "../components/Charts";
import { CardsSkeleton, ErroCarga } from "../components/Loading";
import { contarPor } from "../lib/format";

function serieMensal(ocorrencias, hoje) {
  const totais = new Map();
  for (const { data } of ocorrencias) {
    const mes = data.slice(0, 7);
    totais.set(mes, (totais.get(mes) || 0) + 1);
  }
  return Array.from({ length: 6 }, (_, indice) => {
    const mes = new Date(hoje.getFullYear(), hoje.getMonth() - (5 - indice), 1);
    const chave = `${mes.getFullYear()}-${String(mes.getMonth() + 1).padStart(2, "0")}`;
    return {
      rotulo: mes.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
      valor: totais.get(chave) || 0,
    };
  });
}

function Painel({ titulo, descricao, indisponivel, children }) {
  return (
    <section className="card card-pad chart-panel">
      <h2 className="card-title">{titulo}</h2>
      {descricao && <p className="chart-description">{descricao}</p>}
      <div className="chart-body">
        {indisponivel ? <p className="muted">Dados indisponíveis.</p> : children}
      </div>
    </section>
  );
}

export function Dashboard() {
  const { veiculos, motoristas, ocorrencias, carregando, erro, recarregar, falhas } = useData();

  const [hoje] = useState(() => new Date());
  const frotaIndisponivel = falhas.includes("veiculos");
  const motoristasIndisponiveis = falhas.includes("motoristas");
  const ocorrenciasIndisponiveis = falhas.includes("ocorrencias");
  const frota = contarPor(veiculos, "status");
  const porStatus = contarPor(ocorrencias, "status");
  const resolvidas = porStatus.Resolvida || 0;
  const pendentes = ocorrencias.length - resolvidas;
  const taxa = ocorrencias.length ? Math.round((resolvidas / ocorrencias.length) * 100) : null;
  const placas = new Map(veiculos.map((v) => [String(v.id), v.placa]));

  const porVeiculo = contarPor(ocorrencias.map((o) => ({
    placa: placas.get(String(o.veiculoId)) || `Veículo #${o.veiculoId}`,
  })), "placa");
  const topVeiculos = Object.fromEntries(Object.entries(porVeiculo).sort((a, b) => b[1] - a[1]).slice(0, 5));
  const serie = serieMensal(ocorrencias, hoje);

  return (
    <>
      <PageHeader titulo="Dashboard" sub="Compare a atividade da frota e acompanhe a resolução de ocorrências.">
        <Link to="/historico" className="btn btn-outline"><Icon name="history" size={17} /> Ver histórico</Link>
      </PageHeader>

      {erro && <ErroCarga mensagem={erro} onTentar={recarregar} />}

      {carregando ? <CardsSkeleton /> : (
        <>
          <div className="stats-grid">
            <Link to="/veiculos?status=Em+uso" className="stat">
              <span className="stat-label">Veículos em operação</span>
              <strong className="stat-value">{frotaIndisponivel ? "—" : <>{frota["Em uso"] || 0}<span className="stat-note"> / {veiculos.length}</span></>}</strong>
            </Link>
            <Link to="/motoristas" className="stat">
              <span className="stat-label">Motoristas cadastrados</span>
              <strong className="stat-value">{motoristasIndisponiveis ? "—" : motoristas.length}</strong>
            </Link>
            <Link to="/ocorrencias?status=pendentes" className="stat">
              <span className="stat-label">Ocorrências pendentes</span>
              <strong className={pendentes > 0 ? "stat-value stat-attention" : "stat-value"}>{ocorrenciasIndisponiveis ? "—" : pendentes}</strong>
            </Link>
            <div className="stat">
              <span className="stat-label">Taxa de resolução</span>
              <strong className="stat-value">{taxa === null ? "—" : `${taxa}%`}</strong>
            </div>
          </div>

          <IndicadoresOperacionais />

          <div className="overview-grid">
            <Painel titulo="Ocorrências por mês" descricao="Últimos seis meses" indisponivel={ocorrenciasIndisponiveis}>
              <ColBars serie={serie} />
            </Painel>
            <Painel titulo="Ocorrências por tipo" indisponivel={ocorrenciasIndisponiveis}>
              <HBars dados={contarPor(ocorrencias, "tipo")} />
            </Painel>
          </div>

          <div className="grid-eq mt">
            <Painel titulo="Veículos por status" indisponivel={frotaIndisponivel}>
              <Donut dados={frota} rotuloCentro="veículos" />
            </Painel>
            <Painel titulo="Motoristas por status" indisponivel={motoristasIndisponiveis}>
              <Donut dados={contarPor(motoristas, "status")} rotuloCentro="motoristas" />
            </Painel>
            <Painel titulo="Ocorrências por status" indisponivel={ocorrenciasIndisponiveis}>
              <Donut dados={porStatus} rotuloCentro="ocorrências" />
            </Painel>
            <Painel titulo="Veículos com mais ocorrências" indisponivel={frotaIndisponivel || ocorrenciasIndisponiveis}>
              <HBars dados={topVeiculos} />
            </Painel>
          </div>
        </>
      )}
    </>
  );
}
