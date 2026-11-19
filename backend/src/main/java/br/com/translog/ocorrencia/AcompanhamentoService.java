package br.com.translog.ocorrencia;

import br.com.translog.common.ConflictException;
import br.com.translog.common.NotFoundException;
import br.com.translog.common.ValorInvalidoException;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Service
public class AcompanhamentoService {
    public enum Prioridade { BAIXA, NORMAL, ALTA, URGENTE }

    public record Pedido(@Positive Long responsavelId, LocalDate prazo, @NotNull Prioridade prioridade) {}
    public record Dados(Long ocorrenciaId, Long responsavelId, LocalDate prazo, Prioridade prioridade) {}
    public record Pessoa(Long id, String nome) {}
    public record Alteracao(Long id, StatusOcorrencia anterior, StatusOcorrencia novoStatus, String autor, OffsetDateTime registradoEm) {}
    public record Anexo(Long id, String nome, String tipo, int tamanho, OffsetDateTime enviadoEm) {}
    public record Conteudo(String nome, String tipo, byte[] bytes) {}
    public record Detalhe(Dados dados, List<Alteracao> historico, List<Anexo> anexos) {}
    public record Resolucao(Long ocorrenciaId, OffsetDateTime resolvidaEm, long segundos) {}

    private static final int LIMITE_BYTES = 5 * 1024 * 1024;
    private static final int LIMITE_ANEXOS = 10;
    private final JdbcClient jdbc;

