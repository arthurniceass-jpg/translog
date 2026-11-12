package br.com.translog.motorista;

import br.com.translog.common.Rotulado;
import com.fasterxml.jackson.annotation.JsonCreator;

/** JSON: "Disponível" | "Em viagem" | "Inativo". Banco: DISPONIVEL | EM_VIAGEM | INATIVO. */
public enum StatusMotorista implements Rotulado {
    DISPONIVEL("Disponível"),
    EM_VIAGEM("Em viagem"),
    INATIVO("Inativo");

    private final String rotulo;

    StatusMotorista(String rotulo) {
        this.rotulo = rotulo;
    }

    @Override
    public String getRotulo() {
        return rotulo;
    }

    @JsonCreator
    public static StatusMotorista de(String valor) {
        return Rotulado.deRotulo(StatusMotorista.class, valor);
    }
}
