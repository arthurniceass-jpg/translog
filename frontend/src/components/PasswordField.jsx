import { useState } from "react";
import { Field } from "./Field";
import { Icon } from "./Icons";

export function PasswordField({ label = "Senha", ...props }) {
  const [visivel, setVisivel] = useState(false);
  const acao = visivel ? "Ocultar" : "Mostrar";

  return (
    <Field
      {...props}
      label={label}
      type={visivel ? "text" : "password"}
      acao={(
        <button type="button" className="input-action" aria-label={`${acao} ${label.toLowerCase()}`} onClick={() => setVisivel(!visivel)}>
          <Icon name={visivel ? "eye-off" : "eye"} size={18} />
        </button>
      )}
    />
  );
}
