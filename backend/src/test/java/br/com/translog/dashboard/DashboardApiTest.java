package br.com.translog.dashboard;

import br.com.translog.ApiTestBase;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MvcResult;

import java.nio.charset.StandardCharsets;
import java.sql.Date;
import java.time.LocalDate;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicLong;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Testa o contrato do dashboard. O banco H2 é compartilhado entre as classes de teste, então
 * as contagens são conferidas por DELTA (antes/depois), nunca por valor absoluto.
 */
class DashboardApiTest extends ApiTestBase {

    private static final AtomicLong SEQ = new AtomicLong(10_000_000_000L);

    @Autowired
    JdbcTemplate jdbc;

    @Test
    void resumoExigeToken() throws Exception {
        mvc.perform(get("/api/dashboard/resumo"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Autenticação necessária ou token inválido/expirado."));
    }

    @Test
    void resumoDevolveTodasAsChavesComRotulosEAcentoNaOrdemDoEnum() throws Exception {
        mvc.perform(comToken(get("/api/dashboard/resumo")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totais.veiculos").isNumber())
                .andExpect(jsonPath("$.totais.motoristas").isNumber())
                .andExpect(jsonPath("$.totais.ocorrencias").isNumber())
                .andExpect(jsonPath("$.totais.ocorrenciasAbertas").isNumber())
                .andExpect(jsonPath("$.totais.veiculosDisponiveis").isNumber())
                // todas as chaves do enum, inclusive as que estiverem zeradas
                .andExpect(jsonPath("$['veiculosPorStatus']['Disponível']").exists())
                .andExpect(jsonPath("$['veiculosPorStatus']['Em uso']").exists())
                .andExpect(jsonPath("$['veiculosPorStatus']['Manutenção']").exists())
                .andExpect(jsonPath("$['motoristasPorStatus']['Disponível']").exists())
                .andExpect(jsonPath("$['motoristasPorStatus']['Em viagem']").exists())
                .andExpect(jsonPath("$['motoristasPorStatus']['Inativo']").exists())
                .andExpect(jsonPath("$['ocorrenciasPorStatus']['Aberta']").exists())
                .andExpect(jsonPath("$['ocorrenciasPorStatus']['Em análise']").exists())
                .andExpect(jsonPath("$['ocorrenciasPorStatus']['Resolvida']").exists())
                .andExpect(jsonPath("$['ocorrenciasPorTipo']['Manutenção']").exists())
                .andExpect(jsonPath("$['ocorrenciasPorTipo']['Acidente']").exists())
                .andExpect(jsonPath("$['ocorrenciasPorTipo']['Atraso']").exists())
                .andExpect(jsonPath("$['ocorrenciasPorTipo']['Outro']").exists());

        String corpo = resumo();
        assertOrdem(corpo, "veiculosPorStatus", "motoristasPorStatus", "Disponível", "Em uso", "Manutenção");
        assertOrdem(corpo, "motoristasPorStatus", "ocorrenciasPorStatus", "Disponível", "Em viagem", "Inativo");
        assertOrdem(corpo, "ocorrenciasPorStatus", "ocorrenciasPorTipo", "Aberta", "Em análise", "Resolvida");
        // "Manutenção" também existe em veiculosPorStatus; aqui olhamos só o trecho de ocorrenciasPorTipo
        String tipos = corpo.substring(corpo.indexOf("\"ocorrenciasPorTipo\""));
        assertTrue(tipos.indexOf("\"Manutenção\"") < tipos.indexOf("\"Acidente\""), "ordem de ocorrenciasPorTipo");
        assertTrue(tipos.indexOf("\"Acidente\"") < tipos.indexOf("\"Atraso\""), "ordem de ocorrenciasPorTipo");
        assertTrue(tipos.indexOf("\"Atraso\"") < tipos.indexOf("\"Outro\""), "ordem de ocorrenciasPorTipo");
    }

    @Test
    void resumoContaDeltasDeDadosConhecidos() throws Exception {
        String antes = resumo();

        long veiculoDisponivel = inserirVeiculo("DISPONIVEL");
        inserirVeiculo("EM_USO");
        long motoristaDisponivel = inserirMotorista("DISPONIVEL");
        inserirMotorista("INATIVO");

        inserirOcorrencia("MANUTENCAO", "ABERTA", veiculoDisponivel, motoristaDisponivel);
        inserirOcorrencia("OUTRO", "ABERTA", veiculoDisponivel, null);
        inserirOcorrencia("ACIDENTE", "RESOLVIDA", veiculoDisponivel, null);
        inserirOcorrencia("ATRASO", "EM_ANALISE", veiculoDisponivel, null);

        String depois = resumo();

        assertEquals(numero(antes, "$.totais.veiculos") + 2, numero(depois, "$.totais.veiculos"), "totais.veiculos");
        assertEquals(numero(antes, "$.totais.motoristas") + 2, numero(depois, "$.totais.motoristas"), "totais.motoristas");
        assertEquals(numero(antes, "$.totais.ocorrencias") + 4, numero(depois, "$.totais.ocorrencias"), "totais.ocorrencias");
        assertEquals(numero(antes, "$.totais.ocorrenciasAbertas") + 2, numero(depois, "$.totais.ocorrenciasAbertas"),
                "totais.ocorrenciasAbertas (só status Aberta)");
        assertEquals(numero(antes, "$.totais.veiculosDisponiveis") + 1, numero(depois, "$.totais.veiculosDisponiveis"),
                "totais.veiculosDisponiveis");

        assertDelta(antes, depois, "$['veiculosPorStatus']['Disponível']", 1);
        assertDelta(antes, depois, "$['veiculosPorStatus']['Em uso']", 1);
        assertDelta(antes, depois, "$['veiculosPorStatus']['Manutenção']", 0);

        assertDelta(antes, depois, "$['motoristasPorStatus']['Disponível']", 1);
        assertDelta(antes, depois, "$['motoristasPorStatus']['Em viagem']", 0);
        assertDelta(antes, depois, "$['motoristasPorStatus']['Inativo']", 1);

        assertDelta(antes, depois, "$['ocorrenciasPorStatus']['Aberta']", 2);
        assertDelta(antes, depois, "$['ocorrenciasPorStatus']['Em análise']", 1);
        assertDelta(antes, depois, "$['ocorrenciasPorStatus']['Resolvida']", 1);

        assertDelta(antes, depois, "$['ocorrenciasPorTipo']['Manutenção']", 1);
        assertDelta(antes, depois, "$['ocorrenciasPorTipo']['Acidente']", 1);
        assertDelta(antes, depois, "$['ocorrenciasPorTipo']['Atraso']", 1);
        assertDelta(antes, depois, "$['ocorrenciasPorTipo']['Outro']", 1);
    }

    private String resumo() throws Exception {
        MvcResult resultado = mvc.perform(comToken(get("/api/dashboard/resumo")))
                .andExpect(status().isOk())
                .andReturn();
        return resultado.getResponse().getContentAsString(StandardCharsets.UTF_8);
    }

    private static long numero(String json, String caminho) {
        Number valor = JsonPath.read(json, caminho);
        assertNotNull(valor, caminho);
        return valor.longValue();
    }

    private static void assertDelta(String antes, String depois, String caminho, long esperado) {
        assertEquals(numero(antes, caminho) + esperado, numero(depois, caminho), caminho);
    }

    private static void assertOrdem(String json, String chaveMapa, String proximaChaveMapa, String... rotulos) {
        String trecho = json.substring(json.indexOf("\"" + chaveMapa + "\""), json.indexOf("\"" + proximaChaveMapa + "\""));
        for (int i = 1; i < rotulos.length; i++) {
            assertTrue(trecho.indexOf("\"" + rotulos[i - 1] + "\"") < trecho.indexOf("\"" + rotulos[i] + "\""),
                    "ordem de " + chaveMapa + ": " + rotulos[i - 1] + " antes de " + rotulos[i]);
        }
    }

    private long inserirVeiculo(String status) {
        String placa = placaUnica();
        jdbc.update("insert into veiculos (placa, marca, modelo, ano, status) values (?, ?, ?, ?, ?)",
                placa, "Teste", "Dashboard", 2020, status);
        return Objects.requireNonNull(
                jdbc.queryForObject("select id from veiculos where placa = ?", Long.class, placa));
    }

    private long inserirMotorista(String status) {
        String cpf = numeroUnico();
        String cnh = numeroUnico();
        jdbc.update("insert into motoristas (nome, cpf, cnh, telefone, status) values (?, ?, ?, ?, ?)",
                "Motorista Dashboard", cpf, cnh, "81999990000", status);
        return Objects.requireNonNull(
                jdbc.queryForObject("select id from motoristas where cpf = ?", Long.class, cpf));
    }

    private void inserirOcorrencia(String tipo, String status, Long veiculoId, Long motoristaId) {
        jdbc.update("insert into ocorrencias (titulo, tipo, descricao, data, status, veiculo_id, motorista_id) "
                        + "values (?, ?, ?, ?, ?, ?, ?)",
                "Ocorrência de teste", tipo, "Registro criado pelo DashboardApiTest.", Date.valueOf(LocalDate.now()),
                status, veiculoId, motoristaId);
    }

    /** CPF/CNH únicos com 11 dígitos (as colunas têm constraint UNIQUE). */
    private static String numeroUnico() {
        return String.format("%011d", SEQ.incrementAndGet());
    }
}
