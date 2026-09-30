import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useData } from "../context/DataContext";
import { Field } from "../components/Field";

const STATUS = ["Disponível", "Em viagem", "Inativo"];
const CATEGORIAS = ["A", "B", "C", "D", "E"];

const VAZIO = { nome: "", cpf: "", cnh: "", categoria: "", telefone: "", status: "" };

export function MotoristaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getMotorista, addMotorista, updateMotorista } = useData();

  const editando = Boolean(id);
  const existente = editando ? getMotorista(id) : null;

  const [form, setForm] = useState(existente ? { ...existente } : VAZIO);
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
    setForm((f) => ({ ...f, [name]: value }));
  }

  function validar() {
    const e = {};
    if (!form.nome.trim()) e.nome = "Informe o nome.";
    if (!form.cpf.trim()) e.cpf = "Informe o CPF.";
    if (!form.cnh.trim()) e.cnh = "Informe a CNH.";
    if (!form.categoria) e.categoria = "Selecione a categoria.";
    if (!form.telefone.trim()) e.telefone = "Informe o telefone.";
    if (!form.status) e.status = "Selecione o status.";
    setErros(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validar()) return;

    const dados = {
      nome: form.nome.trim(),
      cpf: form.cpf.trim(),
      cnh: form.cnh.trim(),
      categoria: form.categoria,
      telefone: form.telefone.trim(),
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
          <Field label="CNH" name="cnh" value={form.cnh} onChange={handleChange} error={erros.cnh} required placeholder="Número da CNH" />
          <Field label="Categoria da CNH" name="categoria" as="select" options={CATEGORIAS} value={form.categoria} onChange={handleChange} error={erros.categoria} required />
          <Field label="Telefone" name="telefone" value={form.telefone} onChange={handleChange} error={erros.telefone} required placeholder="(81) 99999-0000" />
          <Field label="Status" name="status" as="select" options={STATUS} value={form.status} onChange={handleChange} error={erros.status} required />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">{editando ? "Salvar alterações" : "Cadastrar"}</button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate("/motoristas")}>Cancelar</button>
        </div>
      </form>
    </>
  );
}
