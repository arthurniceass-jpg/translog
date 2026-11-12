package br.com.translog.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/** Propriedades translog.cors.* (origens permitidas, separadas por vírgula). */
@ConfigurationProperties(prefix = "translog.cors")
public record CorsProperties(List<String> origens) {
}
