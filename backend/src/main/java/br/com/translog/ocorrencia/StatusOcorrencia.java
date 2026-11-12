package br.com.translog.ocorrencia;

import br.com.translog.common.Rotulado;
import com.fasterxml.jackson.annotation.JsonCreator;

/** JSON: "Aberta" | "Em análise" | "Resolvida". Banco: ABERTA | EM_ANALISE | RESOLVIDA. */
public enum StatusOcorrencia implements Rotulado {
    ABERTA("Aberta"),
    EM_ANALISE("Em análise"),
    RESOLVIDA("Resolvida");

    private final String rotulo;

    StatusOcorrencia(String rotulo) {
        this.rotulo = rotulo;
    }

    @Override
    public String getRotulo() {
        return rotulo;
    }

    @JsonCreator
    public static StatusOcorrencia de(String valor) {
        return Rotulado.deRotulo(StatusOcorrencia.class, valor);
    }
}
