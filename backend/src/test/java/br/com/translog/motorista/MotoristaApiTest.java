package br.com.translog.motorista;

import br.com.translog.ApiTestBase;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class MotoristaApiTest extends ApiTestBase {

    @Autowired
    JdbcTemplate jdbc;

    /** O banco de teste é compartilhado entre as classes: CPF/CNH sempre aleatórios. */
    private static String onzeDigitos() {
        return String.valueOf(ThreadLocalRandom.current().nextLong(10_000_000_000L, 100_000_000_000L));
    }

    private static String telefone() {
        return "81" + ThreadLocalRandom.current().nextLong(100_000_000L, 1_000_000_000L);
    }

    private static String nomeUnico() {
        return "Motorista QA " + UUID.randomUUID().toString().substring(0, 8);
    }

    private static String motoristaJson(String nome, String cpf, String cnh, String telefone, String status,
                                        String categoriasJson) {
        return "{\"nome\":\"" + nome + "\",\"cpf\":\"" + cpf + "\",\"cnh\":\"" + cnh
                + "\",\"categorias\":" + categoriasJson
                + ",\"telefone\":\"" + telefone + "\",\"status\":\"" + status + "\"}";
    }

    private static String jsonValido(String status) {
        return motoristaJson(nomeUnico(), onzeDigitos(), onzeDigitos(), telefone(), status, "[\"A\",\"E\"]");
    }

    private long criar(String json) throws Exception {
        String corpo = mvc.perform(comToken(post("/api/motoristas")).content(json))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Matcher m = Pattern.compile("\"id\":(\\d+)").matcher(corpo);
        m.find();
        return Long.parseLong(m.group(1));
    }

    @Test
    void criaELeMotoristaComCategoriasNormalizadas() throws Exception {
        String nome = nomeUnico();
        String cpf = onzeDigitos();
        String cnh = onzeDigitos();
        String tel = telefone();

        String corpo = mvc.perform(comToken(post("/api/motoristas"))
                        .content(motoristaJson(nome, cpf, cnh, tel, "Disponível", "[\"e\",\"E\",\"a\"]")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.nome").value(nome))
                .andExpect(jsonPath("$.cpf").value(cpf))
                .andExpect(jsonPath("$.cnh").value(cnh))
                .andExpect(jsonPath("$.categorias.length()").value(2))
                .andExpect(jsonPath("$.categorias[0]").value("A"))
                .andExpect(jsonPath("$.categorias[1]").value("E"))
                .andExpect(jsonPath("$.telefone").value(tel))
                .andExpect(jsonPath("$.status").value("Disponível"))
                .andReturn().getResponse().getContentAsString();

        Matcher m = Pattern.compile("\"id\":(\\d+)").matcher(corpo);
        m.find();
        long id = Long.parseLong(m.group(1));

        mvc.perform(comToken(get("/api/motoristas/" + id)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value(nome))
                .andExpect(jsonPath("$.categorias[0]").value("A"));
    }

    @Test
    void atualizaMotorista() throws Exception {
        String cpf = onzeDigitos();
        String cnh = onzeDigitos();
        long id = criar(motoristaJson(nomeUnico(), cpf, cnh, telefone(), "Disponível", "[\"A\"]"));

        String novoNome = nomeUnico();
        mvc.perform(comToken(put("/api/motoristas/" + id))
                        .content(motoristaJson(novoNome, cpf, cnh, telefone(), "Em viagem", "[\"B\",\"C\"]")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value(novoNome))
                .andExpect(jsonPath("$.status").value("Em viagem"))
                .andExpect(jsonPath("$.categorias[0]").value("B"))
                .andExpect(jsonPath("$.categorias[1]").value("C"));

        mvc.perform(comToken(get("/api/motoristas/" + id)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value(novoNome))
                .andExpect(jsonPath("$.categorias.length()").value(2));
    }

    @Test
    void excluiMotorista() throws Exception {
        long id = criar(jsonValido("Inativo"));

        mvc.perform(comToken(delete("/api/motoristas/" + id))).andExpect(status().isNoContent());
        mvc.perform(comToken(get("/api/motoristas/" + id)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Motorista não encontrado."));
    }

    @Test
    void listaFiltraPorBuscaEmNomeCnhECpf() throws Exception {
        String nome = nomeUnico();
        String cpf = onzeDigitos();
        String cnh = onzeDigitos();
        criar(motoristaJson(nome, cpf, cnh, telefone(), "Disponível", "[\"A\"]"));

        mvc.perform(comToken(get("/api/motoristas")).param("q", nome.substring(13).toLowerCase()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].nome", hasItem(nome)));

        mvc.perform(comToken(get("/api/motoristas")).param("q", cnh.substring(4)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].cnh", hasItem(cnh)));

        mvc.perform(comToken(get("/api/motoristas")).param("q", cpf.substring(0, 6)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].cpf", hasItem(cpf)));
    }

    @Test
    void listaFiltraPorStatus() throws Exception {
        String nome = nomeUnico();
        criar(motoristaJson(nome, onzeDigitos(), onzeDigitos(), telefone(), "Em viagem", "[\"D\",\"E\"]"));

        mvc.perform(comToken(get("/api/motoristas")).param("status", "Em viagem"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].nome", hasItem(nome)))
                // duas categorias não podem duplicar o motorista na listagem
                .andExpect(jsonPath("$[?(@.nome == '" + nome + "')].id", hasSize(1)));

        mvc.perform(comToken(get("/api/motoristas")).param("status", "Inativo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].nome", not(hasItem(nome))));
    }

    @Test
    void statusInexistenteNoFiltroRetorna400() throws Exception {
        mvc.perform(comToken(get("/api/motoristas")).param("status", "Dormindo"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Valor inválido")));
    }

    @Test
    void validacaoRetorna400ComFieldErrorsEmPortugues() throws Exception {
        // CPF curto + telefone curto
        mvc.perform(comToken(post("/api/motoristas"))
                        .content(motoristaJson("Teste", "123", onzeDigitos(), "123", "Disponível", "[\"A\"]")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.cpf")
                        .value("CPF inválido. Informe exatamente 11 dígitos, somente números."))
                .andExpect(jsonPath("$.fieldErrors.telefone")
                        .value("Telefone inválido. Informe de 10 a 11 dígitos, somente números."));

        // lista de categorias vazia
        mvc.perform(comToken(post("/api/motoristas"))
                        .content(motoristaJson("Teste", onzeDigitos(), onzeDigitos(), telefone(), "Disponível", "[]")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.categorias").value("Selecione pelo menos uma categoria."));

        // categoria fora de A..E
        mvc.perform(comToken(post("/api/motoristas"))
                        .content(motoristaJson("Teste", onzeDigitos(), onzeDigitos(), telefone(), "Disponível", "[\"X\"]")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.categorias")
                        .value("Categoria inválida. Use A, B, C, D ou E."));
    }

    @Test
    void statusInvalidoNoCorpoRetorna400() throws Exception {
        mvc.perform(comToken(post("/api/motoristas"))
                        .content(motoristaJson(nomeUnico(), onzeDigitos(), onzeDigitos(), telefone(), "Voando", "[\"A\"]")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void cpfDuplicadoRetorna409() throws Exception {
        String cpf = onzeDigitos();
        criar(motoristaJson(nomeUnico(), cpf, onzeDigitos(), telefone(), "Disponível", "[\"A\"]"));

        mvc.perform(comToken(post("/api/motoristas"))
                        .content(motoristaJson(nomeUnico(), cpf, onzeDigitos(), telefone(), "Disponível", "[\"A\"]")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Já existe um motorista com este CPF."));
    }

    @Test
    void cnhDuplicadaRetorna409() throws Exception {
        String cnh = onzeDigitos();
        criar(motoristaJson(nomeUnico(), onzeDigitos(), cnh, telefone(), "Disponível", "[\"A\"]"));

        mvc.perform(comToken(post("/api/motoristas"))
                        .content(motoristaJson(nomeUnico(), onzeDigitos(), cnh, telefone(), "Disponível", "[\"A\"]")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Já existe um motorista com esta CNH."));
    }

    @Test
    void atualizacaoComCpfDeOutroMotoristaRetorna409() throws Exception {
        String cpf = onzeDigitos();
        criar(motoristaJson(nomeUnico(), cpf, onzeDigitos(), telefone(), "Disponível", "[\"A\"]"));
        long id = criar(jsonValido("Disponível"));

        mvc.perform(comToken(put("/api/motoristas/" + id))
                        .content(motoristaJson(nomeUnico(), cpf, onzeDigitos(), telefone(), "Disponível", "[\"A\"]")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Já existe um motorista com este CPF."));
    }

    @Test
    void exclusaoBloqueadaQuandoHaOcorrencias() throws Exception {
        long id = criar(jsonValido("Disponível"));

        String placa = placaUnica();
        jdbc.update("insert into veiculos (placa, marca, modelo, ano, status) values (?,?,?,?,?)",
                placa, "Volvo", "FH 540", 2021, "DISPONIVEL");
        Long veiculoId = jdbc.queryForObject("select id from veiculos where placa = ?", Long.class, placa);

        jdbc.update("insert into ocorrencias (titulo, tipo, descricao, data, status, veiculo_id, motorista_id) "
                + "values ('Teste','OUTRO','desc', current_date, 'ABERTA', ?, ?)", veiculoId, id);

        mvc.perform(comToken(delete("/api/motoristas/" + id)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("ocorrência(s) vinculada(s)")));

        // continua existindo
        mvc.perform(comToken(get("/api/motoristas/" + id))).andExpect(status().isOk());
    }

    @Test
    void idInexistenteRetorna404() throws Exception {
        mvc.perform(comToken(get("/api/motoristas/99999999")))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Motorista não encontrado."));

        mvc.perform(comToken(delete("/api/motoristas/99999999")))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Motorista não encontrado."));
    }

    @Test
    void semTokenRetorna401() throws Exception {
        mvc.perform(get("/api/motoristas")).andExpect(status().isUnauthorized());
    }
}
