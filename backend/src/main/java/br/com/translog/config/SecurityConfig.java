package br.com.translog.config;

import br.com.translog.common.ApiError;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.web.SecurityFilterChain;
import tools.jackson.databind.json.JsonMapper;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Instant;

/** API stateless protegida por JWT (resource server). Só auth, swagger e health são públicos. */
@Configuration
@EnableConfigurationProperties({JwtProperties.class, CorsProperties.class})
public class SecurityConfig {

    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http, JsonMapper mapper) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(a -> a
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/cadastro", "/api/auth/login").permitAll()
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers("/actuator/health", "/actuator/health/**").permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))
                // 401/403 no mesmo formato de erro da API
                .exceptionHandling(e -> e
                        .authenticationEntryPoint((req, res, ex) ->
                                escrever(res, mapper, 401, "Unauthorized",
                                        "Autenticação necessária ou token inválido/expirado.", req.getRequestURI()))
                        .accessDeniedHandler((req, res, ex) ->
                                escrever(res, mapper, 403, "Forbidden", "Acesso negado.", req.getRequestURI())));
        return http.build();
    }

    private static void escrever(HttpServletResponse res, JsonMapper mapper, int status, String erro, String msg, String path)
            throws IOException {
        res.setStatus(status);
        res.setContentType("application/json;charset=UTF-8");
        mapper.writeValue(res.getOutputStream(), new ApiError(Instant.now(), status, erro, msg, path, null));
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Chave HS256 do JWT. Vem de JWT_SECRET; sem ela (desenvolvimento), gera uma chave aleatória
     * a cada execução — nenhum segredo fica versionado. Em prod a variável é obrigatória.
     */
    @Bean
    SecretKey jwtChave(JwtProperties props) {
        String segredo = props.secret();
        if (segredo == null || segredo.isBlank()) {
            log.warn("JWT_SECRET não definido: usando chave aleatória (os tokens deixam de valer ao reiniciar).");
            byte[] aleatoria = new byte[32];
            new SecureRandom().nextBytes(aleatoria);
            return new SecretKeySpec(aleatoria, "HmacSHA256");
        }
        byte[] bytes = segredo.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("JWT_SECRET deve ter pelo menos 32 caracteres (HS256).");
        }
        return new SecretKeySpec(bytes, "HmacSHA256");
    }

    @Bean
    JwtEncoder jwtEncoder(SecretKey jwtChave) {
        return new NimbusJwtEncoder(new ImmutableSecret<>(jwtChave));
    }

    @Bean
    JwtDecoder jwtDecoder(SecretKey jwtChave) {
        return NimbusJwtDecoder.withSecretKey(jwtChave).macAlgorithm(MacAlgorithm.HS256).build();
    }
}
