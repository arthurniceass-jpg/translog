import { useState } from "react";

export function useErrosCampos() {
  const [erros, setErros] = useState({});

  function mostrar(campos, formulario) {
    setErros(campos);
    if (Object.keys(campos).length) {
      requestAnimationFrame(() => formulario?.querySelector('[aria-invalid="true"]')?.focus());
    }
  }

  function limpar(nome) {
    setErros((atuais) => atuais[nome] ? { ...atuais, [nome]: undefined } : atuais);
  }

  return { erros, mostrar, limpar };
}
