package br.com.translog.veiculo.dto;

import br.com.translog.veiculo.StatusVeiculo;

/** Resposta da API. O status sai como rótulo ("Em uso") graças ao @JsonValue do enum. */
public record VeiculoResponse(Long id, String placa, String marca, String modelo, Integer ano, StatusVeiculo status) {
}
