import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useData } from "../context/data";
import { useToast } from "../context/toast";
import { PageHeader } from "../components/PageHeader";
import { FormActions } from "../components/FormActions";
import { useErrosCampos } from "../hooks/useErrosCampos";
import { FormGate } from "../components/FormGate";
import { Field } from "../components/Field";
import { hojeISO } from "../lib/format";
import { STATUS_OCORRENCIA, TIPOS_OCORRENCIA } from "../data/constants";

const VAZIO = { titulo: "", tipo: "", data: "", veiculoId: "", motoristaId: "", status: "Aberta", descricao: "" };

export function OcorrenciaForm() {
  const { id } = useParams();
  const { state } = useLocation();
  const voltar = state?.origem || "/ocorrencias";
  const { getOcorrencia } = useData();
  const existente = id ? getOcorrencia(id) : null;

  return (
    <FormGate recurso="ocorrencias" editando={Boolean(id)} existente={existente} voltar={voltar} rotulo="Ocorrência">
      <Formulario id={id} existente={existente} voltar={voltar} />
    </FormGate>
  );
}

function Formulario({ id, existente, voltar }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { addOcorrencia, updateOcorrencia, veiculos, motoristas, carregando, falhas, recarregar } = useData();
  const veiculosIndisponiveis = falhas.includes("veiculos");
  const motoristasIndisponiveis = falhas.includes("motoristas");
  const semVeiculos = carregando || veiculosIndisponiveis || veiculos.length === 0;
  const editando = Boolean(id);

  const [form, setForm] = useState(() => {
    if (existente) {
      return { ...existente, veiculoId: String(existente.veiculoId), motoristaId: existente.motoristaId ? String(existente.motoristaId) : "" };
    }
    return { ...VAZIO, data: hojeISO() };
  });
  const { erros, mostrar, limpar } = useErrosCampos();
  const [salvando, setSalvando] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    limpar(name);
    setForm((f) => ({ ...f, [name]: value }));
  }

  function validar(formulario) {
    const e = {};
    if (!form.titulo.trim()) e.titulo = "Informe o título.";
    if (!form.tipo) e.tipo = "Selecione o tipo.";
    if (!form.data) e.data = "Informe a data.";
    else if (form.data > hojeISO()) e.data = "A data não pode estar no futuro.";
    if (!form.veiculoId) e.veiculoId = "Selecione o veículo.";
    if (!form.status) e.status = "Selecione o status.";
    if (!form.descricao.trim()) e.descricao = "Descreva a ocorrência.";
    mostrar(e, formulario);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const formulario = ev.currentTarget;
    if (salvando || semVeiculos || !validar(formulario)) return;
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
        titulo={editando ? "Editar ocorrência" : "Nova ocorrência"}
        sub={editando ? "Atualize as informações da ocorrência." : "Registre o que aconteceu para acompanhar até a resolução."}
        voltar={{ to: voltar, label: "Ocorrências" }}
      />

      <form className="card card-pad form-card" aria-busy={salvando} onSubmit={handleSubmit} noValidate>
        <h2 className="form-section">O que aconteceu</h2>
        <div className="form-grid">
          <Field full label="Título" name="titulo" maxLength={160} value={form.titulo} onChange={handleChange} error={erros.titulo} required placeholder="Ex.: Colisão no pátio" />
          <Field label="Tipo" name="tipo" as="select" options={TIPOS_OCORRENCIA} value={form.tipo} onChange={handleChange} error={erros.tipo} required />
          <Field label="Data" name="data" type="date" max={hojeISO()} value={form.data} onChange={handleChange} error={erros.data} required />
          <Field full label="Descrição" name="descricao" maxLength={2000} as="textarea" value={form.descricao} onChange={handleChange} error={erros.descricao} required placeholder="Descreva o que aconteceu, local e providências..." />
        </div>

        <h2 className="form-section">Envolvidos</h2>
        {!carregando && semVeiculos && (
          <p className="form-notice">
            {veiculosIndisponiveis ? <>
              A lista de veículos está indisponível. <button type="button" className="text-button" onClick={recarregar}>Tentar de novo</button>
            </> : <>
              Cadastre um veículo para registrar a ocorrência. <Link to="/veiculos/novo">Cadastrar veículo</Link>
            </>}
          </p>
        )}
        <div className="form-grid">
          <Field
            label="Veículo" name="veiculoId" as="select" required disabled={semVeiculos}
            value={form.veiculoId} onChange={handleChange} error={erros.veiculoId}
            options={veiculos.map((v) => ({ value: String(v.id), label: `${v.placa} · ${v.marca} ${v.modelo}` }))}
          />
          <Field
            label="Motorista" name="motoristaId" as="select"
            placeholderOption={motoristasIndisponiveis ? "Motoristas indisponíveis" : "Nenhum"}
            disabled={carregando || motoristasIndisponiveis}
            value={form.motoristaId} onChange={handleChange} error={erros.motoristaId}
            hint={motoristasIndisponiveis && form.motoristaId ? "O vínculo atual será preservado." : undefined}
            options={motoristas.map((m) => ({ value: String(m.id), label: m.nome }))}
          />
          <Field label="Status" name="status" as="select" options={STATUS_OCORRENCIA} value={form.status} onChange={handleChange} error={erros.status} required />
        </div>

        <FormActions voltar={voltar} salvando={salvando} rotulo={editando ? "Salvar alterações" : "Registrar ocorrência"} bloqueado={semVeiculos} />
      </form>
    </>
  );
}
