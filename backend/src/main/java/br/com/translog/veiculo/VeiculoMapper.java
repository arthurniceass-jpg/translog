package br.com.translog.veiculo;

import br.com.translog.veiculo.dto.VeiculoRequest;
import br.com.translog.veiculo.dto.VeiculoResponse;
import org.springframework.stereotype.Component;

import java.util.Locale;

/** Conversão entidade <-> DTO (sem libs externas, para ficar explícito e fácil de copiar). */
@Component
public class VeiculoMapper {

    /** Normaliza a placa: remove hífen e deixa maiúscula (abc-1234 -> ABC1234). */
    public static String normalizarPlaca(String placa) {
        return placa.replace("-", "").trim().toUpperCase(Locale.ROOT);
    }

    public Veiculo paraEntidade(VeiculoRequest r) {
        Veiculo v = new Veiculo();
        copiar(r, v);
        return v;
    }

    /** Aplica os dados do request numa entidade existente (usado no PUT). */
    public void copiar(VeiculoRequest r, Veiculo v) {
        v.setPlaca(normalizarPlaca(r.placa()));
        v.setMarca(r.marca().trim());
        v.setModelo(r.modelo().trim());
        v.setAno(r.ano());
        v.setStatus(r.status());
    }

    public VeiculoResponse paraResposta(Veiculo v) {
        return new VeiculoResponse(v.getId(), v.getPlaca(), v.getMarca(), v.getModelo(), v.getAno(), v.getStatus());
    }
}
