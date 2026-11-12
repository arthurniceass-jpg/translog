package br.com.translog.veiculo.dto;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.time.Year;

/** Ano entre 1950 e (ano atual + 1). Exemplo de constraint customizada para validação dinâmica. */
@Documented
@Constraint(validatedBy = AnoValido.Validador.class)
@Target({ElementType.FIELD, ElementType.RECORD_COMPONENT, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface AnoValido {

    String message() default "O ano deve estar entre 1950 e o próximo ano.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    class Validador implements ConstraintValidator<AnoValido, Integer> {
        @Override
        public boolean isValid(Integer ano, ConstraintValidatorContext ctx) {
            if (ano == null) {
                return true; // @NotNull cuida da obrigatoriedade
            }
            return ano >= 1950 && ano <= Year.now().getValue() + 1;
        }
    }
}
