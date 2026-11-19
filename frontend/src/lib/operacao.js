export const STATUS_MANUTENCAO = { AGENDADA: "Agendada", EM_EXECUCAO: "Em execução", CONCLUIDA: "Concluída" };
export const STATUS_VIAGEM = { PROGRAMADA: "Programada", EM_ANDAMENTO: "Em andamento", CONCLUIDA: "Concluída", CANCELADA: "Cancelada" };
export const PRIORIDADES = { BAIXA: "Baixa", NORMAL: "Normal", ALTA: "Alta", URGENTE: "Urgente" };

export const DIAS_DOCUMENTO = 30;
export const DIAS_MANUTENCAO = 7;
export const KM_MANUTENCAO = 1000;

const relogioFrota = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
});

export function agoraNaFrota(data = new Date()) {
  const partes = Object.fromEntries(relogioFrota.formatToParts(data).map(({ type, value }) => [type, value]));
  return `${partes.year}-${partes.month}-${partes.day}T${partes.hour}:${partes.minute}:${partes.second}`;
}

export function somarDias(data, dias) {
  const referencia = new Date(`${data}T12:00:00Z`);
  referencia.setUTCDate(referencia.getUTCDate() + dias);
  return referencia.toISOString().slice(0, 10);
}

export function dataHoraLocal(valor) {
  if (!valor) return "—";
  const [dia, hora] = valor.split("T");
  return `${dia.split("-").reverse().join("/")} às ${hora.slice(0, 5)}`;
}

export const dinheiro = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const numero = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
export const placaDe = (veiculos, id) => veiculos.find((v) => v.id === id)?.placa ?? `Veículo #${id}`;
export const nomeDe = (motoristas, id) => motoristas.find((m) => m.id === id)?.nome ?? `Motorista #${id}`;
export const horarioComparavel = (valor) => valor.length === 16 ? valor + ":00" : valor.slice(0, 19);
export const viagemAtrasada = (v, agora) =>
  ["PROGRAMADA", "EM_ANDAMENTO"].includes(v.status) && horarioComparavel(v.chegadaPrevista) < horarioComparavel(agora);

export function estadoManutencao(manutencao, kmAtual, hoje) {
  if (manutencao.status === "CONCLUIDA") return "Concluída";
  const { prazo, limiteKm } = manutencao;
  if ((prazo && prazo < hoje) || (limiteKm != null && kmAtual != null && kmAtual >= limiteKm)) return "Vencida";
  if ((prazo && prazo <= somarDias(hoje, DIAS_MANUTENCAO))
      || (limiteKm != null && kmAtual != null && kmAtual >= limiteKm - KM_MANUTENCAO)) return "Próxima";
  return STATUS_MANUTENCAO[manutencao.status];
}

export function alertasDaFrota(dados, agora) {
  const hoje = agora.slice(0, 10);
  const { manutencoes, veiculos, viagens, documentos, motoristas, ocorrencias, acompanhamentos, falhas } = dados;
  const alertas = [];

  if (!falhas.includes("manutencoes")) {
    for (const item of manutencoes) {
      const veiculo = veiculos.find((v) => v.id === item.veiculoId);
      const estado = estadoManutencao(item, veiculo?.quilometragem, hoje);
      if (estado === "Vencida" || estado === "Próxima") alertas.push({
        chave: `manutencao-${item.id}`, tipo: "Manutenção", titulo: item.descricao,
        texto: `${placaDe(veiculos, item.veiculoId)} · ${estado === "Vencida" ? "Prazo ou limite atingido" : "Próxima do vencimento"}`,
        critico: estado === "Vencida", to: `/manutencoes?editar=${item.id}`,
      });
    }
  }

  if (!falhas.includes("viagens")) {
    for (const viagem of viagens.filter((v) => viagemAtrasada(v, agora))) alertas.push({
      chave: `viagem-${viagem.id}`, tipo: "Viagem", titulo: `${viagem.origem} → ${viagem.destino}`,
      texto: `Chegada prevista em ${dataHoraLocal(viagem.chegadaPrevista)}`, critico: true,
      to: `/viagens?editar=${viagem.id}`,
    });
  }

  if (!falhas.includes("documentos")) {
    for (const documento of documentos.filter((d) => d.validade <= somarDias(hoje, DIAS_DOCUMENTO))) {
      alertas.push({
        chave: `documento-${documento.id}`, tipo: "Documento",
        titulo: documento.veiculoId ? `Licenciamento · ${placaDe(veiculos, documento.veiculoId)}` : `CNH · ${nomeDe(motoristas, documento.motoristaId)}`,
        texto: `Validade em ${documento.validade.split("-").reverse().join("/")}`,
        critico: documento.validade < hoje, to: `/documentos?editar=${documento.id}`,
      });
    }
  }

  if (!falhas.includes("acompanhamentos") && !falhas.includes("ocorrencias")) {
    const porId = new Map(acompanhamentos.map((a) => [a.ocorrenciaId, a]));
    for (const item of ocorrencias.filter((o) => o.status !== "Resolvida")) {
      const controle = porId.get(item.id);
      const vencida = Boolean(controle?.prazo && controle.prazo < hoje);
      if (!controle?.responsavelId || vencida || controle.prioridade === "URGENTE") alertas.push({
        chave: `ocorrencia-${item.id}`, tipo: "Ocorrência", titulo: item.titulo,
        texto: [!controle?.responsavelId && "Sem responsável", vencida && "Prazo vencido", controle?.prioridade === "URGENTE" && "Urgente"].filter(Boolean).join(" · "),
        critico: vencida || controle?.prioridade === "URGENTE", to: `/ocorrencias/${item.id}`,
      });
    }
  }

  return alertas.sort((a, b) => Number(b.critico) - Number(a.critico));
}

export function resumoDeCustos({ manutencoes, abastecimentos, viagens }, mes, veiculoId = "") {
  const porVeiculo = new Map();
  function somar(id, campo, valor) {
    if (veiculoId && String(id) !== veiculoId) return;
    if (!porVeiculo.has(id)) porVeiculo.set(id, { veiculoId: id, combustivel: 0, manutencao: 0, km: 0 });
    const linha = porVeiculo.get(id);
    linha[campo] += campo === "km" ? valor : Math.round(valor * 100);
  }

  for (const item of abastecimentos) {
    if (item.data.startsWith(mes)) somar(item.veiculoId, "combustivel", item.valor);
  }
  for (const item of manutencoes) {
    if (item.status === "CONCLUIDA" && item.concluidaEm?.startsWith(mes) && item.custo != null) {
      somar(item.veiculoId, "manutencao", item.custo);
    }
  }
  for (const item of viagens) {
    if (item.status === "CONCLUIDA" && item.chegadaReal?.startsWith(mes)) somar(item.veiculoId, "km", item.kmPercorridos);
  }
  const linhas = [...porVeiculo.values()].map((l) => ({
    ...l, combustivel: l.combustivel / 100, manutencao: l.manutencao / 100,
    total: (l.combustivel + l.manutencao) / 100,
  }));
  const total = linhas.reduce((s, l) => s + Math.round(l.total * 100), 0) / 100;
  const km = linhas.reduce((s, l) => s + l.km, 0);
  return { linhas, total, km, porKm: km ? total / km : null };
}
