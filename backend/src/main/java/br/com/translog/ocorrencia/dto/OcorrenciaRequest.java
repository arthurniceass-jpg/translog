package br.com.translog.ocorrencia.dto;

import br.com.translog.ocorrencia.StatusOcorrencia;
import br.com.translog.ocorrencia.TipoOcorrencia;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record OcorrenciaRequest(
        @NotBlank(message = "Informe o título.")
        @Size(max = 160, message = "O título deve ter no máximo 160 caracteres.")
        String titulo,

        @NotNull(message = "Selecione o tipo.")
        TipoOcorrencia tipo,

        @NotBlank(message = "Informe a descrição.")
        @Size(max = 2000, message = "A descrição deve ter no máximo 2000 caracteres.")
        String descricao,

        @NotNull(message = "Informe a data.")
        LocalDate data,

        @NotNull(message = "Selecione o status.")
        StatusOcorrencia status,

        @NotNull(message = "Informe o veículo.")
        Long veiculoId,

        Long motoristaId) {
}
