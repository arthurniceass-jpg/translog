package br.com.translog.common;

import java.util.Locale;

/**
 * Monta o padrão de LIKE da busca livre (?q=). Os curingas do SQL (% e _) digitados pelo usuário
 * viram texto literal, então "50%" procura "50%" e não "50 seguido de qualquer coisa".
 * Use junto com {@link #ESCAPE}: {@code cb.like(cb.lower(campo), padrao, BuscaTexto.ESCAPE)}.
 */
public final class BuscaTexto {

    public static final char ESCAPE = '\\';

    private BuscaTexto() {
    }

    /** Ex.: "  Freio_A " vira "%freio\_a%" (minúsculas, sem espaços nas pontas, curingas escapados). */
    public static String padraoContem(String q) {
        String termo = q.trim().toLowerCase(Locale.ROOT)
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
        return "%" + termo + "%";
    }
}
