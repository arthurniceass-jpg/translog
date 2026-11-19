package br.com.translog.operacao;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public final class OperacaoDados {
    private OperacaoDados() {}

    public enum StatusManutencao { AGENDADA, EM_EXECUCAO, CONCLUIDA }
    public enum StatusViagem { PROGRAMADA, EM_ANDAMENTO, CONCLUIDA, CANCELADA }

    public record ManutencaoPedido(
            @NotNull @Positive Long veiculoId, @NotBlank @Size(max = 160) String descricao,
            LocalDate prazo, @PositiveOrZero Long limiteKm, @NotNull StatusManutencao status,
            LocalDate concluidaEm, @PositiveOrZero @Digits(integer = 10, fraction = 2) BigDecimal custo) {}
    public record Manutencao(Long id, Long veiculoId, String descricao, LocalDate prazo, Long limiteKm,
                             StatusManutencao status, LocalDate concluidaEm, BigDecimal custo) {}

    public record ViagemPedido(
            @NotNull @Positive Long veiculoId, @NotNull @Positive Long motoristaId,
            @NotBlank @Size(max = 120) String origem, @NotBlank @Size(max = 120) String destino,
            @NotNull LocalDateTime partida, @NotNull LocalDateTime chegadaPrevista, @NotNull StatusViagem status,
            LocalDateTime chegadaReal, @DecimalMin("0.01") @Digits(integer = 8, fraction = 2) BigDecimal kmPercorridos) {}
    public record Viagem(Long id, Long veiculoId, Long motoristaId, String origem, String destino,
                         LocalDateTime partida, LocalDateTime chegadaPrevista, StatusViagem status,
                         LocalDateTime chegadaReal, BigDecimal kmPercorridos) {}

    public record AbastecimentoPedido(@NotNull @Positive Long veiculoId, @NotNull LocalDate data,
            @NotNull @DecimalMin("0.01") @Digits(integer = 8, fraction = 2) BigDecimal litros,
            @NotNull @DecimalMin("0.01") @Digits(integer = 10, fraction = 2) BigDecimal valor) {}
    public record Abastecimento(Long id, Long veiculoId, LocalDate data, BigDecimal litros, BigDecimal valor) {}

    public record DocumentoPedido(@Positive Long veiculoId, @Positive Long motoristaId, @NotNull LocalDate validade) {}
    public record Documento(Long id, Long veiculoId, Long motoristaId, LocalDate validade) {}
}
