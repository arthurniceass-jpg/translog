package br.com.translog.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CadastroRequest(
        @NotBlank(message = "Informe o nome.") @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres.") String nome,
        @NotBlank(message = "Informe o e-mail.") @Email(message = "E-mail inválido.") @Size(max = 160, message = "O e-mail deve ter no máximo 160 caracteres.") String email,
        @NotBlank(message = "Informe a senha.") @Size(min = 6, max = 72, message = "A senha deve ter entre 6 e 72 caracteres.") String senha) {
}
