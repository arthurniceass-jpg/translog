package br.com.translog.veiculo;

import br.com.translog.common.ConflictException;
import br.com.translog.common.NotFoundException;
import br.com.translog.veiculo.dto.VeiculoRequest;
import br.com.translog.veiculo.dto.VeiculoResponse;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

/**
 * Regras de negócio de veículos. O controller só recebe/devolve HTTP; o acesso a dados fica no repository.
 */
@Service
public class VeiculoService {

    private final VeiculoRepository repo;
    private final VeiculoMapper mapper;

    public VeiculoService(VeiculoRepository repo, VeiculoMapper mapper) {
        this.repo = repo;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<VeiculoResponse> listar(String q, String status) {
        Specification<Veiculo> spec = Specification.unrestricted();

        if (q != null && !q.isBlank()) {
            String termo = "%" + q.trim().toLowerCase(Locale.ROOT) + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("placa")), termo),
                    cb.like(cb.lower(root.get("marca")), termo),
                    cb.like(cb.lower(root.get("modelo")), termo)));
        }
        if (status != null && !status.isBlank()) {
            StatusVeiculo s = StatusVeiculo.de(status); // 400 se o status não existir
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), s));
        }

        return repo.findAll(spec, Sort.by(Sort.Direction.DESC, "id")).stream().map(mapper::paraResposta).toList();
    }

    @Transactional(readOnly = true)
    public VeiculoResponse buscar(Long id) {
        return mapper.paraResposta(obter(id));
    }

    @Transactional
    public VeiculoResponse criar(VeiculoRequest req) {
        String placa = VeiculoMapper.normalizarPlaca(req.placa());
        if (repo.existsByPlaca(placa)) {
            throw new ConflictException("Já existe um veículo com a placa " + placa + ".");
        }
        return mapper.paraResposta(repo.save(mapper.paraEntidade(req)));
    }

    @Transactional
    public VeiculoResponse atualizar(Long id, VeiculoRequest req) {
        Veiculo v = obter(id);
        String placa = VeiculoMapper.normalizarPlaca(req.placa());
        if (repo.existsByPlacaAndIdNot(placa, id)) {
            throw new ConflictException("Já existe um veículo com a placa " + placa + ".");
        }
        mapper.copiar(req, v);
        return mapper.paraResposta(repo.save(v));
    }

    @Transactional
    public void excluir(Long id) {
        Veiculo v = obter(id);
        long ocorrencias = repo.contarOcorrencias(id);
        if (ocorrencias > 0) {
            throw new ConflictException("Não é possível excluir o veículo " + v.getPlaca() + ": existem "
                    + ocorrencias + " ocorrência(s) vinculada(s) a ele.");
        }
        repo.delete(v);
    }

    private Veiculo obter(Long id) {
        return repo.findById(id).orElseThrow(() -> new NotFoundException("Veículo não encontrado."));
    }
}
