package br.com.translog.motorista.dto;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Lista de categorias da CNH: cada item deve ser A, B, C, D ou E (aceita minúscula; o mapper normaliza).
 * A lista vazia fica a cargo do @NotEmpty, para a mensagem ser específica.
 */
@Documented
@Constraint(validatedBy = CategoriasValidas.Validador.class)
@Target({ElementType.FIELD, ElementType.RECORD_COMPONENT, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface CategoriasValidas {

    String message() default "Categoria inválida. Use A, B, C, D ou E.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    class Validador implements ConstraintValidator<CategoriasValidas, List<String>> {

        private static final Set<String> VALIDAS = Set.of("A", "B", "C", "D", "E");

        @Override
        public boolean isValid(List<String> categorias, ConstraintValidatorContext ctx) {
            if (categorias == null || categorias.isEmpty()) {
                return true; // @NotEmpty cuida da lista vazia
            }
            return categorias.stream()
                    .allMatch(c -> c != null && VALIDAS.contains(c.trim().toUpperCase(Locale.ROOT)));
        }
    }
}
