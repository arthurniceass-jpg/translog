/**
 * Campo de formulário reutilizável (label + input/select/textarea + erro).
 * - `as`: "input" (padrão) | "select" | "textarea"
 * - `error`: mensagem de validação (mostra abaixo e marca o campo)
 * - `options`: usado quando as="select" -> array de strings
 */
export function Field({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  as = "input",
  options = [],
  ...rest
}) {
  const className = "input" + (error ? " invalid" : "");
  return (
    <div className="field">
      <label htmlFor={name}>
        {label} {required && <span className="req">*</span>}
      </label>

      {as === "select" ? (
        <select id={name} name={name} value={value} onChange={onChange} className={"select" + (error ? " invalid" : "")} {...rest}>
          <option value="">Selecione...</option>
          {options.map((op) => (
            <option key={op} value={op}>{op}</option>
          ))}
        </select>
      ) : as === "textarea" ? (
        <textarea id={name} name={name} value={value} onChange={onChange} className={"textarea" + (error ? " invalid" : "")} {...rest} />
      ) : (
        <input id={name} name={name} value={value} onChange={onChange} className={className} {...rest} />
      )}

      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
