import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services";
import { useAuth } from "./AuthContext";

/**
 * DataContext — estado global do TransLog (AV2).
 * Carrega veículos, motoristas e ocorrências da API quando há sessão e
 * expõe CRUD assíncrono. As mutações propagam ApiError para o formulário
 * mostrar a mensagem/erros de campo; a lista local é atualizada ao final.
 */
const DataContext = createContext(null);

const RECURSOS = ["veiculos", "motoristas", "ocorrencias"];
const mesmoId = (a, b) => String(a) === String(b);

export function DataProvider({ children }) {
  const { autenticado } = useAuth();
  const [dados, setDados] = useState({ veiculos: [], motoristas: [], ocorrencias: [] });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    // Cada recurso carrega de forma independente: se um falhar (ex.: módulo
    // ainda não publicado na API), os outros continuam funcionando.
    const resultados = await Promise.allSettled(RECURSOS.map((r) => api.listar(r)));
    const proximo = {};
    const falhas = [];
    resultados.forEach((res, i) => {
      proximo[RECURSOS[i]] = res.status === "fulfilled" ? res.value : [];
      if (res.status === "rejected") falhas.push(RECURSOS[i]);
    });
    setDados(proximo);
    if (falhas.length) setErro(`Não foi possível carregar: ${falhas.join(", ")}. ${resultados.find((r) => r.status === "rejected").reason.message}`);
    setCarregando(false);
  }, []);

  useEffect(() => {
    if (autenticado) carregar();
    else {
      setDados({ veiculos: [], motoristas: [], ocorrencias: [] });
      setCarregando(true); // próximo login começa em "carregando"
    }
  }, [autenticado, carregar]);

  const value = useMemo(() => {
    const crud = (recurso) => ({
      criar: async (d) => {
        const novo = await api.criar(recurso, d);
        setDados((s) => ({ ...s, [recurso]: [novo, ...s[recurso]] }));
        return novo;
      },
      atualizar: async (id, d) => {
        const atual = await api.atualizar(recurso, id, d);
        setDados((s) => ({ ...s, [recurso]: s[recurso].map((i) => (mesmoId(i.id, id) ? atual : i)) }));
        return atual;
      },
      remover: async (id) => {
        await api.remover(recurso, id);
        setDados((s) => ({ ...s, [recurso]: s[recurso].filter((i) => !mesmoId(i.id, id)) }));
      },
      obter: (id) => dados[recurso].find((i) => mesmoId(i.id, id)) || null,
    });
    const v = crud("veiculos");
    const m = crud("motoristas");
    const o = crud("ocorrencias");

    return {
      ...dados,
      carregando,
      erro,
      recarregar: carregar,

      addVeiculo: v.criar, updateVeiculo: v.atualizar, removeVeiculo: v.remover, getVeiculo: v.obter,
      addMotorista: m.criar, updateMotorista: m.atualizar, removeMotorista: m.remover, getMotorista: m.obter,
      addOcorrencia: o.criar, updateOcorrencia: o.atualizar, removeOcorrencia: o.remover, getOcorrencia: o.obter,
    };
  }, [dados, carregando, erro, carregar]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

/** Hook de acesso ao estado global. Use em qualquer página/componente. */
export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData deve ser usado dentro de <DataProvider>");
  return ctx;
}
