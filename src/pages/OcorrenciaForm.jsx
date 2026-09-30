import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useData } from "../context/DataContext";
import { Field } from "../components/Field";

const STATUS = ["Aberta", "Em análise", "Resolvida"];
const TIPOS = ["Manutenção", "Acidente", "Atraso", "Outro"];

const hoje = new Date().toISOString().slice(0, 10);
const VAZIO = { titulo: "", tipo: "", data: hoje, veiculoId: "", motoristaId: "", status: "Aberta", descricao: "" };

export function OcorrenciaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOcorrencia, addOcorrencia, updateOcorrencia, veiculos, motoristas } = useData();

  const editando = Boolean(id);
  const existente = editando ? getOcorrencia(id) : null;

  const [form, setForm] = useState(existente ? { ...existente } : VAZIO);
  const [erros, setErros] = useState({});

  if (editando && !existente) {
    return (
      <div className="card card-pad">
        <p>Ocorrência não encontrada.</p>
        <button className="btn btn-outline mt" onClick={() => navigate("/ocorrencias")}>Voltar</button>
      </div>
    );
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function validar() {
    const e = {};
    if (!form.titulo.trim()) e.titulo = "Informe o título.";
    if (!form.tipo) e.tipo = "Selecione o tipo.";
    if (!form.data) e.data = "Informe a data.";
    if (!form.veiculoId) e.veiculoId = "Selecione o veículo.";
    if (!form.status) e.status = "Selecione o status.";
    if (!form.descricao.trim()) e.descricao = "Descreva a ocorrência.";
    setErros(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validar()) return;

    const dados = {
      titulo: form.titulo.trim(),
      tipo: form.tipo,
      data: form.data,
      veiculoId: form.veiculoId,
      motoristaId: form.motoristaId || null,
      status: form.status,
      descricao: form.descricao.trim(),
    };

    if (editando) {
      updateOcorrencia(id, dados);
      navigate("/ocorrencias", { state: { msg: `Ocorrência "${dados.titulo}" atualizada.` } });
    } else {
      addOcorrencia(dados);
      navigate("/ocorrencias", { state: { msg: `Ocorrência "${dados.titulo}" registrada.` } });
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <span className="kicker">Ocorrências</span>
          <h1 className="page-title">{editando ? "Editar ocorrência" : "Nova ocorrência"}</h1>
        </div>
      </div>

      <form className="card card-pad" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <Field label="Título" name="titulo" value={form.titulo} onChange={handleChange} error={erros.titulo} required placeholder="Ex.: Colisão no pátio" />
          <Field label="Tipo" name="tipo" as="select" options={TIPOS} value={form.tipo} onChange={handleChange} error={erros.tipo} required />
          <Field label="Data" name="data" type="date" value={form.data} onChange={handleChange} error={erros.data} required />
          <Field label="Status" name="status" as="select" options={STATUS} value={form.status} onChange={handleChange} error={erros.status} required />

          {/* Veículo relacionado (obrigatório) */}
          <div className="field">
            <label htmlFor="veiculoId">Veículo relacionado <span className="req">*</span></label>
            <select id="veiculoId" name="veiculoId" value={form.veiculoId} onChange={handleChange} className={"select" + (erros.veiculoId ? " invalid" : "")}>
              <option value="">Selecione...</option>
              {veiculos.map((v) => <option key={v.id} value={v.id}>{v.placa} — {v.marca} {v.modelo}</option>)}
            </select>
            {erros.veiculoId && <span className="field-error">{erros.veiculoId}</span>}
          </div>

          {/* Motorista relacionado (opcional) */}
          <div className="field">
            <label htmlFor="motoristaId">Motorista relacionado</label>
            <select id="motoristaId" name="motoristaId" value={form.motoristaId || ""} onChange={handleChange} className="select">
              <option value="">Nenhum</option>
              {motoristas.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </div>
        </div>

        <Field label="Descrição" name="descricao" as="textarea" value={form.descricao} onChange={handleChange} error={erros.descricao} required placeholder="Descreva o que aconteceu..." />

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">{editando ? "Salvar alterações" : "Registrar"}</button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate("/ocorrencias")}>Cancelar</button>
        </div>
      </form>
    </>
  );
}
