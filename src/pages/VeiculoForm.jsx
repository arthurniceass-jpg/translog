import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { PageHeader } from "../components/PageHeader";
import { FormGate } from "../components/FormGate";
import { Field } from "../components/Field";
import { STATUS_VEICULO } from "../data/constants";

const anoAtual = new Date().getFullYear();
const VAZIO = { placa: "", marca: "", modelo: "", ano: "", status: "Disponível" };

export function VeiculoForm() {
  const { id } = useParams();
  const { getVeiculo } = useData();
  const existente = id ? getVeiculo(id) : null;

  return (
    <FormGate editando={Boolean(id)} existente={existente} voltar="/veiculos" rotulo="Veículo">
      <Formulario id={id} existente={existente} />
    </FormGate>
  );
}

function Formulario({ id, existente }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { addVeiculo, updateVeiculo } = useData();
  const editando = Boolean(id);

  const [form, setForm] = useState(existente ? { ...existente, ano: String(existente.ano) } : VAZIO);
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "ano") return setForm((f) => ({ ...f, ano: value.replace(/\D/g, "").slice(0, 4) }));
    if (name === "placa") return setForm((f) => ({ ...f, placa: value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7) }));
    setForm((f) => ({ ...f, [name]: value }));
  }

  function validar() {
    const e = {};
    if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(form.placa)) e.placa = "Placa inválida (ex.: ABC1D23 ou ABC1234).";
    if (!form.marca.trim()) e.marca = "Informe a marca.";
    if (!form.modelo.trim()) e.modelo = "Informe o modelo.";
    if (!/^\d{4}$/.test(form.ano)) e.ano = "O ano deve ter 4 dígitos.";
    else if (Number(form.ano) < 1950 || Number(form.ano) > anoAtual + 1) e.ano = `Ano entre 1950 e ${anoAtual + 1}.`;
    if (!form.status) e.status = "Selecione o status.";
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validar()) return;
    const dados = {
      placa: form.placa,
      marca: form.marca.trim(),
      modelo: form.modelo.trim(),
      ano: Number(form.ano),
      status: form.status,
    };
    setSalvando(true);
    try {
      if (editando) await updateVeiculo(id, dados);
      else await addVeiculo(dados);
      toast.sucesso(`Veículo ${dados.placa} ${editando ? "atualizado" : "cadastrado"}.`);
      navigate("/veiculos");
    } catch (err) {
      setErros(err.fieldErrors || {});
      toast.erro(err.message);
      setSalvando(false);
    }
  }

  return (
    <>
      <PageHeader
        titulo={editando ? "Editar veículo" : "Novo veículo"}
        sub={editando ? `Atualize os dados do veículo ${existente.placa}.` : "Preencha os dados para adicionar à frota."}
        voltar={{ to: "/veiculos", label: "Veículos" }}
      />

      <form className="card card-pad form-card" onSubmit={handleSubmit} noValidate>
        <div className="form-section">Identificação</div>
        <div className="form-grid">
          <Field label="Placa" name="placa" mono value={form.placa} onChange={handleChange} error={erros.placa} required placeholder="ABC1D23" />
          <Field label="Status" name="status" as="select" options={STATUS_VEICULO} value={form.status} onChange={handleChange} error={erros.status} required />
        </div>
        <div className="form-section">Dados do veículo</div>
        <div className="form-grid">
          <Field label="Marca" name="marca" value={form.marca} onChange={handleChange} error={erros.marca} required placeholder="Volvo" />
          <Field label="Modelo" name="modelo" value={form.modelo} onChange={handleChange} error={erros.modelo} required placeholder="FH 540" />
          <Field label="Ano" name="ano" inputMode="numeric" value={form.ano} onChange={handleChange} error={erros.ano} required placeholder={String(anoAtual)} />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={salvando}>
            {salvando && <span className="spinner" />} {editando ? "Salvar alterações" : "Cadastrar veículo"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate("/veiculos")}>Cancelar</button>
        </div>
      </form>
    </>
  );
}
