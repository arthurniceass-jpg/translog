import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useData } from "../context/data";
import { useToast } from "../context/toast";
import { PageHeader } from "../components/PageHeader";
import { FormActions } from "../components/FormActions";
import { useErrosCampos } from "../hooks/useErrosCampos";
import { FormGate } from "../components/FormGate";
import { Field } from "../components/Field";
import { STATUS_VEICULO } from "../data/constants";

const anoAtual = new Date().getFullYear();
const VAZIO = { placa: "", marca: "", modelo: "", ano: "", quilometragem: "", status: "Disponível" };

export function VeiculoForm() {
  const { id } = useParams();
  const { state } = useLocation();
  const voltar = state?.origem || "/veiculos";
  const { getVeiculo } = useData();
  const existente = id ? getVeiculo(id) : null;

  return (
    <FormGate recurso="veiculos" editando={Boolean(id)} existente={existente} voltar={voltar} rotulo="Veículo">
      <Formulario id={id} existente={existente} voltar={voltar} />
    </FormGate>
  );
}

function Formulario({ id, existente, voltar }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { addVeiculo, updateVeiculo } = useData();
  const editando = Boolean(id);

  const [form, setForm] = useState(existente ? { ...existente, ano: String(existente.ano) } : VAZIO);
  const { erros, mostrar, limpar } = useErrosCampos();
  const [salvando, setSalvando] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    limpar(name);
    if (name === "quilometragem") return setForm((f) => ({ ...f, quilometragem: value.replace(/\D/g, "").slice(0, 10) }));
    if (name === "ano") return setForm((f) => ({ ...f, ano: value.replace(/\D/g, "").slice(0, 4) }));
    if (name === "placa") return setForm((f) => ({ ...f, placa: value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7) }));
    setForm((f) => ({ ...f, [name]: value }));
  }

  function validar(formulario) {
    const e = {};
    if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(form.placa)) e.placa = "Placa inválida (ex.: ABC1D23 ou ABC1234).";
    if (!form.marca.trim()) e.marca = "Informe a marca.";
    if (!form.modelo.trim()) e.modelo = "Informe o modelo.";
    if (!/^\d{4}$/.test(form.ano)) e.ano = "O ano deve ter 4 dígitos.";
    else if (Number(form.ano) < 1950 || Number(form.ano) > anoAtual + 1) e.ano = `Ano entre 1950 e ${anoAtual + 1}.`;
    if (!form.status) e.status = "Selecione o status.";
    mostrar(e, formulario);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formulario = e.currentTarget;
    if (salvando || !validar(formulario)) return;
    const dados = {
      placa: form.placa,
      marca: form.marca.trim(),
      modelo: form.modelo.trim(),
      ano: Number(form.ano),
      status: form.status,
      quilometragem: form.quilometragem === "" || form.quilometragem == null ? null : Number(form.quilometragem),
    };
    setSalvando(true);
    try {
      if (editando) await updateVeiculo(id, dados);
      else await addVeiculo(dados);
      toast.sucesso(`Veículo ${dados.placa} ${editando ? "atualizado" : "cadastrado"}.`);
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
        titulo={editando ? "Editar veículo" : "Novo veículo"}
        sub={editando ? `Atualize os dados do veículo ${existente.placa}.` : "Preencha os dados para adicionar à frota."}
        voltar={{ to: voltar, label: "Veículos" }}
      />

      <form className="card card-pad form-card" aria-busy={salvando} onSubmit={handleSubmit} noValidate>
        <h2 className="form-section">Identificação</h2>
        <div className="form-grid">
          <Field label="Placa" name="placa" mono value={form.placa} onChange={handleChange} error={erros.placa} required placeholder="ABC1D23" />
          <Field label="Status" name="status" as="select" options={STATUS_VEICULO} value={form.status} onChange={handleChange} error={erros.status} required />
        </div>
        <h2 className="form-section">Dados do veículo</h2>
        <div className="form-grid">
          <Field label="Marca" name="marca" value={form.marca} onChange={handleChange} error={erros.marca} required placeholder="Volvo" />
          <Field label="Modelo" name="modelo" value={form.modelo} onChange={handleChange} error={erros.modelo} required placeholder="FH 540" />
          <Field label="Ano" name="ano" inputMode="numeric" value={form.ano} onChange={handleChange} error={erros.ano} required placeholder={String(anoAtual)} />
          <Field label="Quilometragem atual" name="quilometragem" inputMode="numeric" value={form.quilometragem ?? ""} onChange={handleChange} error={erros.quilometragem} hint="Atualize o odômetro para acompanhar revisões por km." />
        </div>

        <FormActions voltar={voltar} salvando={salvando} rotulo={editando ? "Salvar alterações" : "Cadastrar veículo"} />
      </form>
    </>
  );
}
