import { useEffect, useRef, useState } from "react";
import { useData } from "../context/data";
import { useToast } from "../context/toast";
import { useErrosCampos } from "../hooks/useErrosCampos";
import { api } from "../services";
import { PRIORIDADES } from "../lib/operacao";
import { Badge } from "./Badge";
import { statusVariant } from "./badgeVariants";
import { ConfirmDialog } from "./ConfirmDialog";
import { Field } from "./Field";
import { Icon } from "./Icons";
import { ErroCarga, TableSkeleton } from "./Loading";

const dataRegistro = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short",
});
const opcoesPrioridade = Object.entries(PRIORIDADES).map(([value, label]) => ({ value, label }));

export function OcorrenciaAcompanhamento({ id }) {
  const [tentativa, setTentativa] = useState(0);
  const [detalhe, setDetalhe] = useState(null);

  useEffect(() => {
    let ativo = true;
    api.acompanhamento.detalhe(id)
      .then((resposta) => { if (ativo) setDetalhe(resposta); })
      .catch((erro) => { if (ativo) setDetalhe({ erro: erro.message }); });
    return () => { ativo = false; };
  }, [id, tentativa]);

  if (!detalhe) return <div className="card"><TableSkeleton linhas={4} /></div>;
  if (detalhe.erro) return <ErroCarga mensagem={detalhe.erro} onTentar={() => { setDetalhe(null); setTentativa((n) => n + 1); }} />;
  return <PainelAcompanhamento id={id} detalhe={detalhe} />;
}

