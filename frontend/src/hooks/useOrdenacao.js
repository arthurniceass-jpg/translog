import { useMemo, useState } from "react";

/** Compara números como números e textos em ordem alfabética do português ("10" depois de "9", "Á" junto de "A"). */
function comparar(a, b) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a ?? "").localeCompare(String(b ?? ""), "pt-BR", { numeric: true, sensitivity: "base" });
}

/**
 * Ordenação de tabela por coluna. Clicar na mesma coluna alterna crescente/decrescente.
 * - `acessores`: { coluna: (item) => valor } — defina fora do componente para não recriar a cada render.
 * - `inicial`: { coluna, direcao: "asc" | "desc" } ou null (mantém a ordem recebida).
 */
export function useOrdenacao(lista, acessores, inicial = null) {
  const [ordem, setOrdem] = useState(inicial);

  const ordenada = useMemo(() => {
    if (!ordem) return lista;
    const valor = acessores[ordem.coluna];
    const fator = ordem.direcao === "asc" ? 1 : -1;
    return [...lista].sort((a, b) => fator * comparar(valor(a), valor(b)));
  }, [lista, ordem, acessores]);

  function ordenarPor(coluna) {
    setOrdem((atual) =>
      atual?.coluna === coluna
        ? { coluna, direcao: atual.direcao === "asc" ? "desc" : "asc" }
        : { coluna, direcao: "asc" },
    );
  }

  return { ordenada, ordem, ordenarPor };
}
