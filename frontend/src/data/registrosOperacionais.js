import { dataBR } from "../lib/format";
import { dataHoraLocal, dinheiro, estadoManutencao, nomeDe, numero, placaDe, STATUS_MANUTENCAO, STATUS_VIAGEM, viagemAtrasada } from "../lib/operacao";

const veiculo = (dados) => ({
  nome: "veiculoId", rotulo: "Veículo", tipo: "select", obrigatorio: true,
  opcoes: dados.veiculos.map((v) => ({ value: String(v.id), label: `${v.placa} · ${v.marca} ${v.modelo}` })),
  numerico: true,
});
const motorista = (dados) => ({
  nome: "motoristaId", rotulo: "Motorista", tipo: "select", obrigatorio: true,
  opcoes: dados.motoristas.map((m) => ({ value: String(m.id), label: m.nome })), numerico: true,
});
const opcoesStatus = (status) => Object.entries(status).map(([value, label]) => ({ value, label }));
const todos = (itens) => Object.values(itens);
const hoje = (agora) => agora.slice(0, 10);

export const REGISTROS_OPERACIONAIS = {
  manutencoes: {
    caminho: "/manutencoes", titulo: "Manutenções", subtitulo: "Acompanhe revisões por data ou quilometragem e registre os serviços realizados.",
    novo: "Agendar manutenção", singular: "manutenção", plural: "manutenções", icon: "tool",
    dependencias: ["veiculos"], status: [...todos(STATUS_MANUTENCAO), "Próxima", "Vencida"],
    colunas: ["Serviço", "Veículo", "Vencimento", "Status"],
    valores: () => ({ status: "AGENDADA" }),
    campos: (dados, form, agora) => [
      { nome: "descricao", rotulo: "Serviço", obrigatorio: true, maxLength: 160, full: true },
      veiculo(dados),
      { nome: "status", rotulo: "Status", tipo: "select", obrigatorio: true, opcoes: opcoesStatus(STATUS_MANUTENCAO) },
      { nome: "prazo", rotulo: "Data limite", tipo: "date", dica: "Informe a data, o limite em km ou ambos." },
      { nome: "limiteKm", rotulo: "Limite do odômetro (km)", tipo: "number", min: 0, passo: "1", numerico: true },
      ...(form.status === "CONCLUIDA" ? [
        { nome: "concluidaEm", rotulo: "Data da conclusão", tipo: "date", obrigatorio: true, max: hoje(agora) },
        { nome: "custo", rotulo: "Custo do serviço (R$)", tipo: "number", min: 0, max: 9999999999.99, passo: "0.01", numerico: true },
      ] : []),
    ],
    validar: (form) => !form.prazo && form.limiteKm == null ? { prazo: "Informe a data ou a quilometragem de vencimento." } : {},
    linha: (item, dados, agora) => ({
      identidade: item.descricao, statusRegistro: STATUS_MANUTENCAO[item.status], status: estadoManutencao(item, dados.veiculos.find((v) => v.id === item.veiculoId)?.quilometragem, hoje(agora)),
      valores: [
        placaDe(dados.veiculos, item.veiculoId),
        [item.prazo && dataBR(item.prazo), item.limiteKm != null && `${numero.format(item.limiteKm)} km`].filter(Boolean).join(" · "),
      ],
      nota: item.status === "CONCLUIDA" ? `Concluída em ${dataBR(item.concluidaEm)}${item.custo != null ? " · " + dinheiro.format(item.custo) : ""}` : STATUS_MANUTENCAO[item.status],
    }),
  },
  viagens: {
    caminho: "/viagens", titulo: "Viagens", subtitulo: "Programe rotas e acompanhe as chegadas no horário de Brasília.",
    novo: "Programar viagem", singular: "viagem", plural: "viagens", icon: "pin",
    dependencias: ["veiculos", "motoristas"], status: [...todos(STATUS_VIAGEM), "Atrasada"],
    colunas: ["Rota", "Equipe e veículo", "Horários", "Status"],
    valores: () => ({ status: "PROGRAMADA" }),
    campos: (dados, form, agora) => [
      { nome: "origem", rotulo: "Origem", obrigatorio: true, maxLength: 120 },
      { nome: "destino", rotulo: "Destino", obrigatorio: true, maxLength: 120 },
      veiculo(dados), motorista(dados),
      { nome: "partida", rotulo: "Partida", tipo: "datetime-local", obrigatorio: true },
      { nome: "chegadaPrevista", rotulo: "Chegada prevista", tipo: "datetime-local", obrigatorio: true },
      { nome: "status", rotulo: "Status", tipo: "select", obrigatorio: true, opcoes: opcoesStatus(STATUS_VIAGEM) },
      ...(form.status === "CONCLUIDA" ? [
        { nome: "chegadaReal", rotulo: "Chegada real", tipo: "datetime-local", obrigatorio: true, max: agora.slice(0, 16) },
        { nome: "kmPercorridos", rotulo: "Distância percorrida (km)", tipo: "number", obrigatorio: true, min: 0.01, max: 99999999.99, passo: "0.01", numerico: true },
      ] : []),
    ],
    validar: (form) => {
      if (form.chegadaPrevista && form.partida && form.chegadaPrevista <= form.partida) return { chegadaPrevista: "Informe uma chegada posterior à partida." };
      if (form.chegadaReal && form.chegadaReal < form.partida) return { chegadaReal: "Informe uma chegada igual ou posterior à partida." };
      return {};
    },
    linha: (item, dados, agora) => ({
      identidade: `${item.origem} → ${item.destino}`,
      status: viagemAtrasada(item, agora) ? "Atrasada" : STATUS_VIAGEM[item.status],
      valores: [
        `${placaDe(dados.veiculos, item.veiculoId)} · ${nomeDe(dados.motoristas, item.motoristaId)}`,
        `Partida ${dataHoraLocal(item.partida)} · Chegada ${dataHoraLocal(item.chegadaPrevista)}`,
      ],
      nota: item.chegadaReal ? `${numero.format(item.kmPercorridos)} km · Chegada real ${dataHoraLocal(item.chegadaReal)}` : null,
    }),
  },
  abastecimentos: {
    caminho: "/custos", titulo: "Custos da frota", subtitulo: "Compare gastos por veículo e registre os abastecimentos da operação.",
    novo: "Registrar abastecimento", singular: "abastecimento", plural: "abastecimentos", icon: "chart",
    dependencias: ["veiculos"], colunas: ["Veículo", "Data", "Volume", "Valor"],
    valores: (agora) => ({ data: hoje(agora) }),
    campos: (dados, form, agora) => [
      veiculo(dados), { nome: "data", rotulo: "Data do abastecimento", tipo: "date", obrigatorio: true, max: hoje(agora) },
      { nome: "litros", rotulo: "Volume (litros)", tipo: "number", min: 0.01, max: 99999999.99, passo: "0.01", numerico: true, obrigatorio: true },
      { nome: "valor", rotulo: "Valor total (R$)", tipo: "number", min: 0.01, max: 9999999999.99, passo: "0.01", numerico: true, obrigatorio: true },
    ],
    linha: (item, dados) => ({
      identidade: placaDe(dados.veiculos, item.veiculoId),
      valores: [dataBR(item.data), `${numero.format(item.litros)} L`, dinheiro.format(item.valor)],
    }),
  },
  documentos: {
    caminho: "/documentos", titulo: "Documentos da frota", subtitulo: "Acompanhe o vencimento da CNH e do licenciamento.",
    novo: "Registrar documento", singular: "documento", plural: "documentos", icon: "shield", dependencias: [],
    colunas: ["Documento", "Validade", "Status"],
    valores: () => ({ tipo: "LICENCIAMENTO" }),
    editar: (item) => ({ tipo: item.motoristaId ? "CNH" : "LICENCIAMENTO" }),
    campos: (dados, form) => [
      { nome: "tipo", rotulo: "Tipo de documento", tipo: "select", obrigatorio: true, opcoes: [{ value: "LICENCIAMENTO", label: "Licenciamento" }, { value: "CNH", label: "CNH" }], apenasFormulario: true },
      form.tipo === "CNH" ? motorista(dados) : veiculo(dados),
      { nome: "validade", rotulo: "Data de vencimento", tipo: "date", obrigatorio: true },
    ],
    linha: (item, dados, agora) => ({
      identidade: item.veiculoId ? `Licenciamento · ${placaDe(dados.veiculos, item.veiculoId)}` : `CNH · ${nomeDe(dados.motoristas, item.motoristaId)}`,
      valores: [dataBR(item.validade)], status: item.validade < hoje(agora) ? "Vencido" : "Válido",
    }),
  },
};
