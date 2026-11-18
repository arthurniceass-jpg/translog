package br.com.translog.dashboard.dto;

import java.util.Map;

/**
 * Contrato fixo de GET /api/dashboard/resumo (o front monta os gráficos com estes nomes).
 * Os mapas vêm em LinkedHashMap, na ordem de declaração dos enums, e SEMPRE com todas as
 * chaves do enum — inclusive as que estão com zero. As chaves são os rótulos com acento.
 */
public record ResumoResponse(
        Totais totais,
        Map<String, Long> veiculosPorStatus,
        Map<String, Long> motoristasPorStatus,
        Map<String, Long> ocorrenciasPorStatus,
        Map<String, Long> ocorrenciasPorTipo) {

    /** Números gerais exibidos nos cartões do topo do dashboard. */
    public record Totais(
            long veiculos,
            long motoristas,
            long ocorrencias,
            /** Somente ocorrências com status "Aberta" (as "Em análise" não entram). */
            long ocorrenciasAbertas,
            /** Veículos com status "Disponível". */
            long veiculosDisponiveis) {
    }
}
