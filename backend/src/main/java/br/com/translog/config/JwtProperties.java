package br.com.translog.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Propriedades translog.jwt.* (segredo HS256 e tempo de expiração). */
@ConfigurationProperties(prefix = "translog.jwt")
public record JwtProperties(String secret, long expiracaoMinutos) {
}
