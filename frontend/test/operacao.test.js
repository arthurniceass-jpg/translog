import { test } from "node:test";
import assert from "node:assert/strict";
import { agoraNaFrota, alertasDaFrota, estadoManutencao, resumoDeCustos, viagemAtrasada } from "../src/lib/operacao.js";

test("usa o fuso da operação e respeita o horário exato da chegada", () => {
  assert.equal(agoraNaFrota(new Date("2026-11-20T02:59:00Z")), "2026-11-19T23:59:00");
  assert.equal(agoraNaFrota(new Date("2026-11-20T03:00:00Z")), "2026-11-20T00:00:00");
  const viagem = { status: "EM_ANDAMENTO", chegadaPrevista: "2026-11-19T12:20" };
  assert.equal(viagemAtrasada(viagem, "2026-11-19T12:20:00"), false);
  assert.equal(viagemAtrasada(viagem, "2026-11-19T12:20:01"), true);
});

test("classifica a manutenção por data e odômetro com limite inclusivo", () => {
  const hoje = "2026-11-20";
  assert.equal(estadoManutencao({ status: "AGENDADA", limiteKm: 2000 }, 2000, hoje), "Vencida");
  assert.equal(estadoManutencao({ status: "AGENDADA", limiteKm: 2000 }, 1000, hoje), "Próxima");
  assert.equal(estadoManutencao({ status: "AGENDADA", prazo: "2026-11-27" }, null, hoje), "Próxima");
  assert.equal(estadoManutencao({ status: "CONCLUIDA", prazo: "2026-11-19" }, null, hoje), "Concluída");
});

test("consolida as pendências e identifica dados indisponíveis", () => {
  const dados = {
    veiculos: [], motoristas: [], falhas: [], viagens: [],
    manutencoes: [{ id: 1, descricao: "Freios", veiculoId: 2, prazo: "2026-11-18", status: "AGENDADA" }],
    documentos: [{ id: 2, veiculoId: 2, validade: "2026-12-20" }],
    ocorrencias: [{ id: 3, titulo: "Pendência", status: "Aberta" }],
    acompanhamentos: [{ ocorrenciaId: 3, prazo: "2026-11-18", prioridade: "URGENTE" }],
  };
  const agora = "2026-11-20T10:00:00";
  const alertas = alertasDaFrota(dados, agora);
  assert.deepEqual(alertas.map((a) => a.tipo), ["Manutenção", "Ocorrência", "Documento"]);
  assert.match(alertas[1].texto, /Sem responsável · Prazo vencido · Urgente/);
  assert.equal(alertasDaFrota({ ...dados, falhas: ["acompanhamentos"] }, agora).some((a) => a.tipo === "Ocorrência"), false);
});

test("soma custos em centavos e só usa distância de viagens concluídas no período", () => {
  const dados = {
    abastecimentos: [
      { veiculoId: 1, data: "2026-11-05", valor: 0.1 }, { veiculoId: 1, data: "2026-11-07", valor: 0.2 },
      { veiculoId: 2, data: "2026-11-05", valor: 34 }, { veiculoId: 1, data: "2026-10-05", valor: 400 },
    ],
    manutencoes: [
      { veiculoId: 1, status: "CONCLUIDA", concluidaEm: "2026-11-09", custo: 59.7 },
      { veiculoId: 1, status: "AGENDADA", prazo: "2026-11-20", custo: 1000 },
    ],
    viagens: [
      { veiculoId: 1, status: "CONCLUIDA", chegadaReal: "2026-11-01T17:00", kmPercorridos: 10 },
      { veiculoId: 1, status: "EM_ANDAMENTO", kmPercorridos: 999 },
    ],
  };
  assert.deepEqual(resumoDeCustos(dados, "2026-11", "1"), {
    linhas: [{ veiculoId: 1, combustivel: 0.3, manutencao: 59.7, km: 10, total: 60 }],
    total: 60, km: 10, porKm: 6,
  });
  assert.equal(resumoDeCustos(dados, "2026-11", "2").porKm, null);
});
