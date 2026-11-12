/**
 * Campo de formulário reutilizável (label + input/select/textarea + erro).
 * - `as`: "input" (padrão) | "select" | "textarea"
 * - `error`: mensagem de validação (mostra abaixo e marca o campo)
 * - `options`: para as="select" -> array de strings
 * - `full`: ocupa a linha inteira do grid
 * - `mono`: fonte monoespaçada (placa, CPF, CNH)
 */
export function Field({ label, name, value, onChange, error, hint, required = false, as = "input", options = [], full = false, mono = false, ...rest }) {
  const inval = error ? " invalid" : "";
  return (
    <div className={"field" + (full ? " full" : "")}>
      <label htmlFor={name}>
        {label} {required && <span className="req">*</span>}
      </label>

      {as === "select" ? (
        <select id={name} name={name} value={value} onChange={onChange} className={"select" + inval} {...rest}>
          <option value="">Selecione...</option>
          {options.map((op) => (
            <option key={op} value={op}>{op}</option>
          ))}
        </select>
      ) : as === "textarea" ? (
        <textarea id={name} name={name} value={value} onChange={onChange} className={"textarea" + inval} {...rest} />
      ) : (
        <input id={name} name={name} value={value} onChange={onChange} className={"input" + (mono ? " mono" : "") + inval} {...rest} />
      )}

      {error ? <span className="field-error">{error}</span> : hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  );
}
