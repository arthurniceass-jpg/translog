import { useSearchParams } from "react-router-dom";

export function useFiltros() {
  const [parametros, setParametros] = useSearchParams();

  function ler(chave, opcoes) {
    const valor = parametros.get(chave) || "";
    return !opcoes || opcoes.includes(valor) ? valor : "";
  }

  function alterar(chave, valor) {
    setParametros((atuais) => {
      const novos = new URLSearchParams(atuais);
      if (valor) novos.set(chave, valor);
      else novos.delete(chave);
      return novos;
    }, { replace: true });
  }

  return { ler, alterar, limpar: () => setParametros({}, { replace: true }) };
}
