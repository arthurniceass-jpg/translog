package br.com.translog.operacao;

import br.com.translog.ApiTestBase;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class OperacaoApiTest extends ApiTestBase {
    @Autowired JdbcTemplate jdbc;

    @Test
    void cadastraManutencaoConcluiEIncluiNoHistorico() throws Exception {
        String placa = placaUnica();
        String veiculo = veiculoJson(placa, "Disponível");
        long id = criar("/api/veiculos", veiculo.replace("}", ",\"quilometragem\":12500}"));
        mvc.perform(comToken(put("/api/veiculos/" + id)).content(veiculo))
                .andExpect(jsonPath("$.quilometragem").value(12500));

        String pendente = """
                {"veiculoId":%d,"descricao":"Revisão teste API","limiteKm":13000,"status":"AGENDADA"}
                """.formatted(id);
        long manutencao = criar("/api/manutencoes", pendente);
        mvc.perform(comToken(get("/api/manutencoes"))).andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", hasItem((int) manutencao)));
        mvc.perform(comToken(delete("/api/veiculos/" + id))).andExpect(status().isConflict());

        String concluida = """
                {"veiculoId":%d,"descricao":"Revisão teste API","limiteKm":13000,"status":"CONCLUIDA","concluidaEm":"%s","custo":199.50}
                """.formatted(id, hoje());
        mvc.perform(comToken(put("/api/manutencoes/" + manutencao)).content(concluida))
                .andExpect(status().isOk()).andExpect(jsonPath("$.custo").value(199.50));
        mvc.perform(comToken(post("/api/manutencoes")).content(pendente.replace("\"limiteKm\":13000,", "")))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.fieldErrors.prazo").exists());
        mvc.perform(comToken(delete("/api/manutencoes/" + manutencao))).andExpect(status().isNoContent());
    }

    @Test
    void agendaProtegeVeiculoEMotoristaEAceitaLateRealComAgendaPosterior() throws Exception {
        long v1 = criarVeiculo();
        long v2 = criarVeiculo();
        long m1 = criarMotorista();
        long m2 = criarMotorista();
        long primeira = criar("/api/viagens", viagem(v1, m1, "10:00", "11:00"));
        criar("/api/viagens", viagem(v1, m1, "11:00", "12:00"));
        mvc.perform(comToken(post("/api/viagens")).content(viagem(v1, m2, "10:30", "11:30")))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.fieldErrors.veiculoId").exists());
        mvc.perform(comToken(post("/api/viagens")).content(viagem(v2, m1, "10:30", "11:30")))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.fieldErrors.motoristaId").exists());
        String encerrada = viagem(v1, m1, "10:00", "11:00").replace("\"PROGRAMADA\"", "\"CONCLUIDA\",\"chegadaReal\":\"2025-03-10T11:30\",\"kmPercorridos\":125.5");
        mvc.perform(comToken(put("/api/viagens/" + primeira)).content(encerrada))
                .andExpect(status().isOk()).andExpect(jsonPath("$.kmPercorridos").value(125.5));
        mvc.perform(comToken(get("/api/viagens"))).andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", hasItem((int) primeira)));
    }

    @Test
    void apenasUmaRequisicaoSimultaneaReservaOMesmoVeiculo() throws Exception {
        long veiculo = criarVeiculo();
        long motorista1 = criarMotorista();
        long motorista2 = criarMotorista();
        CountDownLatch iniciar = new CountDownLatch(1);
        try (var executor = Executors.newFixedThreadPool(2)) {
            var a = executor.submit(() -> { iniciar.await(); return statusViagem(veiculo, motorista1); });
            var b = executor.submit(() -> { iniciar.await(); return statusViagem(veiculo, motorista2); });
            iniciar.countDown();
            assertThat(a.get()).isIn(201, 409);
            assertThat(a.get() + b.get()).isEqualTo(201 + 409);
        }
    }

    @Test
    void guardaAbastecimentosEDocumentosComValidacao() throws Exception {
        long v = criarVeiculo();
        long m = criarMotorista();
        long doc = criar("/api/documentos", ("{\"motoristaId\":%d,\"validade\":\"2030-01-01\"}").formatted(m));
        mvc.perform(comToken(post("/api/documentos")).content(("{\"motoristaId\":%d,\"validade\":\"2030-01-01\"}").formatted(m)))
                .andExpect(status().isConflict());
        mvc.perform(comToken(get("/api/documentos"))).andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", hasItem((int) doc)));

        long a = criar("/api/abastecimentos", ("{\"veiculoId\":%d,\"data\":\"%s\",\"litros\":21.6,\"valor\":130.40}").formatted(v, hoje()));
        mvc.perform(comToken(get("/api/abastecimentos"))).andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", hasItem((int) a)));
        mvc.perform(comToken(post("/api/abastecimentos")).content(("{\"veiculoId\":%d,\"data\":\"%s\",\"litros\":15,\"valor\":123}").formatted(v, hoje().plusDays(1))))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.fieldErrors.data").exists());
    }

    @Test
    void historicoPrazosAnexosEResolucaoMantemContratoOriginal() throws Exception {
        long v = criarVeiculo();
        String corpo = """
                {"titulo":"Atraso teste API","descricao":"Conferência","tipo":"Atraso","data":"%s","status":"Aberta","veiculoId":%d}
                """.formatted(hoje(), v);
        long id = criar("/api/ocorrencias", corpo);
        String raiz = "/api/ocorrencias/" + id;
        String responsavel = mvc.perform(comToken(get("/api/auth/me"))).andReturn().getResponse().getContentAsString();
        long operador = idDe(responsavel);
        mvc.perform(comToken(put(raiz + "/acompanhamento"))
                        .content(("{\"responsavelId\":%d,\"prazo\":\"%s\",\"prioridade\":\"URGENTE\"}").formatted(operador, hoje())))
                .andExpect(status().isOk()).andExpect(jsonPath("$.prioridade").value("URGENTE"));
        mvc.perform(comToken(put(raiz)).content(corpo.replace("Aberta", "Resolvida")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("Resolvida"));
        mvc.perform(comToken(get(raiz + "/acompanhamento")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dados.responsavelId").value(operador))
                .andExpect(jsonPath("$.historico[0].anterior").value("Aberta"))
                .andExpect(jsonPath("$.historico[0].novoStatus").value("Resolvida"))
                .andExpect(jsonPath("$.historico[0].autor").value("Teste"));
        mvc.perform(comToken(get("/api/resolucoes"))).andExpect(status().isOk())
                .andExpect(jsonPath("$[*].ocorrenciaId", hasItem((int) id)));

        byte[] pdf = "%PDF-1.4\n%%EOF".getBytes(java.nio.charset.StandardCharsets.US_ASCII);
        var anexo = new MockMultipartFile("arquivo", "registro.pdf", "application/pdf", pdf);
        long anexoId = idDe(mvc.perform(multipart(raiz + "/anexos").file(anexo).header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
        var invalido = new MockMultipartFile("arquivo", "invalido.pdf", "application/pdf", new byte[]{1, 2, 3});
        mvc.perform(multipart(raiz + "/anexos").file(invalido).header("Authorization", "Bearer " + token)).andExpect(status().isBadRequest());
        mvc.perform(get(raiz + "/anexos/" + anexoId)).andExpect(status().isUnauthorized());
        mvc.perform(comToken(get(raiz + "/anexos/" + anexoId))).andExpect(status().isOk())
                .andExpect(header().string("X-Content-Type-Options", "nosniff")).andExpect(content().bytes(pdf));
        mvc.perform(comToken(delete(raiz))).andExpect(status().isNoContent());
        mvc.perform(comToken(get(raiz + "/anexos/" + anexoId))).andExpect(status().isNotFound());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM ocorrencia_status_historico WHERE ocorrencia_id=?", Long.class, id)).isZero();
    }

    private long criarVeiculo() throws Exception {
        return criar("/api/veiculos", veiculoJson(placaUnica(), "Disponível"));
    }

    private long criarMotorista() throws Exception {
        String a = documento(), b = documento();
        return criar("/api/motoristas", ("""
                {"nome":"Motorista teste","cpf":"%s","cnh":"%s","telefone":"81999999999","status":"Disponível","categorias":["B"]}
                """).formatted(a, b));
    }

    private static String documento() {
        return String.format("%011d", Math.floorMod(UUID.randomUUID().getLeastSignificantBits(), 100_000_000_000L));
    }

    private static LocalDate hoje() { return LocalDate.now(ZoneId.of("America/Sao_Paulo")); }

    private static String viagem(long veiculo, long motorista, String partida, String chegada) {
        return ("""
                {"veiculoId":%d,"motoristaId":%d,"origem":"Recife","destino":"Caruaru","partida":"2025-03-10T%s",
                 "chegadaPrevista":"2025-03-10T%s","status":"PROGRAMADA"}
                """).formatted(veiculo, motorista, partida, chegada);
    }

    private int statusViagem(long veiculo, long motorista) throws Exception {
        return mvc.perform(comToken(post("/api/viagens")).content(viagem(veiculo, motorista, "10:00", "11:00")))
                .andReturn().getResponse().getStatus();
    }

    private long criar(String url, String json) throws Exception {
        return idDe(mvc.perform(comToken(post(url)).content(json)).andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString());
    }

    private static long idDe(String json) {
        var id = Pattern.compile("\"id\":(\\d+)").matcher(json);
        assertThat(id.find()).as("Resposta com id: %s", json).isTrue();
        return Long.parseLong(id.group(1));
    }
}
