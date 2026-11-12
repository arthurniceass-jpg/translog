package br.com.translog.veiculo.dto;

import br.com.translog.veiculo.StatusVeiculo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Corpo de POST/PUT /api/veiculos. Mensagens de validação em português (viram fieldErrors). */
public record VeiculoRequest(
        @NotBlank(message = "Informe a placa.")
        @Pattern(regexp = "^[A-Za-z]{3}-?[0-9][A-Za-z0-9][0-9]{2}$",
                message = "Placa inválida. Use ABC1234 ou ABC1D23.")
        String placa,

        @NotBlank(message = "Informe a marca.")
        @Size(max = 60, message = "A marca deve ter no máximo 60 caracteres.")
        String marca,

        @NotBlank(message = "Informe o modelo.")
        @Size(max = 60, message = "O modelo deve ter no máximo 60 caracteres.")
        String modelo,

        @NotNull(message = "Informe o ano.")
        @AnoValido
        Integer ano,

        @NotNull(message = "Selecione o status.")
        StatusVeiculo status) {
}
