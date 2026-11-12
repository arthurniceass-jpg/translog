import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { PageHeader } from "../components/PageHeader";
import { FormGate } from "../components/FormGate";
import { Field } from "../components/Field";
import { STATUS_OCORRENCIA, TIPOS_OCORRENCIA } from "../data/constants";

const hoje = new Date().toISOString().slice(0, 10);
const VAZIO = { titulo: "", tipo: "", data: hoje, veiculoId: "", motoristaId: "", status: "Aberta", descricao: "" };

export function OcorrenciaForm() {
  const { id } = useParams();
  const { getOcorrencia } = useData();
  const existente = id ? getOcorrencia(id) : null;

  return (
    <FormGate editando={Boolean(id)} existente={existente} voltar="/ocorrencias" rotulo="Ocorrência">
      <Formulario id={id} existente={existente} />
    </FormGate>
  );
}

function Formulario({ id, existente }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { addOcorrencia, updateOcorrencia, veiculos, motoristas } = useData();
  const editando = Boolean(id);

  const [form, setForm] = useState(
    existente ? { ...existente, veiculoId: String(existente.veiculoId), motoristaId: existente.motoristaId ? String(existente.motoristaId) : "" } : VAZIO,
  );
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

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

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validar()) return;
    const dados = {
      titulo: form.titulo.trim(),
      tipo: form.tipo,
      data: form.data,
      veiculoId: Number(form.veiculoId),
      motoristaId: form.motoristaId ? Number(form.motoristaId) : null,
      status: form.status,
      descricao: form.descricao.trim(),
    };
    setSalvando(true);
    try {
      if (editando) await updateOcorrencia(id, dados);
      else await addOcorrencia(dados);
      toast.sucesso(`Ocorrência "${dados.titulo}" ${editando ? "atualizada" : "registrada"}.`);
      navigate("/ocorrencias");
    } catch (err) {
      setErros(err.fieldErrors || {});
      toast.erro(err.message);
      setSalvando(false);
    }
  }

  return (
    <>
      <PageHeader
        titulo={editando ? "Editar ocorrência" : "Nova ocorrência"}
        sub={editando ? "Atualize as informações da ocorrência." : "Registre o que aconteceu para acompanhar até a resolução."}
        voltar={{ to: "/ocorrencias", label: "Ocorrências" }}
      />

      <form className="card card-pad form-card" onSubmit={handleSubmit} noValidate>
        <div className="form-section">O que aconteceu</div>
        <div className="form-grid">
          <Field full label="Título" name="titulo" value={form.titulo} onChange={handleChange} error={erros.titulo} required placeholder="Ex.: Colisão no pátio" />
          <Field label="Tipo" name="tipo" as="select" options={TIPOS_OCORRENCIA} value={form.tipo} onChange={handleChange} error={erros.tipo} required />
          <Field label="Data" name="data" type="date" value={form.data} onChange={handleChange} error={erros.data} required />
          <Field full label="Descrição" name="descricao" as="textarea" value={form.descricao} onChange={handleChange} error={erros.descricao} required placeholder="Descreva o que aconteceu, local e providências..." />
        </div>

        <div className="form-section">Envolvidos</div>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="veiculoId">Veículo <span className="req">*</span></label>
            <select id="veiculoId" name="veiculoId" value={form.veiculoId} onChange={handleChange} className={"select" + (erros.veiculoId ? " invalid" : "")}>
              <option value="">Selecione...</option>
              {veiculos.map((v) => <option key={v.id} value={v.id}>{v.placa} — {v.marca} {v.modelo}</option>)}
            </select>
            {erros.veiculoId && <span className="field-error">{erros.veiculoId}</span>}
          </div>
          <div className="field">
            <label htmlFor="motoristaId">Motorista</label>
            <select id="motoristaId" name="motoristaId" value={form.motoristaId} onChange={handleChange} className="select">
              <option value="">Nenhum</option>
              {motoristas.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </div>
          <Field label="Status" name="status" as="select" options={STATUS_OCORRENCIA} value={form.status} onChange={handleChange} error={erros.status} required />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={salvando}>
            {salvando && <span className="spinner" />} {editando ? "Salvar alterações" : "Registrar ocorrência"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate("/ocorrencias")}>Cancelar</button>
        </div>
      </form>
    </>
  );
}
