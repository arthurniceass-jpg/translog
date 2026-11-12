import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { PageHeader } from "../components/PageHeader";
import { FormGate } from "../components/FormGate";
import { Field } from "../components/Field";
import { STATUS_MOTORISTA, CATEGORIAS_CNH } from "../data/constants";
import { soNumeros, mascararCPF, mascararTelefone } from "../lib/format";

const VAZIO = { nome: "", cpf: "", cnh: "", telefone: "", status: "Disponível", categorias: [] };

export function MotoristaForm() {
  const { id } = useParams();
  const { getMotorista } = useData();
  const existente = id ? getMotorista(id) : null;

  return (
    <FormGate editando={Boolean(id)} existente={existente} voltar="/motoristas" rotulo="Motorista">
      <Formulario id={id} existente={existente} />
    </FormGate>
  );
}

function Formulario({ id, existente }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { addMotorista, updateMotorista } = useData();
  const editando = Boolean(id);

  const [form, setForm] = useState(
    existente
      ? { ...existente, cpf: mascararCPF(existente.cpf), telefone: mascararTelefone(existente.telefone), categorias: existente.categorias || [] }
      : VAZIO,
  );
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "cnh") return setForm((f) => ({ ...f, cnh: soNumeros(value).slice(0, 11) }));
    if (name === "cpf") return setForm((f) => ({ ...f, cpf: mascararCPF(value) }));
    if (name === "telefone") return setForm((f) => ({ ...f, telefone: mascararTelefone(value) }));
    setForm((f) => ({ ...f, [name]: value }));
  }

  function alternarCategoria(cat, marcada) {
    setForm((f) => ({
      ...f,
      categorias: marcada ? [...f.categorias, cat].sort() : f.categorias.filter((c) => c !== cat),
    }));
  }

  function validar() {
    const e = {};
    if (!form.nome.trim()) e.nome = "Informe o nome.";
    if (soNumeros(form.cpf).length !== 11) e.cpf = "CPF inválido. Deve ter 11 dígitos.";
    if (soNumeros(form.cnh).length !== 11) e.cnh = "CNH inválida. Deve ter 11 dígitos.";
    if (form.categorias.length === 0) e.categorias = "Selecione pelo menos uma categoria.";
    const tel = soNumeros(form.telefone).length;
    if (tel < 10 || tel > 11) e.telefone = "Telefone inválido. Use DDD + número.";
    if (!form.status) e.status = "Selecione o status.";
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validar()) return;
    const dados = {
      nome: form.nome.trim(),
      cpf: soNumeros(form.cpf),
      cnh: soNumeros(form.cnh),
      categorias: form.categorias,
      telefone: soNumeros(form.telefone),
      status: form.status,
    };
    setSalvando(true);
    try {
      if (editando) await updateMotorista(id, dados);
      else await addMotorista(dados);
      toast.sucesso(`Motorista ${dados.nome} ${editando ? "atualizado" : "cadastrado"}.`);
      navigate("/motoristas");
    } catch (err) {
      setErros(err.fieldErrors || {});
      toast.erro(err.message);
      setSalvando(false);
    }
  }

  return (
    <>
      <PageHeader
        titulo={editando ? "Editar motorista" : "Novo motorista"}
        sub={editando ? `Atualize os dados de ${existente.nome}.` : "Cadastre um novo condutor da empresa."}
        voltar={{ to: "/motoristas", label: "Motoristas" }}
      />

      <form className="card card-pad form-card" onSubmit={handleSubmit} noValidate>
        <div className="form-section">Dados pessoais</div>
        <div className="form-grid">
          <Field full label="Nome completo" name="nome" value={form.nome} onChange={handleChange} error={erros.nome} required placeholder="Nome e sobrenome" />
          <Field label="CPF" name="cpf" mono inputMode="numeric" value={form.cpf} onChange={handleChange} error={erros.cpf} required placeholder="000.000.000-00" />
          <Field label="Telefone" name="telefone" inputMode="tel" value={form.telefone} onChange={handleChange} error={erros.telefone} required placeholder="(81) 99999-9999" />
        </div>

        <div className="form-section">Habilitação</div>
        <div className="form-grid">
          <Field label="Número da CNH" name="cnh" mono inputMode="numeric" value={form.cnh} onChange={handleChange} error={erros.cnh} required placeholder="00000000000" />
          <Field label="Status" name="status" as="select" options={STATUS_MOTORISTA} value={form.status} onChange={handleChange} error={erros.status} required />
          <div className="field full">
            <span className="label">Categorias da CNH <span className="req">*</span></span>
            <div className="row" role="group" aria-label="Categorias da CNH">
              {CATEGORIAS_CNH.map((cat) => {
                const marcada = form.categorias.includes(cat);
                return (
                  <label key={cat} className={"cat-check" + (marcada ? " on" : "")}>
                    <input type="checkbox" checked={marcada} onChange={(e) => alternarCategoria(cat, e.target.checked)} />
                    {cat}
                  </label>
                );
              })}
            </div>
            {erros.categorias && <span className="field-error">{erros.categorias}</span>}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={salvando}>
            {salvando && <span className="spinner" />} {editando ? "Salvar alterações" : "Cadastrar motorista"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate("/motoristas")}>Cancelar</button>
        </div>
      </form>
    </>
  );
}
