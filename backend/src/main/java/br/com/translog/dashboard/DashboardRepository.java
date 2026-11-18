package br.com.translog.dashboard;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Consultas de leitura do dashboard, todas agregadas no banco (GROUP BY / COUNT).
 *
 * <p>Usa SQL nativo de propósito: o schema é criado pelo Flyway (V1) e as tabelas de motoristas e
 * ocorrências pertencem a outros módulos, então este módulo não depende das entidades deles.
 * As colunas/tabelas abaixo são constantes internas — nunca recebem entrada do usuário.</p>
 */
@Repository
public class DashboardRepository {

    private final JdbcTemplate jdbc;

    public DashboardRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public long totalVeiculos() {
        return contar("select count(*) from veiculos");
    }

    public long totalMotoristas() {
        return contar("select count(*) from motoristas");
    }

    public long totalOcorrencias() {
        return contar("select count(*) from ocorrencias");
    }

    /** Contagem por nome do enum (ex.: DISPONIVEL, EM_USO, MANUTENCAO). */
    public List<Contagem> veiculosPorStatus() {
        return agrupar("select status as chave, count(*) as total from veiculos group by status");
    }

    public List<Contagem> motoristasPorStatus() {
        return agrupar("select status as chave, count(*) as total from motoristas group by status");
    }

    public List<Contagem> ocorrenciasPorStatus() {
        return agrupar("select status as chave, count(*) as total from ocorrencias group by status");
    }

    public List<Contagem> ocorrenciasPorTipo() {
        return agrupar("select tipo as chave, count(*) as total from ocorrencias group by tipo");
    }

    private long contar(String sql) {
        Long total = jdbc.queryForObject(sql, Long.class);
        return total == null ? 0L : total;
    }

    private List<Contagem> agrupar(String sql) {
        return jdbc.query(sql, (rs, linha) -> new Contagem(rs.getString("chave"), rs.getLong("total")));
    }

    /** Uma linha de GROUP BY: valor armazenado no banco (nome do enum) e sua contagem. */
    public record Contagem(String chave, long total) {
    }
}
