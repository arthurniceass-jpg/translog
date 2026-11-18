package br.com.translog.motorista;

import br.com.translog.motorista.dto.MotoristaRequest;
import br.com.translog.motorista.dto.MotoristaResponse;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;

/** Conversão entidade <-> DTO (sem libs externas, para ficar explícito e fácil de copiar). */
@Component
public class MotoristaMapper {

    /**
     * Normaliza as categorias: remove espaços, deixa maiúscula e tira repetidas ("e" + "E" -> "E").
     * A ordem alfabética deixa a resposta estável para o front.
     */
    public static List<String> normalizarCategorias(Collection<String> categorias) {
        if (categorias == null) {
            return List.of();
        }
        return categorias.stream()
                .filter(Objects::nonNull)
                .map(c -> c.trim().toUpperCase(Locale.ROOT))
                .filter(c -> !c.isEmpty())
                .distinct()
                .sorted()
                .toList();
    }

    public Motorista paraEntidade(MotoristaRequest r) {
        Motorista m = new Motorista();
        copiar(r, m);
        return m;
    }

    /** Aplica os dados do request numa entidade existente (usado no PUT). */
    public void copiar(MotoristaRequest r, Motorista m) {
        m.setNome(r.nome().trim());
        m.setCpf(r.cpf().trim());
        m.setCnh(r.cnh().trim());
        m.setTelefone(r.telefone().trim());
        m.setStatus(r.status());
        Set<String> categorias = new LinkedHashSet<>(normalizarCategorias(r.categorias()));
        m.setCategorias(categorias);
    }

    public MotoristaResponse paraResposta(Motorista m) {
        return new MotoristaResponse(m.getId(), m.getNome(), m.getCpf(), m.getCnh(),
                normalizarCategorias(m.getCategorias()), m.getTelefone(), m.getStatus());
    }
}
