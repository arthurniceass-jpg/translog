package br.com.translog.veiculo;

import br.com.translog.ApiTestBase;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class VeiculoApiTest extends ApiTestBase {

    @Autowired
    JdbcTemplate jdbc;

    private long criar(String placa, String status) throws Exception {
        String corpo = mvc.perform(comToken(post("/api/veiculos")).content(veiculoJson(placa, status)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Matcher m = Pattern.compile("\"id\":(\\d+)").matcher(corpo);
        m.find();
        return Long.parseLong(m.group(1));
    }

    @Test
    void criaNormalizaPlacaEExpoeStatusComAcento() throws Exception {
        String placa = placaUnica();
        mvc.perform(comToken(post("/api/veiculos")).content(veiculoJson(placa.toLowerCase(), "Manutenção")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.placa").value(placa))
                .andExpect(jsonPath("$.status").value("Manutenção"));
    }

    @Test
    void crudCompleto() throws Exception {
        String placa = placaUnica();
        long id = criar(placa, "Disponível");

        mvc.perform(comToken(get("/api/veiculos/" + id)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.modelo").value("FH 540"));

        mvc.perform(comToken(put("/api/veiculos/" + id)).content(veiculoJson(placa, "Em uso")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("Em uso"));

        mvc.perform(comToken(delete("/api/veiculos/" + id))).andExpect(status().isNoContent());
        mvc.perform(comToken(get("/api/veiculos/" + id)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Veículo não encontrado."));
    }

    @Test
    void listaFiltraPorBuscaEStatus() throws Exception {
        String placa = placaUnica();
        criar(placa, "Em uso");
        mvc.perform(comToken(get("/api/veiculos")).param("q", placa.substring(0, 5)).param("status", "Em uso"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].placa", hasItem(placa)));
        mvc.perform(comToken(get("/api/veiculos")).param("q", placa).param("status", "Disponível"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].placa", not(hasItem(placa))));
    }

    @Test
    void filtroDeStatusInexistenteRetorna400() throws Exception {
        mvc.perform(comToken(get("/api/veiculos")).param("status", "Quebrado"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void validacaoRetorna400ComFieldErrorsEmPortugues() throws Exception {
        mvc.perform(comToken(post("/api/veiculos"))
                        .content("{\"placa\":\"123\",\"marca\":\"\",\"modelo\":\"X\",\"ano\":1800,\"status\":\"Disponível\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.placa").value("Placa inválida. Use ABC1234 ou ABC1D23."))
                .andExpect(jsonPath("$.fieldErrors.marca").value("Informe a marca."))
                .andExpect(jsonPath("$.fieldErrors.ano").value("O ano deve estar entre 1950 e o próximo ano."));
    }

    @Test
    void statusInvalidoNoCorpoRetorna400() throws Exception {
        mvc.perform(comToken(post("/api/veiculos")).content(veiculoJson(placaUnica(), "Voando")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void placaDuplicadaRetorna409() throws Exception {
        String placa = placaUnica();
        criar(placa, "Disponível");
        mvc.perform(comToken(post("/api/veiculos")).content(veiculoJson(placa, "Disponível")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Já existe um veículo com a placa " + placa + "."));
    }

    @Test
    void exclusaoBloqueadaQuandoHaOcorrencias() throws Exception {
        long id = criar(placaUnica(), "Disponível");
        jdbc.update("insert into ocorrencias (titulo, tipo, descricao, data, status, veiculo_id) "
                + "values ('Teste','OUTRO','desc', current_date, 'ABERTA', ?)", id);

        mvc.perform(comToken(delete("/api/veiculos/" + id)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("ocorrência(s) vinculada(s)")));

        // continua existindo
        mvc.perform(comToken(get("/api/veiculos/" + id))).andExpect(status().isOk());
    }
}
