import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useData } from "../context/DataContext";
import { Field } from "../components/Field";
import { STATUS_MOTORISTA, CATEGORIAS_CNH } from "../data/constants";

const VAZIO = { nome: "", cpf: "", cnh: "", telefone: "", status: "", categorias: [] };

function soNumeros(texto) {
  return (texto || "").replace(/\D/g, "");
}

function mascararCPF(valor) {
  const d = soNumeros(valor).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function mascararTelefone(valor) {
  const d = soNumeros(valor).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 3) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3, 7)}-${d.slice(7)}`;
}

function validarCnh(cnh) {
  return soNumeros(cnh).length === 11;
}

export function MotoristaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getMotorista, addMotorista, updateMotorista } = useData();

  const editando = Boolean(id);
  const existente = editando ? getMotorista(id) : null;

  const [form, setForm] = useState(() => {
    if (!existente) return VAZIO;
    const categorias = existente.categorias || (existente.categoria ? existente.categoria.split(",") : []);
    return { ...existente, categorias };
  });
  const [erros, setErros] = useState({});

  if (editando && !existente) {
    return (
      <div className="card card-pad">
        <p>Motorista não encontrado.</p>
        <button className="btn btn-outline mt" onClick={() => navigate("/motoristas")}>Voltar</button>
      </div>
    );
  }

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "cnh") {
      setForm((f) => ({ ...f, cnh: soNumeros(value) }));
      return;
    }

    if (name === "cpf") {
      setForm((f) => ({ ...f, cpf: mascararCPF(value) }));
      return;
    }

    if (name === "telefone") {
      setForm((f) => ({ ...f, telefone: mascararTelefone(value) }));
      return;
    }

    setForm((f) => ({ ...f, [name]: value }));
  }

  function validar() {
    const e = {};

    if (!form.nome.trim()) e.nome = "Informe o nome.";

    if (soNumeros(form.cpf).length !== 11)
      e.cpf = "CPF inválido. Deve ter 11 dígitos.";

    if (!validarCnh(form.cnh)) e.cnh = "CNH inválida. Deve ter 11 dígitos.";

    const categorias = form.categorias || [];
    if (categorias.length === 0)
      e.categoria = "Selecione pelo menos uma categoria.";

    if (soNumeros(form.telefone).length < 10)
      e.telefone = "Telefone inválido. Deve ter no mínimo 10 dígitos.";

    if (!form.status) e.status = "Selecione o status.";

    setErros(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validar()) return;

    const dados = {
      nome: form.nome.trim(),
      cpf: soNumeros(form.cpf),
      cnh: form.cnh.trim(),
      categoria: (form.categorias || []).join(","),
      telefone: soNumeros(form.telefone),
      status: form.status,
    };

    if (editando) {
      updateMotorista(id, dados);
      navigate("/motoristas", { state: { msg: `Motorista ${dados.nome} atualizado.` } });
    } else {
      addMotorista(dados);
      navigate("/motoristas", { state: { msg: `Motorista ${dados.nome} cadastrado.` } });
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <span className="kicker">Motoristas</span>
          <h1 className="page-title">{editando ? "Editar motorista" : "Novo motorista"}</h1>
        </div>
      </div>

      <form className="card card-pad" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <Field label="Nome" name="nome" value={form.nome} onChange={handleChange} error={erros.nome} required placeholder="Nome completo" />

          <Field label="CPF" name="cpf" value={form.cpf} onChange={handleChange} error={erros.cpf} required placeholder="000.000.000-00" />

          <Field label="Número da CNH" name="cnh" value={form.cnh} onChange={handleChange} error={erros.cnh} required placeholder="00000000000" />

          <Field label="Telefone" name="telefone" value={form.telefone} onChange={handleChange} error={erros.telefone} required placeholder="(99) 9 9999-9999" />

          <Field label="Status" name="status" as="select" options={STATUS_MOTORISTA} value={form.status} onChange={handleChange} error={erros.status} required />

          <div className="field">
            <label>Categorias da CNH <span className="req">*</span></label>
            <div className="row">
              {CATEGORIAS_CNH.map((cat) => (
                <label key={cat} className="cat-check">
                  <input
                    type="checkbox"
                    checked={(form.categorias || []).includes(cat)}
                    onChange={(e) => {
                      const atual = form.categorias || [];
                      const categorias = e.target.checked
                        ? [...atual, cat]
                        : atual.filter((c) => c !== cat);
                      setForm((f) => ({ ...f, categorias }));
                    }}
                  />
                  {cat}
                </label>
              ))}
            </div>
            {erros.categoria && <span className="field-error">{erros.categoria}</span>}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {editando ? "Salvar alterações" : "Cadastrar"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate("/motoristas")}>
            Cancelar
          </button>
        </div>
      </form>
    </>
  );
}