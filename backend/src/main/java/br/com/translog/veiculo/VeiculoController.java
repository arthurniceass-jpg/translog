package br.com.translog.veiculo;

import br.com.translog.veiculo.dto.VeiculoRequest;
import br.com.translog.veiculo.dto.VeiculoResponse;
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
 * MÓDULO DE REFERÊNCIA. Controller fino: valida (@Valid), delega ao service e define o status HTTP.
 * Erros viram JSON padronizado em common/GlobalExceptionHandler.
 */
@RestController
@RequestMapping("/api/veiculos")
@Tag(name = "Veículos")
public class VeiculoController {

    private final VeiculoService service;

    public VeiculoController(VeiculoService service) {
        this.service = service;
    }

    /** q casa placa/marca/modelo; status = "Disponível" | "Em uso" | "Manutenção". */
    @GetMapping
    public List<VeiculoResponse> listar(@RequestParam(required = false) String q,
                                        @RequestParam(required = false) String status) {
        return service.listar(q, status);
    }

    @GetMapping("/{id}")
    public VeiculoResponse buscar(@PathVariable Long id) {
        return service.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VeiculoResponse criar(@Valid @RequestBody VeiculoRequest req) {
        return service.criar(req);
    }

    @PutMapping("/{id}")
    public VeiculoResponse atualizar(@PathVariable Long id, @Valid @RequestBody VeiculoRequest req) {
        return service.atualizar(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        service.excluir(id);
    }
}
