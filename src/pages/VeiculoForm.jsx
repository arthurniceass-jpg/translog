import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useData } from "../context/DataContext";
import { Field } from "../components/Field";

const STATUS = ["Disponível", "Em uso", "Manutenção"];
const anoAtual = new Date().getFullYear();

const VAZIO = { placa: "", marca: "", modelo: "", ano: "", status: "" };

export function VeiculoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getVeiculo, addVeiculo, updateVeiculo } = useData();

  const editando = Boolean(id);
  const existente = editando ? getVeiculo(id) : null;

  const [form, setForm] = useState(existente ? { ...existente } : VAZIO);
  const [erros, setErros] = useState({});

  // Se está editando e o id não existe, avisa
  if (editando && !existente) {
    return (
      <div className="card card-pad">
        <p>Veículo não encontrado.</p>
        <button className="btn btn-outline mt" onClick={() => navigate("/veiculos")}>Voltar</button>
      </div>
    );
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function validar() {
    const e = {};
    if (!form.placa.trim()) e.placa = "Informe a placa.";
    if (!form.marca.trim()) e.marca = "Informe a marca.";
    if (!form.modelo.trim()) e.modelo = "Informe o modelo.";
    if (!String(form.ano).trim()) e.ano = "Informe o ano.";
    else if (Number(form.ano) < 1950 || Number(form.ano) > anoAtual + 1) e.ano = `Ano entre 1950 e ${anoAtual + 1}.`;
    if (!form.status) e.status = "Selecione o status.";
    setErros(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validar()) return;

    const dados = {
      placa: form.placa.trim().toUpperCase(),
      marca: form.marca.trim(),
      modelo: form.modelo.trim(),
      ano: Number(form.ano),
      status: form.status,
    };

    if (editando) {
      updateVeiculo(id, dados);
      navigate("/veiculos", { state: { msg: `Veículo ${dados.placa} atualizado.` } });
    } else {
      addVeiculo(dados);
      navigate("/veiculos", { state: { msg: `Veículo ${dados.placa} cadastrado.` } });
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <span className="kicker">Veículos</span>
          <h1 className="page-title">{editando ? "Editar veículo" : "Novo veículo"}</h1>
        </div>
      </div>

      <form className="card card-pad" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <Field label="Placa" name="placa" value={form.placa} onChange={handleChange} error={erros.placa} required placeholder="ABC1D23" />
          <Field label="Status" name="status" as="select" options={STATUS} value={form.status} onChange={handleChange} error={erros.status} required />
          <Field label="Marca" name="marca" value={form.marca} onChange={handleChange} error={erros.marca} required placeholder="Volvo" />
          <Field label="Modelo" name="modelo" value={form.modelo} onChange={handleChange} error={erros.modelo} required placeholder="FH 540" />
          <Field label="Ano" name="ano" type="number" value={form.ano} onChange={handleChange} error={erros.ano} required placeholder={anoAtual} />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">{editando ? "Salvar alterações" : "Cadastrar"}</button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate("/veiculos")}>Cancelar</button>
        </div>
      </form>
    </>
  );
}
