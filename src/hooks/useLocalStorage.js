import { useState, useEffect } from "react";

/**
 * Hook de persistência no localStorage.
 * Na primeira execução usa `valorInicial` (dados locais do JSON);
 * depois, qualquer alteração é gravada e sobrevive ao refresh (F5).
 */
export function useLocalStorage(chave, valorInicial) {
  const [valor, setValor] = useState(() => {
    try {
      const salvo = localStorage.getItem(chave);
      return salvo !== null ? JSON.parse(salvo) : valorInicial;
    } catch {
      return valorInicial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
    } catch {
      // ignora falhas de gravação (ex.: modo privado)
    }
  }, [chave, valor]);

  return [valor, setValor];
}
