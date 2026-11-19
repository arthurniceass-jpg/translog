import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DataContext } from "./data";
import { api } from "../services";

/**
 * DataContext — estado global do TransLog (AV2).
 * Carrega veículos, motoristas e ocorrências da API quando há sessão e
 * expõe CRUD assíncrono. As mutações propagam ApiError para o formulário
 * mostrar a mensagem/erros de campo; a lista local é atualizada ao final.
 */
const CADASTROS = ["veiculos", "motoristas", "ocorrencias"];
const OPERACAO = ["manutencoes", "viagens", "abastecimentos", "documentos", "acompanhamentos", "responsaveis", "resolucoes"];
const RECURSOS = [...CADASTROS, ...OPERACAO];
const ROTULOS = { veiculos: "veículos", motoristas: "motoristas", ocorrencias: "ocorrências", manutencoes: "manutenções", viagens: "viagens", abastecimentos: "abastecimentos", documentos: "documentos", acompanhamentos: "acompanhamentos", responsaveis: "responsáveis", resolucoes: "tempos de resolução" };
const mesmoId = (a, b) => String(a) === String(b);

export function DataProvider({ children }) {
  const [dados, setDados] = useState(() => Object.fromEntries(RECURSOS.map((r) => [r, []])));
  const [carregando, setCarregando] = useState(true);
  const [carregandoOperacao, setCarregandoOperacao] = useState(true);
  const [falhas, setFalhas] = useState([]);

  const requisicao = useRef(0);

  const carregar = useCallback(() => {
    const atual = ++requisicao.current;
    async function carregarGrupo(recursos, finalizar) {
      const resultados = await Promise.allSettled(recursos.map((r) => api.listar(r)));
      if (atual !== requisicao.current) return;

      const proximo = {};
      const novasFalhas = [];
      resultados.forEach((res, i) => {
        if (res.status === "fulfilled") proximo[recursos[i]] = res.value;
        else novasFalhas.push(recursos[i]);
      });
      setDados((anteriores) => ({ ...anteriores, ...proximo }));
      setFalhas((anteriores) => [...anteriores.filter((r) => !recursos.includes(r)), ...novasFalhas]);
      finalizar(false);
    }

    carregarGrupo(CADASTROS, setCarregando);
    carregarGrupo(OPERACAO, setCarregandoOperacao);
  }, []);

  useEffect(() => {
    carregar();
    return () => { requisicao.current += 1; };
  }, [carregar]);

  const recarregar = useCallback(() => {
    setCarregando(true);
    setCarregandoOperacao(true);
    carregar();
  }, [carregar]);

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
    const falhasCadastro = falhas.filter((r) => CADASTROS.includes(r));

    async function atualizarAcompanhamento(id, pedido) {
      const registro = await api.acompanhamento.atualizar(id, pedido);
      setDados((s) => ({
        ...s,
        acompanhamentos: [...s.acompanhamentos.filter((a) => a.ocorrenciaId !== registro.ocorrenciaId), registro],
      }));
      return registro;
    }

    async function atualizarResolucoes() {
      try {
        const atuais = await api.listar("resolucoes");
        setDados((s) => ({ ...s, resolucoes: atuais }));
        setFalhas((s) => s.filter((r) => r !== "resolucoes"));
      } catch {
        setFalhas((s) => s.includes("resolucoes") ? s : [...s, "resolucoes"]);
      }
    }

    return {
      ...dados,
      carregando,
      carregandoOperacao,
      erro: falhasCadastro.length ? `Não foi possível carregar: ${falhasCadastro.map((nome) => ROTULOS[nome]).join(", ")}.` : "",
      falhas,
      registros: crud,
      atualizarAcompanhamento,
      recarregar,

      addVeiculo: v.criar, updateVeiculo: v.atualizar, removeVeiculo: v.remover, getVeiculo: v.obter,
      addMotorista: m.criar, updateMotorista: m.atualizar, removeMotorista: m.remover, getMotorista: m.obter,
      addOcorrencia: o.criar,
      updateOcorrencia: async (id, pedido) => {
        const retorno = await o.atualizar(id, pedido);
        atualizarResolucoes();
        return retorno;
      },
      removeOcorrencia: async (id) => {
        await o.remover(id);
        setDados((s) => ({
          ...s, acompanhamentos: s.acompanhamentos.filter((a) => !mesmoId(a.ocorrenciaId, id)),
          resolucoes: s.resolucoes.filter((r) => !mesmoId(r.ocorrenciaId, id)),
        }));
      }, getOcorrencia: o.obter,
    };
  }, [dados, carregando, carregandoOperacao, falhas, recarregar]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