function PainelAcompanhamento({ id, detalhe }) {
  const { responsaveis, falhas, atualizarAcompanhamento } = useData();
  const toast = useToast();
  const { erros, mostrar, limpar } = useErrosCampos();
  const [form, setForm] = useState(detalhe.dados);
  const [anexos, setAnexos] = useState(detalhe.anexos);
  const [arquivo, setArquivo] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [anexoExclusao, setAnexoExclusao] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const arquivoRef = useRef(null);
  const tituloAnexos = useRef(null);
  const responsaveisIndisponiveis = falhas.includes("responsaveis");

  async function salvar(evento) {
    evento.preventDefault();
    if (salvando) return;
    const formulario = evento.currentTarget;
    setSalvando(true);
    try {
      await atualizarAcompanhamento(id, {
        responsavelId: form.responsavelId ? Number(form.responsavelId) : null,
        prazo: form.prazo || null,
        prioridade: form.prioridade,
      });
      toast.sucesso("Acompanhamento atualizado.");
    } catch (erro) {
      mostrar(erro.fieldErrors || {}, formulario);
      toast.erro(erro.message);
    } finally {
      setSalvando(false);
    }
  }

  async function anexar(evento) {
    evento.preventDefault();
    if (!arquivo || enviando) return;
    setEnviando(true);
    try {
      const adicionado = await api.acompanhamento.anexar(id, arquivo);
      setAnexos((lista) => [adicionado, ...lista]);
      setArquivo(null);
      if (arquivoRef.current) arquivoRef.current.value = "";
      toast.sucesso("Anexo adicionado.");
    } catch (erro) {
      toast.erro(erro.message);
    } finally {
      setEnviando(false);
    }
  }

  async function baixar(anexo) {
    try {
      const arquivo = await api.acompanhamento.baixar(id, anexo.id);
      const url = URL.createObjectURL(arquivo);
      Object.assign(document.createElement("a"), { href: url, download: anexo.nome }).click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (erro) {
      toast.erro(erro.message);
    }
  }

  async function excluir() {
    setExcluindo(true);
    try {
      await api.acompanhamento.excluir(id, anexoExclusao.id);
      setAnexos((lista) => lista.filter((a) => a.id !== anexoExclusao.id));
      toast.sucesso("Anexo excluído.");
      requestAnimationFrame(() => tituloAnexos.current?.focus({ preventScroll: true }));
    } catch (erro) {
      toast.erro(erro.message);
    } finally {
      setAnexoExclusao(null);
      setExcluindo(false);
    }
  }

  function alterar(evento) {
    const { name, value } = evento.target;
    limpar(name);
    setForm((atual) => ({ ...atual, [name]: value }));
  }

  return (
    <div className="acompanhamento-grid">
      <section className="card card-pad">
        <h2 className="card-title detail-heading">Acompanhamento</h2>
        <form aria-busy={salvando} onSubmit={salvar} noValidate>
          <div className="form-grid">
            <Field name="responsavelId" label="Responsável" as="select" full placeholderOption="Sem responsável"
              disabled={responsaveisIndisponiveis} hint={responsaveisIndisponiveis ? "Lista de responsáveis indisponível." : undefined}
              options={responsaveis.map((p) => ({ value: String(p.id), label: p.nome }))}
              value={form.responsavelId ?? ""} onChange={alterar} error={erros.responsavelId} />
            <Field name="prioridade" label="Prioridade" as="select" required options={opcoesPrioridade}
              value={form.prioridade} onChange={alterar} error={erros.prioridade} />
            <Field name="prazo" label="Prazo de resolução" type="date" value={form.prazo ?? ""} onChange={alterar} error={erros.prazo} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={salvando || !form.prioridade}>{salvando ? "Salvando…" : "Salvar acompanhamento"}</button>
        </form>
      </section>

      <section className="card card-pad">
        <h2 className="card-title detail-heading">Histórico de status</h2>
        {detalhe.historico.length === 0 ? <p className="muted">Nenhuma alteração registrada.</p> : (
          <ol className="registro-historico">
            {detalhe.historico.map((item) => (
              <li key={item.id}>
                <div className="row">
                  {item.anterior && <><Badge variant={statusVariant(item.anterior)}>{item.anterior}</Badge><Icon name="arrow" size={14} /></>}
                  <Badge variant={statusVariant(item.novoStatus)}>{item.novoStatus}</Badge>
                </div>
                <small>{item.autor ? `${item.autor} · ` : ""}{dataRegistro.format(new Date(item.registradoEm))}</small>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="card card-pad painel-anexos">
        <h2 ref={tituloAnexos} tabIndex={-1} className="card-title detail-heading">Anexos</h2>
        <form className="row anexos-form" onSubmit={anexar}>
          <div className="field">
            <label htmlFor="arquivo-ocorrencia">Selecionar arquivo</label>
            <input ref={arquivoRef} className="input" type="file" id="arquivo-ocorrencia" accept=".pdf,.png,.jpg,.jpeg" disabled={enviando || anexos.length >= 10}
              aria-describedby="limite-anexo" onChange={(e) => setArquivo(e.target.files?.[0] || null)} />
            <small id="limite-anexo" className="muted">PDF, PNG ou JPEG de até 5 MB. {anexos.length} de 10 anexos.</small>
          </div>
          <button type="submit" className="btn btn-outline" disabled={!arquivo || enviando || anexos.length >= 10}>{enviando ? "Enviando…" : "Anexar arquivo"}</button>
        </form>
        {anexos.length > 0 && <ul className="anexos-lista">
          {anexos.map((anexo) => (
            <li className="row" key={anexo.id}>
              <strong>{anexo.nome}</strong>
              <button className="icon-btn" type="button" aria-label={`Baixar ${anexo.nome}`} onClick={() => baixar(anexo)}><Icon name="download" size={17} /></button>
              <button className="icon-btn danger" type="button" aria-label={`Excluir ${anexo.nome}`} onClick={() => setAnexoExclusao(anexo)}><Icon name="trash" size={17} /></button>
            </li>
          ))}
        </ul>}
      </section>
      <ConfirmDialog aberto={Boolean(anexoExclusao)} titulo="Excluir anexo"
        mensagem={anexoExclusao ? `Excluir “${anexoExclusao.nome}”?` : ""} carregando={excluindo}
        onConfirmar={excluir} onCancelar={() => setAnexoExclusao(null)} />
    </div>
  );
}
