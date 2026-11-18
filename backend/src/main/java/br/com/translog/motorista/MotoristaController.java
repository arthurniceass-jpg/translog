package br.com.translog.motorista;

import br.com.translog.motorista.dto.MotoristaRequest;
import br.com.translog.motorista.dto.MotoristaResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller fino: valida (@Valid), delega ao service e define o status HTTP.
 * Erros viram JSON padronizado em common/GlobalExceptionHandler.
 */
@RestController
@RequestMapping("/api/motoristas")
@Tag(name = "Motoristas")
public class MotoristaController {

    private final MotoristaService service;

    public MotoristaController(MotoristaService service) {
        this.service = service;
    }

    /** q casa nome/CNH/CPF; status = "Disponível" | "Em viagem" | "Inativo". */
    @GetMapping
    public List<MotoristaResponse> listar(@RequestParam(required = false) String q,
                                          @RequestParam(required = false) String status) {
        return service.listar(q, status);
    }

    @GetMapping("/{id}")
    public MotoristaResponse buscar(@PathVariable Long id) {
        return service.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MotoristaResponse criar(@Valid @RequestBody MotoristaRequest req) {
        return service.criar(req);
    }

    @PutMapping("/{id}")
    public MotoristaResponse atualizar(@PathVariable Long id, @Valid @RequestBody MotoristaRequest req) {
        return service.atualizar(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        service.excluir(id);
    }
}
