import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import { EmptyState } from "../components/EmptyState";
import { Badge, statusVariant } from "../components/Badge";

const STATUS = ["Aberta", "Em análise", "Resolvida"];
const TIPOS = ["Manutenção", "Acidente", "Atraso", "Outro"];

export function Historico() {
  const { ocorrencias, veiculos } = useData();
  const navigate = useNavigate();

  const [status, setStatus] = useState("");
  const [tipo, setTipo] = useState("");
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");

  const placaDe = (veiculoId) => veiculos.find((v) => v.id === veiculoId)?.placa || "—";

  const lista = ocorrencias
    .filter((o) => {
      const casaStatus = !status || o.status === status;
      const casaTipo = !tipo || o.tipo === tipo;
      const casaDe = !de || o.data >= de;
      const casaAte = !ate || o.data <= ate;
      return casaStatus && casaTipo && casaDe && casaAte;
    })
    .sort((a, b) => b.data.localeCompare(a.data)); // mais recentes primeiro

  function limpar() {
    setStatus(""); setTipo(""); setDe(""); setAte("");
  }

  return (
    <>
      <div className="page-head">
        <div>
          <span className="kicker">Relatório</span>
          <h1 className="page-title">Histórico de ocorrências</h1>
          <p className="page-sub">Consulte o histórico com filtros por status, tipo e período.</p>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: "1.25rem" }}>
        <div className="form-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
          <div className="field">
            <label>Status</label>
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos</option>
              {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Tipo</label>
            <select className="select" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="">Todos</option>
              {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="field">
            <label>De</label>
            <input type="date" className="input" value={de} onChange={(e) => setDe(e.target.value)} />
          </div>
          <div className="field">
            <label>Até</label>
            <input type="date" className="input" value={ate} onChange={(e) => setAte(e.target.value)} />
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={limpar}>Limpar filtros</button>
      </div>

      <div className="card">
        {lista.length === 0 ? (
          <EmptyState emoji="🗂️" titulo="Nenhuma ocorrência no período" texto="Ajuste os filtros para ver o histórico." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Título</th>
                  <th>Tipo</th>
                  <th>Veículo</th>
                  <th>Status</th>
                  <th className="text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((o) => (
                  <tr key={o.id}>
                    <td>{new Date(o.data + "T00:00:00").toLocaleDateString("pt-BR")}</td>
                    <td><strong>{o.titulo}</strong></td>
                    <td>{o.tipo}</td>
                    <td>{placaDe(o.veiculoId)}</td>
                    <td><Badge variant={statusVariant(o.status)}>{o.status}</Badge></td>
                    <td className="text-right">
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/ocorrencias/${o.id}`)}>Detalhes</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="muted mt">{lista.length} registro(s) encontrado(s)</p>
    </>
  );
}
