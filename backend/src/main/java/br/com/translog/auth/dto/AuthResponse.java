package br.com.translog.auth.dto;

public record AuthResponse(String token, UsuarioResponse usuario) {
}
