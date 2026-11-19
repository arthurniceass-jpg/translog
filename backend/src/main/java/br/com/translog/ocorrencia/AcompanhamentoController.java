package br.com.translog.ocorrencia;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Acompanhamento de ocorrências")
public class AcompanhamentoController {
    private final AcompanhamentoService service;

    public AcompanhamentoController(AcompanhamentoService service) {
        this.service = service;
    }

    @GetMapping("/acompanhamentos")
    public List<AcompanhamentoService.Dados> listar() {
        return service.listar();
    }

    @GetMapping("/responsaveis")
    public List<AcompanhamentoService.Pessoa> responsaveis() {
        return service.responsaveis();
    }

    @GetMapping("/resolucoes")
    public List<AcompanhamentoService.Resolucao> resolucoes() {
        return service.resolucoes();
    }

    @GetMapping("/ocorrencias/{id}/acompanhamento")
    public AcompanhamentoService.Detalhe detalhe(@PathVariable Long id) {
        return service.detalhe(id);
    }

    @PutMapping("/ocorrencias/{id}/acompanhamento")
    public AcompanhamentoService.Dados atualizar(@PathVariable Long id, @Valid @RequestBody AcompanhamentoService.Pedido pedido) {
        return service.atualizar(id, pedido);
    }

    @PostMapping(path = "/ocorrencias/{id}/anexos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public AcompanhamentoService.Anexo anexar(@PathVariable Long id, @RequestParam("arquivo") MultipartFile arquivo) throws IOException {
        return service.anexar(id, arquivo);
    }

    @GetMapping("/ocorrencias/{id}/anexos/{anexoId}")
    public ResponseEntity<byte[]> baixar(@PathVariable Long id, @PathVariable Long anexoId) {
        var arquivo = service.baixar(id, anexoId);
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(arquivo.tipo()))
                .cacheControl(CacheControl.noStore())
                .header("X-Content-Type-Options", "nosniff")
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(arquivo.nome(), StandardCharsets.UTF_8).build().toString())
                .body(arquivo.bytes());
    }

    @DeleteMapping("/ocorrencias/{id}/anexos/{anexoId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id, @PathVariable Long anexoId) {
        service.excluirAnexo(id, anexoId);
    }
}
