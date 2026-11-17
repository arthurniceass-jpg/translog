package br.com.translog.ocorrencia;

import br.com.translog.ocorrencia.dto.OcorrenciaRequest;
import br.com.translog.ocorrencia.dto.OcorrenciaResponse;
import org.springframework.stereotype.Component;

@Component
public class OcorrenciaMapper {

    public Ocorrencia paraEntidade(OcorrenciaRequest request) {
        Ocorrencia ocorrencia = new Ocorrencia();
        copiar(request, ocorrencia);
        return ocorrencia;
    }

    public void copiar(OcorrenciaRequest request, Ocorrencia ocorrencia) {
        ocorrencia.setTitulo(request.titulo().trim());
        ocorrencia.setTipo(request.tipo());
        ocorrencia.setDescricao(request.descricao().trim());
        ocorrencia.setData(request.data());
        ocorrencia.setStatus(request.status());
        ocorrencia.setVeiculoId(request.veiculoId());
        ocorrencia.setMotoristaId(request.motoristaId());
    }

    public OcorrenciaResponse paraResposta(Ocorrencia ocorrencia) {
        return new OcorrenciaResponse(ocorrencia.getId(), ocorrencia.getTitulo(), ocorrencia.getTipo(),
                ocorrencia.getDescricao(), ocorrencia.getData(), ocorrencia.getStatus(),
                ocorrencia.getVeiculoId(), ocorrencia.getMotoristaId());
    }
}
