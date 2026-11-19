import { useState } from "react";
import { Field } from "./Field";
import { Icon } from "./Icons";
import { useErrosCampos } from "../hooks/useErrosCampos";
import { useToast } from "../context/toast";

export function RegistroOperacionalForm({ config, item, dados, agora, onSalvar, onCancelar }) {
  const [form, setForm] = useState(() => ({ ...config.valores(agora), ...item, ...(item && config.editar?.(item)) }));
  const { erros, mostrar, limpar } = useErrosCampos();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const toast = useToast();
  const campos = config.campos(dados, form, agora);

  async function salvar(evento) {
    evento.preventDefault();
    if (salvando) return;

    const formulario = evento.currentTarget;
    const pedido = {};
    const invalidos = {};
    for (const campo of campos) {
      const texto = String(form[campo.nome] ?? "").trim();
      if (campo.obrigatorio && !texto) invalidos[campo.nome] = `Informe ${campo.rotulo.toLowerCase()}.`;
      const controle = formulario.elements.namedItem(campo.nome);
      if (texto && !controle.validity.valid) {
        invalidos[campo.nome] = controle.validationMessage;
      }
      if (!campo.apenasFormulario && texto) pedido[campo.nome] = campo.numerico ? Number(texto) : texto;
    }
    const resultado = { ...config.validar?.(pedido), ...invalidos };
    if (Object.keys(resultado).length) {
      mostrar(resultado, formulario);
      return;
    }

    setErro("");
    setSalvando(true);
    try {
      await onSalvar(pedido);
      toast.sucesso(item ? "Alterações salvas." : "Registro adicionado.");
    } catch (e) {
      mostrar(e.fieldErrors || {}, formulario);
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form className="card card-pad form-card operacao-form" onSubmit={salvar} aria-busy={salvando} noValidate>
      <div className="card-head">
        <h2 className="card-title">{item ? `Editar ${config.singular}` : config.novo}</h2>
        <button className="icon-btn" type="button" aria-label="Fechar formulário" onClick={onCancelar} disabled={salvando}><Icon name="x" size={18} /></button>
      </div>
      {erro && <p className="alert alert-danger" role="alert">{erro}</p>}
      <div className="form-grid">
        {campos.map((campo) => {
          const select = campo.tipo === "select";
          const valor = form[campo.nome] ?? "";
          return (
            <Field
              key={campo.nome} name={campo.nome} label={campo.rotulo} full={campo.full} required={campo.obrigatorio}
              as={select ? "select" : "input"} type={select ? undefined : campo.tipo}
              options={campo.opcoes} min={campo.min} max={campo.max} step={campo.passo} maxLength={campo.maxLength}
              hint={campo.dica} error={erros[campo.nome]} value={campo.tipo === "datetime-local" ? valor.slice(0, 16) : valor}
              onChange={(e) => {
                const proximo = e.target.value;
                limpar(campo.nome);
                setForm((atual) => ({ ...atual, [campo.nome]: proximo }));
              }}
            />
          );
        })}
      </div>
      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={salvando}>{salvando ? "Salvando…" : "Salvar registro"}</button>
        <button className="btn btn-ghost" type="button" disabled={salvando} onClick={onCancelar}>Cancelar</button>
      </div>
    </form>
  );
}
