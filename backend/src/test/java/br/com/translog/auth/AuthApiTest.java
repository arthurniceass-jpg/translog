package br.com.translog.auth;

import br.com.translog.ApiTestBase;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.UUID;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthApiTest extends ApiTestBase {

    private static String cadastroJson(String email, String senha) {
        return "{\"nome\":\"Ana\",\"email\":\"" + email + "\",\"senha\":\"" + senha + "\"}";
    }

    @Test
    void cadastroRetorna201ComTokenEUsuario() throws Exception {
        String email = "ana-" + UUID.randomUUID() + "@translog.com";
        mvc.perform(post("/api/auth/cadastro").contentType(MediaType.APPLICATION_JSON).content(cadastroJson(email, "123456")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.usuario.email").value(email))
                .andExpect(jsonPath("$.usuario.id", notNullValue()));
    }

    @Test
    void cadastroComEmailDuplicadoRetorna409() throws Exception {
        String email = "dup-" + UUID.randomUUID() + "@translog.com";
        mvc.perform(post("/api/auth/cadastro").contentType(MediaType.APPLICATION_JSON).content(cadastroJson(email, "123456")))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/auth/cadastro").contentType(MediaType.APPLICATION_JSON).content(cadastroJson(email, "123456")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Já existe uma conta com este e-mail."));
    }

    @Test
    void cadastroComSenhaCurtaRetorna400ComFieldErrors() throws Exception {
        mvc.perform(post("/api/auth/cadastro").contentType(MediaType.APPLICATION_JSON)
                        .content(cadastroJson("x-" + UUID.randomUUID() + "@translog.com", "123")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.senha").value("A senha deve ter entre 6 e 72 caracteres."));
    }

    @Test
    void loginValidoRetornaToken() throws Exception {
        String email = "login-" + UUID.randomUUID() + "@translog.com";
        mvc.perform(post("/api/auth/cadastro").contentType(MediaType.APPLICATION_JSON).content(cadastroJson(email, "segredo1")));
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email.toUpperCase() + "\",\"senha\":\"segredo1\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()));
    }

    @Test
    void loginInvalidoRetorna401ComMensagem() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"ninguem@translog.com\",\"senha\":\"errada\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("E-mail ou senha inválidos."));
    }

    @Test
    void rotaProtegidaSemTokenRetorna401() throws Exception {
        mvc.perform(get("/api/veiculos"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void meRetornaUsuarioDoToken() throws Exception {
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Teste"));
    }

    @Test
    void healthEhPublico() throws Exception {
        mvc.perform(get("/actuator/health")).andExpect(status().isOk());
    }
}
