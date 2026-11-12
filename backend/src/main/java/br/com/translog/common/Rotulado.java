package br.com.translog.common;

import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

/**
 * Enums do domínio expõem no JSON o RÓTULO em português (com acento), ex.: "Em uso",
 * mas o banco guarda o nome do enum (EM_USO).
 */
public interface Rotulado {

    @JsonValue
    String getRotulo();

    /** Converte o rótulo (case-insensitive) para a constante do enum. */
    static <E extends Enum<E> & Rotulado> E deRotulo(Class<E> tipo, String valor) {
        if (valor != null) {
            String v = valor.trim();
            for (E e : tipo.getEnumConstants()) {
                if (e.getRotulo().equalsIgnoreCase(v) || e.name().equalsIgnoreCase(v)) {
                    return e;
                }
            }
        }
        String validos = String.join(", ", Arrays.stream(tipo.getEnumConstants()).map(Rotulado::getRotulo).toList());
        throw new ValorInvalidoException("Valor inválido: '" + valor + "'. Valores aceitos: " + validos + ".");
    }
}
