import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useData } from "../context/data";
import { useToast } from "../context/toast";
import { PageHeader } from "../components/PageHeader";
import { FormActions } from "../components/FormActions";
import { useErrosCampos } from "../hooks/useErrosCampos";
import { FormGate } from "../components/FormGate";
import { Field } from "../components/Field";
import { STATUS_MOTORISTA, CATEGORIAS_CNH } from "../data/constants";
import { soNumeros, mascararCPF, mascararTelefone } from "../lib/format";

const VAZIO = { nome: "", cpf: "", cnh: "", telefone: "", status: "Disponível", categorias: [] };

export function MotoristaForm() {
  const { id } = useParams();
  const { state } = useLocation();
  const voltar = state?.origem || "/motoristas";
  const { getMotorista } = useData();
  const existente = id ? getMotorista(id) : null;

  return (
    <FormGate recurso="motoristas" editando={Boolean(id)} existente={existente} voltar={voltar} rotulo="Motorista">
      <Formulario id={id} existente={existente} voltar={voltar} />
    </FormGate>
  );
}

function Formulario({ id, existente, voltar }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { addMotorista, updateMotorista } = useData();
  const editando = Boolean(id);

  const [form, setForm] = useState(
    existente
      ? { ...existente, cpf: mascararCPF(existente.cpf), telefone: mascararTelefone(existente.telefone), categorias: existente.categorias || [] }
      : VAZIO,
  );
  const { erros, mostrar, limpar } = useErrosCampos();
  const [salvando, setSalvando] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    limpar(name);
    if (name === "cnh") return setForm((f) => ({ ...f, cnh: soNumeros(value).slice(0, 11) }));
    if (name === "cpf") return setForm((f) => ({ ...f, cpf: mascararCPF(value) }));
    if (name === "telefone") return setForm((f) => ({ ...f, telefone: mascararTelefone(value) }));
    setForm((f) => ({ ...f, [name]: value }));
  }

  function alternarCategoria(cat, marcada) {
    limpar("categorias");
    setForm((f) => ({
      ...f,
      categorias: marcada ? [...f.categorias, cat].sort() : f.categorias.filter((c) => c !== cat),
    }));
  }

  function validar(formulario) {
    const e = {};
    if (!form.nome.trim()) e.nome = "Informe o nome.";
    if (soNumeros(form.cpf).length !== 11) e.cpf = "CPF inválido. Deve ter 11 dígitos.";
    if (soNumeros(form.cnh).length !== 11) e.cnh = "CNH inválida. Deve ter 11 dígitos.";
    if (form.categorias.length === 0) e.categorias = "Selecione pelo menos uma categoria.";
    const tel = soNumeros(form.telefone).length;
    if (tel < 10 || tel > 11) e.telefone = "Telefone inválido. Use DDD + número.";
    if (!form.status) e.status = "Selecione o status.";
    mostrar(e, formulario);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const formulario = ev.currentTarget;
    if (salvando || !validar(formulario)) return;
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
      navigate(voltar, { replace: true });
    } catch (err) {
      mostrar(err.fieldErrors || {}, formulario);
      toast.erro(err.message);
      setSalvando(false);
    }
  }

  return (
    <>
      <PageHeader
        titulo={editando ? "Editar motorista" : "Novo motorista"}
        sub={editando ? `Atualize os dados de ${existente.nome}.` : "Cadastre um novo condutor da empresa."}
        voltar={{ to: voltar, label: "Motoristas" }}
      />

      <form className="card card-pad form-card" aria-busy={salvando} onSubmit={handleSubmit} noValidate>
        <h2 className="form-section">Dados pessoais</h2>
        <div className="form-grid">
          <Field full label="Nome completo" name="nome" value={form.nome} onChange={handleChange} error={erros.nome} required placeholder="Nome e sobrenome" />
          <Field label="CPF" name="cpf" mono inputMode="numeric" value={form.cpf} onChange={handleChange} error={erros.cpf} required placeholder="000.000.000-00" />
          <Field label="Telefone" name="telefone" inputMode="tel" value={form.telefone} onChange={handleChange} error={erros.telefone} required placeholder="(81) 99999-9999" />
        </div>

        <h2 className="form-section">Habilitação</h2>
        <div className="form-grid">
          <Field label="Número da CNH" name="cnh" mono inputMode="numeric" value={form.cnh} onChange={handleChange} error={erros.cnh} required placeholder="00000000000" />
          <Field label="Status" name="status" as="select" options={STATUS_MOTORISTA} value={form.status} onChange={handleChange} error={erros.status} required />
          <div className="field full">
            <span className="label" id="label-categorias">Categorias da CNH <span className="req">*</span></span>
            <div className="row" role="group" aria-labelledby="label-categorias">
              {CATEGORIAS_CNH.map((cat) => {
                const marcada = form.categorias.includes(cat);
                return (
                  <label key={cat} className={"cat-check" + (marcada ? " on" : "")}>
                    <input type="checkbox" aria-invalid={Boolean(erros.categorias)} aria-describedby={erros.categorias ? "erro-categorias" : undefined} checked={marcada} onChange={(e) => alternarCategoria(cat, e.target.checked)} />
                    {cat}
                  </label>
                );
              })}
            </div>
            {erros.categorias && <span className="field-error" id="erro-categorias">{erros.categorias}</span>}
          </div>
        </div>

        <FormActions voltar={voltar} salvando={salvando} rotulo={editando ? "Salvar alterações" : "Cadastrar motorista"} />
      </form>
    </>
  );
}
