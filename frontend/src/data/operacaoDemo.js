import { agoraNaFrota, somarDias } from "../lib/operacao";

const hoje = () => agoraNaFrota().slice(0, 10);

export const operacaoDemo = {
  manutencoes: () => [
    { id: 1, veiculoId: 1, descricao: "Revisão do sistema de freios", prazo: somarDias(hoje(), -2), limiteKm: 90000, status: "AGENDADA" },
    { id: 2, veiculoId: 3, descricao: "Troca de óleo e filtros", prazo: hoje(), status: "EM_EXECUCAO" },
    { id: 3, veiculoId: 2, descricao: "Alinhamento e balanceamento", prazo: hoje(), concluidaEm: hoje(), custo: 520, status: "CONCLUIDA" },
  ],
  viagens: () => [
    { id: 1, veiculoId: 2, motoristaId: 1, origem: "Recife", destino: "João Pessoa", partida: `${hoje()}T17:00`, chegadaPrevista: `${hoje()}T19:30`, status: "PROGRAMADA" },
    { id: 2, veiculoId: 5, motoristaId: 3, origem: "Caruaru", destino: "Recife", partida: `${somarDias(hoje(), -1)}T14:00`, chegadaPrevista: `${somarDias(hoje(), -1)}T17:00`, status: "EM_ANDAMENTO" },
    { id: 3, veiculoId: 2, motoristaId: 2, origem: "Recife", destino: "Jaboatão", partida: `${hoje()}T00:00`, chegadaPrevista: `${hoje()}T00:30`, chegadaReal: `${hoje()}T00:25`, kmPercorridos: 18, status: "CONCLUIDA" },
  ],
  abastecimentos: () => [
    { id: 1, veiculoId: 2, data: hoje(), litros: 50, valor: 305 },
    { id: 2, veiculoId: 5, data: hoje(), litros: 13, valor: 78.65 },
  ],
  documentos: () => [
    { id: 1, veiculoId: 1, validade: somarDias(hoje(), 19) },
    { id: 2, motoristaId: 2, validade: somarDias(hoje(), 7) },
  ],
  acompanhamentos: () => [],
  situacoes: () => [],
};