    public AcompanhamentoService(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<Dados> listar() {
        return jdbc.sql("SELECT * FROM ocorrencia_acompanhamento ORDER BY ocorrencia_id").query(Dados.class).list();
    }

    public List<Pessoa> responsaveis() {
        return jdbc.sql("SELECT id, nome FROM usuarios ORDER BY nome, id").query(Pessoa.class).list();
    }

    @Transactional(readOnly = true)
    public Detalhe detalhe(Long id) {
        if (jdbc.sql("SELECT id FROM ocorrencias WHERE id=:id").param("id", id).query(Long.class).optional().isEmpty()) {
            throw new NotFoundException("Ocorrência não encontrada.");
        }
        Dados dados = jdbc.sql("SELECT * FROM ocorrencia_acompanhamento WHERE ocorrencia_id=:id").param("id", id)
                .query(Dados.class).optional().orElseGet(() -> new Dados(id, null, null, Prioridade.NORMAL));
        List<Alteracao> historico = jdbc.sql("""
                SELECT h.id, h.anterior, h.status AS novo_status, u.nome AS autor, h.registrado_em
                FROM ocorrencia_status_historico h LEFT JOIN usuarios u ON u.id=h.usuario_id
                WHERE h.ocorrencia_id=:id ORDER BY h.id DESC
                """).param("id", id).query(Alteracao.class).list();
        List<Anexo> anexos = jdbc.sql("""
                SELECT id, nome, tipo, tamanho, enviado_em FROM ocorrencia_anexos
                WHERE ocorrencia_id=:id ORDER BY id DESC
                """).param("id", id).query(Anexo.class).list();
        return new Detalhe(dados, historico, anexos);
    }

    @Transactional
    public Dados atualizar(Long id, Pedido pedido) {
        bloquearOcorrencia(id);
        if (pedido.responsavelId() != null && jdbc.sql("SELECT id FROM usuarios WHERE id=:id")
                .param("id", pedido.responsavelId()).query(Long.class).optional().isEmpty()) {
            throw new ValorInvalidoException("responsavelId", "Responsável não encontrado.");
        }
        int alterados = jdbc.sql("""
                UPDATE ocorrencia_acompanhamento SET responsavel_id=:usuario, prazo=:prazo, prioridade=:prioridade
                WHERE ocorrencia_id=:id
                """).param("id", id).param("usuario", pedido.responsavelId()).param("prazo", pedido.prazo())
                .param("prioridade", pedido.prioridade().name()).update();
        if (alterados == 0) {
            jdbc.sql("""
                    INSERT INTO ocorrencia_acompanhamento (ocorrencia_id, responsavel_id, prazo, prioridade)
                    VALUES (:id, :usuario, :prazo, :prioridade)
                    """).param("id", id).param("usuario", pedido.responsavelId()).param("prazo", pedido.prazo())
                    .param("prioridade", pedido.prioridade().name()).update();
        }
        return new Dados(id, pedido.responsavelId(), pedido.prazo(), pedido.prioridade());
    }

    void registrarStatus(Long ocorrenciaId, StatusOcorrencia anterior, StatusOcorrencia novo) {
        if (anterior == novo) return;
        var autenticacao = SecurityContextHolder.getContext().getAuthentication();
        Long usuarioId = autenticacao instanceof JwtAuthenticationToken jwt ? Long.valueOf(jwt.getName()) : null;
        jdbc.sql("""
                INSERT INTO ocorrencia_status_historico (ocorrencia_id, usuario_id, anterior, status)
                VALUES (:id, :usuario, :anterior, :status)
                """).param("id", ocorrenciaId).param("usuario", usuarioId).param("anterior", anterior == null ? null : anterior.name())
                .param("status", novo.name()).update();
    }

    public List<Resolucao> resolucoes() {
        return jdbc.sql("""
                SELECT o.id, MIN(CASE WHEN h.anterior IS NULL AND h.status <> 'RESOLVIDA' THEN h.registrado_em END) AS abertura,
                    MAX(CASE WHEN h.status = 'RESOLVIDA' THEN h.registrado_em END) AS resolucao
                FROM ocorrencias o JOIN ocorrencia_status_historico h ON h.ocorrencia_id = o.id
                WHERE o.status = 'RESOLVIDA' GROUP BY o.id
                HAVING MIN(CASE WHEN h.anterior IS NULL AND h.status <> 'RESOLVIDA' THEN h.registrado_em END) IS NOT NULL
                    AND MAX(CASE WHEN h.status = 'RESOLVIDA' THEN h.registrado_em END) IS NOT NULL
                ORDER BY o.id
                """).query((rs, n) -> {
                    var abertura = rs.getObject("abertura", OffsetDateTime.class);
                    var resolucao = rs.getObject("resolucao", OffsetDateTime.class);
                    return new Resolucao(rs.getLong("id"), resolucao, Duration.between(abertura, resolucao).toSeconds());
                }).list();
    }

    @Transactional
    public Anexo anexar(Long id, MultipartFile arquivo) throws IOException {
        if (arquivo.isEmpty() || arquivo.getSize() > LIMITE_BYTES) {
            throw new ValorInvalidoException("arquivo", "Selecione um arquivo de até 5 MB.");
        }
        byte[] bytes = arquivo.getBytes();
        String tipo = tipoArquivo(bytes);
        String nome = arquivo.getOriginalFilename();
        nome = nome == null ? "" : nome.replaceAll("[^\\p{L}\\p{N} ._()-]", "_").strip();
        if (nome.isBlank() || nome.equals(".") || nome.equals("..")) nome = "anexo";
        if (nome.length() > 150) nome = nome.substring(0, 150);

        bloquearOcorrencia(id);
        long existentes = jdbc.sql("SELECT COUNT(*) FROM ocorrencia_anexos WHERE ocorrencia_id=:id")
                .param("id", id).query(Long.class).single();
        if (existentes >= LIMITE_ANEXOS) throw new ConflictException("Esta ocorrência já possui 10 anexos.");

        var chave = new GeneratedKeyHolder();
        jdbc.sql("""
                INSERT INTO ocorrencia_anexos (ocorrencia_id, nome, tipo, tamanho, conteudo) VALUES (:id, :nome, :tipo, :tam, :bytes)
                """).param("id", id).param("nome", nome).param("tipo", tipo).param("tam", bytes.length).param("bytes", bytes)
                .update(chave, "id");
        return jdbc.sql("SELECT id, nome, tipo, tamanho, enviado_em FROM ocorrencia_anexos WHERE id=:id")
                .param("id", chave.getKey().longValue()).query(Anexo.class).single();
    }

    public Conteudo baixar(Long id, Long anexoId) {
        return jdbc.sql("SELECT nome, tipo, conteudo FROM ocorrencia_anexos WHERE ocorrencia_id=:id AND id=:anexoId")
                .param("id", id).param("anexoId", anexoId)
                .query((rs, n) -> new Conteudo(rs.getString("nome"), rs.getString("tipo"), rs.getBytes("conteudo")))
                .optional().orElseThrow(() -> new NotFoundException("Anexo não encontrado."));
    }

    public void excluirAnexo(Long id, Long anexoId) {
        if (jdbc.sql("DELETE FROM ocorrencia_anexos WHERE ocorrencia_id=:id AND id=:anexoId")
                .param("id", id).param("anexoId", anexoId).update() == 0) {
            throw new NotFoundException("Anexo não encontrado.");
        }
    }

    void bloquearOcorrencia(Long id) {
        if (jdbc.sql("SELECT id FROM ocorrencias WHERE id=:id FOR UPDATE").param("id", id).query(Long.class).optional().isEmpty()) {
            throw new NotFoundException("Ocorrência não encontrada.");
        }
    }

    private static String tipoArquivo(byte[] bytes) {
        if (java.util.Arrays.equals(bytes, 0, Math.min(5, bytes.length), "%PDF-".getBytes(StandardCharsets.US_ASCII), 0, 5)) {
            return "application/pdf";
        }
        if (bytes.length >= 8 && bytes[0] == (byte) 0x89 && bytes[1] == 'P' && bytes[2] == 'N'
                && bytes[3] == 'G' && bytes[4] == 13 && bytes[5] == 10 && bytes[6] == 26 && bytes[7] == 10) {
            return "image/png";
        }
        if (bytes.length >= 3 && bytes[0] == (byte) 0xFF && bytes[1] == (byte) 0xD8 && bytes[2] == (byte) 0xFF) {
            return "image/jpeg";
        }
        throw new ValorInvalidoException("arquivo", "Envie um arquivo PDF, PNG ou JPEG.");
    }
}
