package br.com.translog.motorista.dto;

import br.com.translog.motorista.StatusMotorista;

import java.util.List;

/**
 * Resposta da API. O status sai como rótulo ("Em viagem") graças ao @JsonValue do enum.
 * Categorias saem como array ordenado, ex.: ["A","E"].
 */
public record MotoristaResponse(Long id, String nome, String cpf, String cnh, List<String> categorias,
                                String telefone, StatusMotorista status) {
}
