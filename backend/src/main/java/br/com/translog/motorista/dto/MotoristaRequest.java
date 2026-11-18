package br.com.translog.motorista.dto;

import br.com.translog.motorista.StatusMotorista;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

/** Corpo de POST/PUT /api/motoristas. Mensagens de validação em português (viram fieldErrors). */
public record MotoristaRequest(
        @NotBlank(message = "Informe o nome.")
        @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres.")
        String nome,

        @NotBlank(message = "Informe o CPF.")
        @Pattern(regexp = "^\\d{11}$", message = "CPF inválido. Informe exatamente 11 dígitos, somente números.")
        String cpf,

        @NotBlank(message = "Informe a CNH.")
        @Pattern(regexp = "^\\d{11}$", message = "CNH inválida. Informe exatamente 11 dígitos, somente números.")
        String cnh,

        @NotEmpty(message = "Selecione pelo menos uma categoria.")
        @CategoriasValidas
        List<String> categorias,

        @NotBlank(message = "Informe o telefone.")
        @Pattern(regexp = "^\\d{10,11}$", message = "Telefone inválido. Informe de 10 a 11 dígitos, somente números.")
        String telefone,

        @NotNull(message = "Selecione o status.")
        StatusMotorista status) {
}
