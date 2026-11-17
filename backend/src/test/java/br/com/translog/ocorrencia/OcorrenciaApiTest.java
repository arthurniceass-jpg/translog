package br.com.translog.ocorrencia;

import br.com.translog.ApiTestBase;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.LongStream;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasKey;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Transactional
class OcorrenciaApiTest extends ApiTestBase {

    private static final String BASE = "/api/ocorrencias";
    private static final long ID_INEXISTENTE = Long.MAX_VALUE;

    @Autowired
    private ObjectMapper json;

    @Autowired
    private JdbcTemplate jdbc;

    @BeforeEach
    void isolarOcorrencias() {
        // Outros testes de API deixam ocorrências no contexto compartilhado. O rollback restaura esses dados.
        jdbc.update("delete from ocorrencias");
    }

    @Test
    void criaSemMotoristaComRespostaPlanaENormalizaTextos() throws Exception {
        long veiculoId = criarVeiculo();
        Map<String, Object> dados = dados(veiculoId);
        dados.put("titulo", "  Colisão no pátio  ");
        dados.put("descricao", "  Colisão leve.  ");
        dados.remove("motoristaId");

        mvc.perform(comToken(post(BASE)).content(json.writeValueAsString(dados)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.titulo").value("Colisão no pátio"))
                .andExpect(jsonPath("$.tipo").value("Acidente"))
                .andExpect(jsonPath("$.descricao").value("Colisão leve."))
                .andExpect(jsonPath("$.data").value("2026-09-20"))
                .andExpect(jsonPath("$.status").value("Aberta"))
                .andExpect(jsonPath("$.veiculoId").value(veiculoId))
                .andExpect(jsonPath("$", hasKey("motoristaId")))
                .andExpect(jsonPath("$.motoristaId").value(nullValue()))
                .andExpect(jsonPath("$.veiculo").doesNotExist())
                .andExpect(jsonPath("$.motorista").doesNotExist());
    }

    @Test
    void criaComMotoristaExistente() throws Exception {
        Map<String, Object> dados = dados(criarVeiculo());
        long motoristaId = criarMotorista();
        dados.put("motoristaId", motoristaId);
        long id = criar(dados);

        mvc.perform(comToken(get(BASE + "/" + id)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.motoristaId").value(motoristaId));
    }

    @Test
    void crudCompletoAtualizaTodosOsCamposERemoveMotorista() throws Exception {
        Map<String, Object> dados = dados(criarVeiculo());
        dados.put("motoristaId", criarMotorista());
        long id = criar(dados);

        mvc.perform(comToken(get(BASE + "/" + id)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("Aberta"));

        long outroVeiculo = criarVeiculo();
        Map<String, Object> atualizados = dados(outroVeiculo);
        atualizados.put("titulo", "Revisão concluída");
        atualizados.put("descricao", "Freios revisados.");
        atualizados.put("tipo", "Manutenção");
        atualizados.put("data", "2026-09-21");
        atualizados.put("status", "Resolvida");

        mvc.perform(comToken(put(BASE + "/" + id)).content(json.writeValueAsString(atualizados)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.titulo").value("Revisão concluída"))
                .andExpect(jsonPath("$.tipo").value("Manutenção"))
                .andExpect(jsonPath("$.descricao").value("Freios revisados."))
                .andExpect(jsonPath("$.data").value("2026-09-21"))
                .andExpect(jsonPath("$.status").value("Resolvida"))
                .andExpect(jsonPath("$.veiculoId").value(outroVeiculo))
                .andExpect(jsonPath("$.motoristaId").value(nullValue()));

        mvc.perform(comToken(get(BASE + "/" + id)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("Resolvida"))
                .andExpect(jsonPath("$.veiculoId").value(outroVeiculo))
                .andExpect(jsonPath("$.motoristaId").value(nullValue()));

        mvc.perform(comToken(delete(BASE + "/" + id)))
                .andExpect(status().isNoContent())
                .andExpect(content().string(""));
        mvc.perform(comToken(get(BASE + "/" + id)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Ocorrência não encontrada."));
    }

    @Test
    void atualizaVinculoParaMotoristaExistente() throws Exception {
        Map<String, Object> dados = dados(criarVeiculo());
        long id = criar(dados);
        long motoristaId = criarMotorista();
        dados.put("motoristaId", motoristaId);

        mvc.perform(comToken(put(BASE + "/" + id)).content(json.writeValueAsString(dados)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.motoristaId").value(motoristaId));
    }

    @Test
    void listaSemFiltrosOrdenaPorDataDecrescenteEDesempataPorIdDecrescente() throws Exception {
        long veiculoId = criarVeiculo();
        long recente = criar(veiculoId, "Recente", "Descrição", "Acidente", "Aberta", "2026-09-22");
        long antigo = criar(veiculoId, "Antigo", "Descrição", "Outro", "Resolvida", "2026-09-20");
        long empate = criar(veiculoId, "Empate", "Descrição", "Outro", "Em análise", "2026-09-22");

        esperarIds(get(BASE), empate, recente, antigo);
        esperarIds(get(BASE).param("q", " ").param("status", " ").param("tipo", " "), empate, recente, antigo);
    }

    @Test
    void filtraPorStatusETipoComRotulosAcentuados() throws Exception {
        long veiculoId = criarVeiculo();
        long analise = criar(veiculoId, "Revisão", "Descrição", "Manutenção", "Em análise", "2026-09-20");
        long aberta = criar(veiculoId, "Freios", "Descrição", "Manutenção", "Aberta", "2026-09-21");
        criar(veiculoId, "Batida", "Descrição", "Acidente", "Resolvida", "2026-09-22");

        esperarIds(get(BASE).param("status", "Em análise"), analise);
        esperarIds(get(BASE).param("tipo", "Manutenção"), aberta, analise);
    }

    @Test
    void filtraPorIntervaloInclusivoEAceitaLimitesIsolados() throws Exception {
        long veiculoId = criarVeiculo();
        long antes = criar(veiculoId, "Antes", "Descrição", "Outro", "Aberta", "2026-09-19");
        long inicio = criar(veiculoId, "Início", "Descrição", "Outro", "Aberta", "2026-09-20");
        long fim = criar(veiculoId, "Fim", "Descrição", "Outro", "Aberta", "2026-09-22");
        long depois = criar(veiculoId, "Depois", "Descrição", "Outro", "Aberta", "2026-09-23");

        esperarIds(get(BASE).param("de", "2026-09-20").param("ate", "2026-09-22"), fim, inicio);
        esperarIds(get(BASE).param("de", "2026-09-22"), depois, fim);
        esperarIds(get(BASE).param("ate", "2026-09-20"), inicio, antes);
        esperarIds(get(BASE).param("de", "2026-09-20").param("ate", "2026-09-20"), inicio);
    }

    @Test
    void buscaParcialEmTituloOuDescricaoIgnoraCaixaEEspacosExternos() throws Exception {
        long veiculoId = criarVeiculo();
        long titulo = criar(veiculoId, "Colisão no PÁTIO", "Leve", "Acidente", "Aberta", "2026-09-20");
        long descricao = criar(veiculoId, "Avaria", "Veículo parado no PÁTIO central", "Outro", "Aberta", "2026-09-21");
        criar(veiculoId, "Entrega", "Na estrada", "Atraso", "Aberta", "2026-09-22");

        esperarIds(get(BASE).param("q", "  pátio  "), descricao, titulo);
        esperarIds(get(BASE).param("q", "sem correspondência"));
    }

    @Test
    void buscaTrataCuringasSqlComoTextoLiteral() throws Exception {
        long veiculoId = criarVeiculo();
        long id = criar(veiculoId, "Carga_50%", "Pasta C:\\carga", "Outro", "Aberta", "2026-09-20");
        criar(veiculoId, "CargaX50 toneladas", "Outra pasta", "Outro", "Aberta", "2026-09-21");

        esperarIds(get(BASE).param("q", "_50%"), id);
        esperarIds(get(BASE).param("q", "C:\\carga"), id);
    }

    @Test
    void combinaTodosOsFiltrosComIntersecao() throws Exception {
        long veiculoId = criarVeiculo();
        long esperado = criar(veiculoId, "Pátio", "Freios", "Manutenção", "Em análise", "2026-09-20");
        criar(veiculoId, "Pátio", "Freios", "Manutenção", "Aberta", "2026-09-20");
        criar(veiculoId, "Pátio", "Freios", "Acidente", "Em análise", "2026-09-20");
        criar(veiculoId, "Pátio", "Freios", "Manutenção", "Em análise", "2026-09-19");
        criar(veiculoId, "Pátio", "Freios", "Manutenção", "Em análise", "2026-09-23");
        criar(veiculoId, "Estrada", "Pneus", "Manutenção", "Em análise", "2026-09-20");

        esperarIds(get(BASE).param("q", "pátio").param("status", "Em análise").param("tipo", "Manutenção")
                .param("de", "2026-09-20").param("ate", "2026-09-22"), esperado);
    }

    @Test
    void intervaloInvertidoRetorna400Padronizado() throws Exception {
        mvc.perform(comToken(get(BASE)).param("de", "2026-09-21").param("ate", "2026-09-20"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.timestamp").exists())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("A data inicial não pode ser maior que a final."))
                .andExpect(jsonPath("$.path").value(BASE));
    }

    @ParameterizedTest
    @CsvSource({"de,20/09/2026", "ate,2026-02-30", "de,invalida", "ate,2026-13-01"})
    void dataInvalidaNoFiltroRetorna400(String parametro, String valor) throws Exception {
        mvc.perform(comToken(get(BASE)).param(parametro, valor))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Parâmetro inválido na requisição."));
    }

    @ParameterizedTest
    @ValueSource(strings = {"POST", "PUT"})
    void veiculoInexistenteRetorna400NoCampoSemAlterarOcorrencia(String metodo) throws Exception {
        Map<String, Object> dados = dados(criarVeiculo());
        long id = criar(dados);
        long veiculoOriginal = (Long) dados.get("veiculoId");
        dados.put("veiculoId", ID_INEXISTENTE);

        mvc.perform(comToken(escrita(metodo, id)).content(json.writeValueAsString(dados)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Veículo informado não existe."))
                .andExpect(jsonPath("$.fieldErrors.veiculoId").value("Veículo informado não existe."));
        mvc.perform(comToken(get(BASE + "/" + id)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.veiculoId").value(veiculoOriginal));
        esperarIds(get(BASE), id);
    }

    @ParameterizedTest
    @ValueSource(strings = {"POST", "PUT"})
    void motoristaInexistenteRetorna400NoCampoSemAlterarOcorrencia(String metodo) throws Exception {
        Map<String, Object> dados = dados(criarVeiculo());
        long id = criar(dados);
        dados.put("motoristaId", ID_INEXISTENTE);

        mvc.perform(comToken(escrita(metodo, id)).content(json.writeValueAsString(dados)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Motorista informado não existe."))
                .andExpect(jsonPath("$.fieldErrors.motoristaId").value("Motorista informado não existe."));
        mvc.perform(comToken(get(BASE + "/" + id)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.motoristaId").value(nullValue()));
        esperarIds(get(BASE), id);
    }

    @ParameterizedTest
    @ValueSource(strings = {"POST", "PUT"})
    void camposObrigatoriosRetornam400ComFieldErrorsEmPortugues(String metodo) throws Exception {
        Map<String, Object> dados = dados(criarVeiculo());
        long id = criar(dados);

        mvc.perform(comToken(escrita(metodo, id)).content("{\"titulo\":\" \",\"descricao\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.titulo").value("Informe o título."))
                .andExpect(jsonPath("$.fieldErrors.tipo").value("Selecione o tipo."))
                .andExpect(jsonPath("$.fieldErrors.descricao").value("Informe a descrição."))
                .andExpect(jsonPath("$.fieldErrors.data").value("Informe a data."))
                .andExpect(jsonPath("$.fieldErrors.status").value("Selecione o status."))
                .andExpect(jsonPath("$.fieldErrors.veiculoId").value("Informe o veículo."));
    }

    @Test
    void rejeitaTextosAcimaDoLimite() throws Exception {
        Map<String, Object> dados = dados(criarVeiculo());
        dados.put("titulo", "t".repeat(161));
        dados.put("descricao", "d".repeat(2001));

        mvc.perform(comToken(post(BASE)).content(json.writeValueAsString(dados)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.titulo").value("O título deve ter no máximo 160 caracteres."))
                .andExpect(jsonPath("$.fieldErrors.descricao").value("A descrição deve ter no máximo 2000 caracteres."));
    }

    @Test
    void rejeitaDataNoFuturoEAceitaHoje() throws Exception {
        Map<String, Object> dados = dados(criarVeiculo());
        dados.put("data", LocalDate.now().plusDays(1).toString());

        mvc.perform(comToken(post(BASE)).content(json.writeValueAsString(dados)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.data").value("A data não pode ser no futuro."));

        dados.put("data", LocalDate.now().toString());
        criar(dados);
    }

    @Test
    void aceitaTextosNoLimite() throws Exception {
        Map<String, Object> dados = dados(criarVeiculo());
        dados.put("titulo", "t".repeat(160));
        dados.put("descricao", "d".repeat(2000));
        criar(dados);
    }

    @ParameterizedTest
    @CsvSource({"tipo,Quebra", "status,Fechada"})
    void enumInvalidoNoCorpoRetorna400(String campo, String valor) throws Exception {
        Map<String, Object> dados = dados(criarVeiculo());
        dados.put(campo, valor);

        mvc.perform(comToken(post(BASE)).content(json.writeValueAsString(dados)))
                .andExpect(status().isBadRequest());
    }

    @ParameterizedTest
    @CsvSource({"tipo,Quebra", "status,Fechada"})
    void enumInvalidoNoFiltroRetorna400(String campo, String valor) throws Exception {
        mvc.perform(comToken(get(BASE)).param(campo, valor))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("Valor inválido")));
    }

    @ParameterizedTest
    @ValueSource(strings = {"20/09/2026", "2026-13-01"})
    void dataMalFormatadaNoCorpoRetorna400(String data) throws Exception {
        Map<String, Object> dados = dados(criarVeiculo());
        dados.put("data", data);
        mvc.perform(comToken(post(BASE)).content(json.writeValueAsString(dados)))
                .andExpect(status().isBadRequest());
    }

    @ParameterizedTest
    @ValueSource(strings = {"GET", "PUT", "DELETE"})
    void ocorrenciaInexistenteRetorna404(String metodo) throws Exception {
        MockHttpServletRequestBuilder request = switch (metodo) {
            case "GET" -> get(BASE + "/" + ID_INEXISTENTE);
            case "DELETE" -> delete(BASE + "/" + ID_INEXISTENTE);
            default -> put(BASE + "/" + ID_INEXISTENTE).content(json.writeValueAsString(dados(criarVeiculo())));
        };
        mvc.perform(comToken(request))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Ocorrência não encontrada."));
    }

    @Test
    void bloqueiaExclusaoDoVeiculoComOcorrenciaELiberaAposExcluirOcorrencia() throws Exception {
        long veiculoId = criarVeiculo();
        long id = criar(dados(veiculoId));

        mvc.perform(comToken(delete("/api/veiculos/" + veiculoId)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(containsString("ocorrência(s) vinculada(s)")));
        mvc.perform(comToken(get("/api/veiculos/" + veiculoId))).andExpect(status().isOk());
        mvc.perform(comToken(delete(BASE + "/" + id))).andExpect(status().isNoContent());
        mvc.perform(comToken(delete("/api/veiculos/" + veiculoId))).andExpect(status().isNoContent());
    }

    @ParameterizedTest
    @ValueSource(strings = {"LISTAR", "GET", "POST", "PUT", "DELETE"})
    void exigeTokenEmTodasAsRotas(String metodo) throws Exception {
        MockHttpServletRequestBuilder request = switch (metodo) {
            case "LISTAR" -> get(BASE);
            case "GET" -> get(BASE + "/1");
            case "POST" -> post(BASE);
            case "PUT" -> put(BASE + "/1");
            default -> delete(BASE + "/1");
        };
        mvc.perform(request).andExpect(status().isUnauthorized());
    }

    private long criarVeiculo() throws Exception {
        String resposta = mvc.perform(comToken(post("/api/veiculos"))
                        .content(veiculoJson(placaUnica(), "Disponível")))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return json.readTree(resposta).get("id").asLong();
    }

    private long criarMotorista() {
        // Fixture por SQL enquanto o módulo de motoristas não está disponível; a transação é revertida por teste.
        jdbc.update("""
                insert into motoristas (nome, cpf, cnh, telefone, status)
                values ('Motorista de teste', '12345678901', '10987654321', '11999999999', 'DISPONIVEL')
                """);
        return jdbc.queryForObject("select id from motoristas where cpf = ?", Long.class, "12345678901");
    }

    private Map<String, Object> dados(long veiculoId) {
        Map<String, Object> dados = new LinkedHashMap<>();
        dados.put("titulo", "Colisão no pátio");
        dados.put("tipo", "Acidente");
        dados.put("descricao", "Colisão leve.");
        dados.put("data", "2026-09-20");
        dados.put("status", "Aberta");
        dados.put("veiculoId", veiculoId);
        dados.put("motoristaId", null);
        return dados;
    }

    private long criar(long veiculoId, String titulo, String descricao, String tipo, String status, String data)
            throws Exception {
        Map<String, Object> dados = dados(veiculoId);
        dados.put("titulo", titulo);
        dados.put("descricao", descricao);
        dados.put("tipo", tipo);
        dados.put("status", status);
        dados.put("data", data);
        return criar(dados);
    }

    private long criar(Map<String, Object> dados) throws Exception {
        String resposta = mvc.perform(comToken(post(BASE)).content(json.writeValueAsString(dados)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return json.readTree(resposta).get("id").asLong();
    }

    private void esperarIds(MockHttpServletRequestBuilder request, long... ids) throws Exception {
        mvc.perform(comToken(request)).andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", equalTo(LongStream.of(ids).mapToObj(Math::toIntExact).toList())));
    }

    private MockHttpServletRequestBuilder escrita(String metodo, long id) {
        return "POST".equals(metodo) ? post(BASE) : put(BASE + "/" + id);
    }
}
