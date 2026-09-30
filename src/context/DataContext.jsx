import { createContext, useContext } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import veiculosIniciais from "../data/veiculos.json";
import motoristasIniciais from "../data/motoristas.json";
import ocorrenciasIniciais from "../data/ocorrencias.json";

/**
 * DataContext — estado global do TransLog.
 * Guarda as 3 coleções (veículos, motoristas, ocorrências) e expõe as
 * funções de CRUD. Tudo é persistido no localStorage via useLocalStorage.
 * Sem Redux/Zustand: apenas Context + hooks nativos do React.
 */
const DataContext = createContext(null);

function gerarId() {
  // id único simples (não depende de lib externa)
  return "id-" + Date.now().toString(36) + "-" + Math.floor(Math.random() * 1e6).toString(36);
}

export function DataProvider({ children }) {
  const [veiculos, setVeiculos] = useLocalStorage("translog:veiculos", veiculosIniciais);
  const [motoristas, setMotoristas] = useLocalStorage("translog:motoristas", motoristasIniciais);
  const [ocorrencias, setOcorrencias] = useLocalStorage("translog:ocorrencias", ocorrenciasIniciais);

  // ---- CRUD genérico reutilizado pelas 3 coleções ----
  function criar(setLista, dados) {
    const novo = { ...dados, id: gerarId() };
    setLista((lista) => [novo, ...lista]);
    return novo;
  }
  function atualizar(setLista, id, dados) {
    setLista((lista) => lista.map((item) => (item.id === id ? { ...item, ...dados, id } : item)));
  }
  function remover(setLista, id) {
    setLista((lista) => lista.filter((item) => item.id !== id));
  }

  const value = {
    // coleções
    veiculos,
    motoristas,
    ocorrencias,

    // veículos
    addVeiculo: (d) => criar(setVeiculos, d),
    updateVeiculo: (id, d) => atualizar(setVeiculos, id, d),
    removeVeiculo: (id) => remover(setVeiculos, id),
    getVeiculo: (id) => veiculos.find((v) => v.id === id) || null,

    // motoristas
    addMotorista: (d) => criar(setMotoristas, d),
    updateMotorista: (id, d) => atualizar(setMotoristas, id, d),
    removeMotorista: (id) => remover(setMotoristas, id),
    getMotorista: (id) => motoristas.find((m) => m.id === id) || null,

    // ocorrências
    addOcorrencia: (d) => criar(setOcorrencias, d),
    updateOcorrencia: (id, d) => atualizar(setOcorrencias, id, d),
    removeOcorrencia: (id) => remover(setOcorrencias, id),
    getOcorrencia: (id) => ocorrencias.find((o) => o.id === id) || null,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

/** Hook de acesso ao estado global. Use em qualquer página/componente. */
export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData deve ser usado dentro de <DataProvider>");
  return ctx;
}
