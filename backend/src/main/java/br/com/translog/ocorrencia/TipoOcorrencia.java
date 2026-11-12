package br.com.translog.ocorrencia;

import br.com.translog.common.Rotulado;
import com.fasterxml.jackson.annotation.JsonCreator;

/** JSON: "Manutenção" | "Acidente" | "Atraso" | "Outro". Banco: MANUTENCAO | ACIDENTE | ATRASO | OUTRO. */
public enum TipoOcorrencia implements Rotulado {
    MANUTENCAO("Manutenção"),
    ACIDENTE("Acidente"),
    ATRASO("Atraso"),
    OUTRO("Outro");

    private final String rotulo;

    TipoOcorrencia(String rotulo) {
        this.rotulo = rotulo;
    }

    @Override
    public String getRotulo() {
        return rotulo;
    }

    @JsonCreator
    public static TipoOcorrencia de(String valor) {
        return Rotulado.deRotulo(TipoOcorrencia.class, valor);
    }
}
