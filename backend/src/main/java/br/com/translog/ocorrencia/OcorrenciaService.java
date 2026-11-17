package br.com.translog.ocorrencia;

import br.com.translog.common.NotFoundException;
import br.com.translog.common.ValorInvalidoException;
import br.com.translog.ocorrencia.dto.OcorrenciaRequest;
import br.com.translog.ocorrencia.dto.OcorrenciaResponse;
import br.com.translog.veiculo.VeiculoRepository;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Service
public class OcorrenciaService {

    private final OcorrenciaRepository repo;
    private final VeiculoRepository veiculos;
    private final OcorrenciaMapper mapper;

    public OcorrenciaService(OcorrenciaRepository repo, VeiculoRepository veiculos, OcorrenciaMapper mapper) {
        this.repo = repo;
        this.veiculos = veiculos;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<OcorrenciaResponse> listar(String q, String status, String tipo, LocalDate de, LocalDate ate) {
        if (de != null && ate != null && de.isAfter(ate)) {
            throw new ValorInvalidoException("A data inicial não pode ser maior que a final.");
        }

        Specification<Ocorrencia> spec = Specification.unrestricted();
        if (q != null && !q.isBlank()) {
            String termo = "%" + q.trim().toLowerCase(Locale.ROOT)
                    .replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("titulo")), termo, '\\'),
                    cb.like(cb.lower(root.get("descricao")), termo, '\\')));
        }
        if (status != null && !status.isBlank()) {
            StatusOcorrencia statusFiltro = StatusOcorrencia.de(status);
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), statusFiltro));
        }
        if (tipo != null && !tipo.isBlank()) {
            TipoOcorrencia tipoFiltro = TipoOcorrencia.de(tipo);
            spec = spec.and((root, query, cb) -> cb.equal(root.get("tipo"), tipoFiltro));
        }
        if (de != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("data"), de));
        }
        if (ate != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("data"), ate));
        }

        return repo.findAll(spec, Sort.by(Sort.Direction.DESC, "data", "id"))
                .stream().map(mapper::paraResposta).toList();
    }

    @Transactional(readOnly = true)
    public OcorrenciaResponse buscar(Long id) {
        return mapper.paraResposta(obter(id));
    }

    @Transactional
    public OcorrenciaResponse criar(OcorrenciaRequest request) {
        validarVinculos(request);
        return mapper.paraResposta(repo.save(mapper.paraEntidade(request)));
    }

    @Transactional
    public OcorrenciaResponse atualizar(Long id, OcorrenciaRequest request) {
        Ocorrencia ocorrencia = obter(id);
        validarVinculos(request);
        mapper.copiar(request, ocorrencia);
        return mapper.paraResposta(repo.save(ocorrencia));
    }

    @Transactional
    public void excluir(Long id) {
        repo.delete(obter(id));
    }

    private Ocorrencia obter(Long id) {
        return repo.findById(id).orElseThrow(() -> new NotFoundException("Ocorrência não encontrada."));
    }

    /** Vínculo inexistente é erro de validação do corpo (400 no campo), não recurso da URL ausente (404). */
    private void validarVinculos(OcorrenciaRequest request) {
        if (!veiculos.existsById(request.veiculoId())) {
            throw new ValorInvalidoException("veiculoId", "Veículo informado não existe.");
        }
        if (request.motoristaId() != null && repo.contarMotoristas(request.motoristaId()) == 0) {
            throw new ValorInvalidoException("motoristaId", "Motorista informado não existe.");
        }
    }
}
