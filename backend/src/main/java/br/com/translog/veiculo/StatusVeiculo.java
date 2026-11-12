package br.com.translog.veiculo;

import br.com.translog.common.Rotulado;
import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * Status do veículo. No JSON aparece o rótulo ("Em uso"); no banco, o nome do enum (EM_USO).
 * PADRÃO PARA OS OUTROS MÓDULOS: copie este formato para status/tipos com acento.
 */
public enum StatusVeiculo implements Rotulado {
    DISPONIVEL("Disponível"),
    EM_USO("Em uso"),
    MANUTENCAO("Manutenção");

    private final String rotulo;

    StatusVeiculo(String rotulo) {
        this.rotulo = rotulo;
    }

    @Override
    public String getRotulo() {
        return rotulo;
    }

    /** Usado pelo Jackson (corpo JSON) e pelos filtros de query string. */
    @JsonCreator
    public static StatusVeiculo de(String valor) {
        return Rotulado.deRotulo(StatusVeiculo.class, valor);
    }
}
