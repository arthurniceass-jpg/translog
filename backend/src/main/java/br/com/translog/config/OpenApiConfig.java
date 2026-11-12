package br.com.translog.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Swagger UI em /swagger-ui.html, com botão "Authorize" para colar o JWT. */
@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI translogOpenApi() {
        return new OpenAPI()
                .info(new Info().title("TransLog API").version("v1")
                        .description("API de gestão de transporte: veículos, motoristas e ocorrências."))
                .components(new Components().addSecuritySchemes("bearer",
                        new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList("bearer"));
    }
}
