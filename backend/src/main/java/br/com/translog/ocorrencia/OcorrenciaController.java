package br.com.translog.ocorrencia;

import br.com.translog.ocorrencia.dto.OcorrenciaRequest;
import br.com.translog.ocorrencia.dto.OcorrenciaResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.format.annotation.DateTimeFormat.ISO;
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

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/ocorrencias")
@Tag(name = "Ocorrências")
public class OcorrenciaController {

    private final OcorrenciaService service;

    public OcorrenciaController(OcorrenciaService service) {
        this.service = service;
    }

    @GetMapping
    public List<OcorrenciaResponse> listar(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate de,
            @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate ate) {
        return service.listar(q, status, tipo, de, ate);
    }

    @GetMapping("/{id}")
    public OcorrenciaResponse buscar(@PathVariable Long id) {
        return service.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OcorrenciaResponse criar(@Valid @RequestBody OcorrenciaRequest request) {
        return service.criar(request);
    }

    @PutMapping("/{id}")
    public OcorrenciaResponse atualizar(@PathVariable Long id, @Valid @RequestBody OcorrenciaRequest request) {
        return service.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        service.excluir(id);
    }
}
