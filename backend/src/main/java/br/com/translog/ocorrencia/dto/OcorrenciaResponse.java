package br.com.translog.ocorrencia.dto;

import br.com.translog.ocorrencia.StatusOcorrencia;
import br.com.translog.ocorrencia.TipoOcorrencia;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDate;

public record OcorrenciaResponse(
        Long id,
        String titulo,
        TipoOcorrencia tipo,
        String descricao,
        LocalDate data,
        StatusOcorrencia status,
        Long veiculoId,
        @JsonInclude(JsonInclude.Include.ALWAYS) Long motoristaId) {
}
