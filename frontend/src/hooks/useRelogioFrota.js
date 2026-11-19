import { useEffect, useState } from "react";
import { agoraNaFrota } from "../lib/operacao";

export function useRelogioFrota() {
  const [agora, atualizar] = useState(() => agoraNaFrota());

  useEffect(() => {
    const intervalo = window.setInterval(() => atualizar(agoraNaFrota()), 30_000);
    return () => window.clearInterval(intervalo);
  }, []);

  return agora;
}
