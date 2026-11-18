package br.com.translog.dashboard;

import br.com.translog.common.Rotulado;
import br.com.translog.dashboard.DashboardRepository.Contagem;
import br.com.translog.dashboard.dto.ResumoResponse;
import br.com.translog.motorista.StatusMotorista;
import br.com.translog.ocorrencia.StatusOcorrencia;
import br.com.translog.ocorrencia.TipoOcorrencia;
import br.com.translog.veiculo.StatusVeiculo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Monta o resumo do dashboard a partir das agregações do banco.
 * O banco guarda o nome do enum; a API devolve o rótulo com acento. Todas as chaves do enum
 * aparecem no mapa (com zero quando não há registros), na ordem de declaração do enum.
 */
@Service
public class DashboardService {

    private final DashboardRepository repo;

    public DashboardService(DashboardRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public ResumoResponse resumo() {
        List<Contagem> veiculosPorStatus = repo.veiculosPorStatus();
        List<Contagem> motoristasPorStatus = repo.motoristasPorStatus();
        List<Contagem> ocorrenciasPorStatus = repo.ocorrenciasPorStatus();
        List<Contagem> ocorrenciasPorTipo = repo.ocorrenciasPorTipo();

        ResumoResponse.Totais totais = new ResumoResponse.Totais(
                repo.totalVeiculos(),
                repo.totalMotoristas(),
                repo.totalOcorrencias(),
                totalDe(ocorrenciasPorStatus, StatusOcorrencia.ABERTA.name()),
                totalDe(veiculosPorStatus, StatusVeiculo.DISPONIVEL.name()));

        return new ResumoResponse(
                totais,
                preencher(StatusVeiculo.values(), veiculosPorStatus),
                preencher(StatusMotorista.values(), motoristasPorStatus),
                preencher(StatusOcorrencia.values(), ocorrenciasPorStatus),
                preencher(TipoOcorrencia.values(), ocorrenciasPorTipo));
    }

    /** Converte as contagens por nome de enum em um mapa rotulado, ordenado e com zeros preenchidos. */
    private static <E extends Enum<E> & Rotulado> Map<String, Long> preencher(E[] valores, List<Contagem> contagens) {
        Map<String, Long> porNome = new LinkedHashMap<>();
        for (Contagem c : contagens) {
            porNome.merge(c.chave().toUpperCase(Locale.ROOT), c.total(), Long::sum);
        }

        Map<String, Long> resultado = new LinkedHashMap<>();
        for (E valor : valores) {
            resultado.put(valor.getRotulo(), porNome.getOrDefault(valor.name(), 0L));
        }
        return resultado;
    }

    private static long totalDe(List<Contagem> contagens, String nomeEnum) {
        return contagens.stream()
                .filter(c -> c.chave().equalsIgnoreCase(nomeEnum))
                .mapToLong(Contagem::total)
                .sum();
    }
}
