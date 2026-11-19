/**
 * Campo de formulário reutilizável (label + input/select/textarea + erro).
 * - `as`: "input" (padrão) | "select" | "textarea"
 * - `error`: mensagem de validação (mostra abaixo e marca o campo)
 * - `options`: para as="select" -> array de strings
 * - `full`: ocupa a linha inteira do grid
 * - `mono`: fonte monoespaçada (placa, CPF, CNH)
 */
export function Field({ label, name, value, onChange, error, hint, required = false, as = "input", options = [], full = false, mono = false, placeholderOption = "Selecione…", acao, ...rest }) {
  const inval = error ? " invalid" : "";
  const mensagemId = `${name}-mensagem`;
  const controle = {
    id: name, name, value, onChange, required,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error || hint ? mensagemId : undefined,
    ...rest,
  };
  const input = <input {...controle} className={"input" + (mono ? " mono" : "") + inval} />;
  return (
    <div className={"field" + (full ? " full" : "")}>
      <label htmlFor={name}>
        {label} {required && <span className="req">*</span>}
      </label>

      {as === "select" ? (
        <select {...controle} className={"select" + inval}>
          <option value="">{placeholderOption}</option>
          {options.map((op) => {
            const { value: valor, label: rotulo } = typeof op === "string" ? { value: op, label: op } : op;
            return <option key={valor} value={valor}>{rotulo}</option>;
          })}
        </select>
      ) : as === "textarea" ? (
        <textarea {...controle} className={"textarea" + inval} />
      ) : acao ? (
        <div className="input-with-action">{input}{acao}</div>
      ) : input}

      {error ? <span id={mensagemId} className="field-error">{error}</span> : hint ? <span id={mensagemId} className="field-hint">{hint}</span> : null}
    </div>
  );
}
