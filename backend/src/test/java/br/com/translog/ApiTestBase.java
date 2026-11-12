package br.com.translog;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

/** Base dos testes de API: sobe o contexto com H2 (perfil test) e fornece um token JWT válido. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class ApiTestBase {

    @Autowired
    protected MockMvc mvc;

    protected String token;

    @BeforeEach
    void autenticar() throws Exception {
        String email = "teste-" + UUID.randomUUID() + "@translog.com";
        String corpo = mvc.perform(post("/api/auth/cadastro").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Teste\",\"email\":\"" + email + "\",\"senha\":\"123456\"}"))
                .andReturn().getResponse().getContentAsString();
        Matcher m = Pattern.compile("\"token\":\"([^\"]+)\"").matcher(corpo);
        if (!m.find()) {
            throw new IllegalStateException("Cadastro de teste falhou: " + corpo);
        }
        token = m.group(1);
    }

    protected MockHttpServletRequestBuilder comToken(MockHttpServletRequestBuilder b) {
        return b.header("Authorization", "Bearer " + token).contentType(MediaType.APPLICATION_JSON);
    }

    /** JSON de veículo válido; a placa é única por chamada para os testes não colidirem. */
    protected static String veiculoJson(String placa, String status) {
        return "{\"placa\":\"" + placa + "\",\"marca\":\"Volvo\",\"modelo\":\"FH 540\",\"ano\":2021,\"status\":\"" + status + "\"}";
    }

    protected static String placaUnica() {
        String letras = UUID.randomUUID().toString().replaceAll("[^a-zA-Z]", "").toUpperCase();
        String nums = String.valueOf((int) (Math.random() * 90) + 10);
        return letras.substring(0, 3) + "1A" + nums;
    }
}
