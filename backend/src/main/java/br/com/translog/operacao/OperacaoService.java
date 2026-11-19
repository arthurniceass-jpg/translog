package br.com.translog.operacao;

import br.com.translog.common.ConflictException;
import br.com.translog.common.NotFoundException;
import br.com.translog.common.ValorInvalidoException;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

import static br.com.translog.operacao.OperacaoDados.*;

@Service
public class OperacaoService {
    private static final ZoneId FUSO = ZoneId.of("America/Sao_Paulo");
    private final JdbcClient jdbc;

    public OperacaoService(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<Manutencao> manutencoes() {
        return jdbc.sql("SELECT * FROM manutencoes ORDER BY id DESC").query(Manutencao.class).list();
    }

    @Transactional
    public Manutencao salvarManutencao(Long id, ManutencaoPedido p) {
        if (p.prazo() == null && p.limiteKm() == null) {
            throw new ValorInvalidoException("prazo", "Informe a data ou a quilometragem de vencimento.");
        }
        boolean concluida = p.status() == StatusManutencao.CONCLUIDA;
        if (concluida && (p.concluidaEm() == null || p.concluidaEm().isAfter(LocalDate.now(FUSO)))) {
            throw new ValorInvalidoException("concluidaEm", "Informe uma data de conclusão até hoje.");
        }
        if (!concluida && (p.concluidaEm() != null || p.custo() != null)) {
            throw new ValorInvalidoException("status", "Registre data e custo ao concluir a manutenção.");
        }
        validarVeiculo(p.veiculoId());
        String sql = id == null
                ? "INSERT INTO manutencoes (veiculo_id, descricao, prazo, limite_km, status, concluida_em, custo) VALUES (:v,:descricao,:prazo,:km,:status,:conclusao,:custo)"
                : "UPDATE manutencoes SET veiculo_id=:v, descricao=:descricao, prazo=:prazo, limite_km=:km, status=:status, concluida_em=:conclusao, custo=:custo WHERE id=:id";
        JdbcClient.StatementSpec stmt = jdbc.sql(sql).param("v", p.veiculoId()).param("descricao", p.descricao().trim())
                .param("prazo", p.prazo()).param("km", p.limiteKm()).param("status", p.status().name())
                .param("conclusao", p.concluidaEm()).param("custo", p.custo());
        Long salvo = salvar(stmt, id);
        return new Manutencao(salvo, p.veiculoId(), p.descricao().trim(), p.prazo(), p.limiteKm(), p.status(), p.concluidaEm(), p.custo());
    }

    public List<Viagem> viagens() {
        return jdbc.sql("SELECT * FROM viagens ORDER BY partida DESC, id DESC").query(Viagem.class).list();
    }

    @Transactional
    public Viagem salvarViagem(Long id, ViagemPedido p) {
        if (!p.chegadaPrevista().isAfter(p.partida())) {
            throw new ValorInvalidoException("chegadaPrevista", "A chegada prevista deve ser posterior à partida.");
        }
        if (p.status() == StatusViagem.CONCLUIDA) {
            if (p.chegadaReal() == null || p.chegadaReal().isBefore(p.partida()) || p.chegadaReal().isAfter(LocalDateTime.now(FUSO))) {
                throw new ValorInvalidoException("chegadaReal", "Informe uma chegada real entre a partida e o horário atual.");
            }
            if (p.kmPercorridos() == null) {
                throw new ValorInvalidoException("kmPercorridos", "Informe a distância percorrida ao concluir.");
            }
        } else if (p.chegadaReal() != null || p.kmPercorridos() != null) {
            throw new ValorInvalidoException("status", "Registre a chegada e a distância ao concluir a viagem.");
        }
        // Todas as escritas de agenda bloqueiam os cadastros na mesma ordem.
        bloquear("SELECT id FROM veiculos WHERE id=:id FOR UPDATE", p.veiculoId(), "veiculoId", "Veículo não encontrado.");
        bloquear("SELECT id FROM motoristas WHERE id=:id FOR UPDATE", p.motoristaId(), "motoristaId", "Motorista não encontrado.");
        if (p.status() != StatusViagem.CANCELADA) {
            validarAgenda(id, p);
        }
        String sql = id == null
                ? """
                  INSERT INTO viagens (veiculo_id, motorista_id, origem, destino, partida, chegada_prevista, status, chegada_real, km_percorridos)
                  VALUES (:v,:m,:origem,:destino,:partida,:prevista,:status,:real,:km)
                  """
                : """
                  UPDATE viagens SET veiculo_id=:v, motorista_id=:m, origem=:origem, destino=:destino, partida=:partida,
                      chegada_prevista=:prevista, status=:status, chegada_real=:real, km_percorridos=:km WHERE id=:id
                  """;
        JdbcClient.StatementSpec stmt = jdbc.sql(sql).param("v", p.veiculoId()).param("m", p.motoristaId())
                .param("origem", p.origem().trim()).param("destino", p.destino().trim()).param("partida", p.partida())
                .param("prevista", p.chegadaPrevista()).param("status", p.status().name()).param("real", p.chegadaReal())
                .param("km", p.kmPercorridos());
        return new Viagem(salvar(stmt, id), p.veiculoId(), p.motoristaId(), p.origem().trim(), p.destino().trim(),
                p.partida(), p.chegadaPrevista(), p.status(), p.chegadaReal(), p.kmPercorridos());
    }

    private void validarAgenda(Long id, ViagemPedido p) {
        var conflitos = jdbc.sql("""
                SELECT veiculo_id, motorista_id FROM viagens
                WHERE id <> :id AND status <> 'CANCELADA'
                    AND (veiculo_id = :v OR motorista_id = :m)
                    AND partida < :fim
                    AND chegada_prevista > :inicio
                """).param("id", id == null ? 0L : id).param("v", p.veiculoId()).param("m", p.motoristaId())
                .param("inicio", p.partida()).param("fim", p.chegadaPrevista())
                .query((rs, n) -> new long[]{rs.getLong("veiculo_id"), rs.getLong("motorista_id")}).list();
        if (conflitos.stream().anyMatch(v -> v[0] == p.veiculoId())) {
            throw new ConflictException("veiculoId", "O veículo já está reservado nesse período.");
        }
        if (!conflitos.isEmpty()) {
            throw new ConflictException("motoristaId", "O motorista já está reservado nesse período.");
        }
    }

    public List<Abastecimento> abastecimentos() {
        return jdbc.sql("SELECT * FROM abastecimentos ORDER BY data DESC, id DESC").query(Abastecimento.class).list();
    }

    @Transactional
    public Abastecimento salvarAbastecimento(Long id, AbastecimentoPedido p) {
        if (p.data().isAfter(LocalDate.now(FUSO))) {
            throw new ValorInvalidoException("data", "A data do abastecimento não pode estar no futuro.");
        }
        validarVeiculo(p.veiculoId());
        String sql = id == null ? "INSERT INTO abastecimentos (veiculo_id, data, litros, valor) VALUES (:v,:data,:litros,:valor)"
                : "UPDATE abastecimentos SET veiculo_id=:v, data=:data, litros=:litros, valor=:valor WHERE id=:id";
        Long salvo = salvar(jdbc.sql(sql).param("v", p.veiculoId()).param("data", p.data())
                .param("litros", p.litros()).param("valor", p.valor()), id);
        return new Abastecimento(salvo, p.veiculoId(), p.data(), p.litros(), p.valor());
    }

    public List<Documento> documentos() {
        return jdbc.sql("SELECT * FROM documentos_frota ORDER BY validade, id").query(Documento.class).list();
    }

    @Transactional
    public Documento salvarDocumento(Long id, DocumentoPedido p) {
        if ((p.veiculoId() == null) == (p.motoristaId() == null)) {
            throw new ValorInvalidoException("Informe o veículo ou motorista do documento.");
        }
        if (p.veiculoId() != null) validarVeiculo(p.veiculoId());
        else bloquear("SELECT id FROM motoristas WHERE id=:id FOR UPDATE", p.motoristaId(), "motoristaId", "Motorista não encontrado.");
        String sql = id == null ? "INSERT INTO documentos_frota (veiculo_id, motorista_id, validade) VALUES (:v,:m,:validade)"
                : "UPDATE documentos_frota SET veiculo_id=:v, motorista_id=:m, validade=:validade WHERE id=:id";
        Long salvo = salvar(jdbc.sql(sql).param("v", p.veiculoId()).param("m", p.motoristaId())
                .param("validade", p.validade()), id);
        return new Documento(salvo, p.veiculoId(), p.motoristaId(), p.validade());
    }

    private void validarVeiculo(Long id) {
        bloquear("SELECT id FROM veiculos WHERE id=:id FOR UPDATE", id, "veiculoId", "Veículo não encontrado.");
    }

    private void bloquear(String sql, Long id, String campo, String mensagem) {
        if (jdbc.sql(sql).param("id", id).query(Long.class).optional().isEmpty()) {
            throw new ValorInvalidoException(campo, mensagem);
        }
    }

    private static long salvar(JdbcClient.StatementSpec stmt, Long id) {
        if (id == null) {
            var chave = new GeneratedKeyHolder();
            stmt.update(chave, "id");
            return chave.getKey().longValue();
        }
        conferirExistencia(stmt.param("id", id).update());
        return id;
    }

    void excluir(String sql, Long id) {
        conferirExistencia(jdbc.sql(sql).param("id", id).update());
    }

    private static void conferirExistencia(int linhas) {
        if (linhas == 0) throw new NotFoundException("Registro não encontrado.");
    }
}
