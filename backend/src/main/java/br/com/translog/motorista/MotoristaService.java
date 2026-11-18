package br.com.translog.motorista;

import br.com.translog.common.BuscaTexto;
import br.com.translog.common.ConflictException;
import br.com.translog.common.NotFoundException;
import br.com.translog.motorista.dto.MotoristaRequest;
import br.com.translog.motorista.dto.MotoristaResponse;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Regras de negócio de motoristas. O controller só recebe/devolve HTTP; o acesso a dados fica no repository.
 */
@Service
public class MotoristaService {

    private final MotoristaRepository repo;
    private final MotoristaMapper mapper;

    public MotoristaService(MotoristaRepository repo, MotoristaMapper mapper) {
        this.repo = repo;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<MotoristaResponse> listar(String q, String status) {
        Specification<Motorista> spec = Specification.unrestricted();

        if (q != null && !q.isBlank()) {
            String termo = BuscaTexto.padraoContem(q);
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("nome")), termo, BuscaTexto.ESCAPE),
                    cb.like(cb.lower(root.get("cnh")), termo, BuscaTexto.ESCAPE),
                    cb.like(cb.lower(root.get("cpf")), termo, BuscaTexto.ESCAPE)));
        }
        if (status != null && !status.isBlank()) {
            StatusMotorista s = StatusMotorista.de(status); // 400 se o status não existir
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), s));
        }

        return repo.findAll(spec, Sort.by(Sort.Direction.DESC, "id")).stream().map(mapper::paraResposta).toList();
    }

    @Transactional(readOnly = true)
    public MotoristaResponse buscar(Long id) {
        return mapper.paraResposta(obter(id));
    }

    @Transactional
    public MotoristaResponse criar(MotoristaRequest req) {
        validarDocumentos(req, null);
        return mapper.paraResposta(repo.save(mapper.paraEntidade(req)));
    }

    @Transactional
    public MotoristaResponse atualizar(Long id, MotoristaRequest req) {
        Motorista m = obter(id);
        validarDocumentos(req, id);
        mapper.copiar(req, m);
        return mapper.paraResposta(repo.save(m));
    }

    @Transactional
    public void excluir(Long id) {
        Motorista m = obter(id);
        long ocorrencias = repo.contarOcorrencias(id);
        if (ocorrencias > 0) {
            throw new ConflictException("Não é possível excluir o motorista " + m.getNome() + ": existem "
                    + ocorrencias + " ocorrência(s) vinculada(s) a ele.");
        }
        repo.delete(m);
    }

    /** CPF e CNH são únicos; no PUT (id != null) o próprio registro é ignorado. */
    private void validarDocumentos(MotoristaRequest req, Long id) {
        String cpf = req.cpf().trim();
        String cnh = req.cnh().trim();

        boolean cpfEmUso = id == null ? repo.existsByCpf(cpf) : repo.existsByCpfAndIdNot(cpf, id);
        if (cpfEmUso) {
            throw new ConflictException("cpf", "Já existe um motorista com este CPF.");
        }

        boolean cnhEmUso = id == null ? repo.existsByCnh(cnh) : repo.existsByCnhAndIdNot(cnh, id);
        if (cnhEmUso) {
            throw new ConflictException("cnh", "Já existe um motorista com esta CNH.");
        }
    }

    private Motorista obter(Long id) {
        return repo.findById(id).orElseThrow(() -> new NotFoundException("Motorista não encontrado."));
    }
}
