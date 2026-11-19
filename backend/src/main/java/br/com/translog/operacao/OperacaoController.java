package br.com.translog.operacao;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static br.com.translog.operacao.OperacaoDados.*;

@RestController
@RequestMapping("/api")
@Tag(name = "Operação da frota")
public class OperacaoController {
    private final OperacaoService service;

    public OperacaoController(OperacaoService service) {
        this.service = service;
    }

    @GetMapping("/manutencoes")
    public List<Manutencao> manutencoes() {
        return service.manutencoes();
    }

    @PostMapping("/manutencoes")
    @ResponseStatus(HttpStatus.CREATED)
    public Manutencao criarManutencao(@Valid @RequestBody ManutencaoPedido pedido) {
        return service.salvarManutencao(null, pedido);
    }

    @PutMapping("/manutencoes/{id}")
    public Manutencao atualizarManutencao(@PathVariable Long id, @Valid @RequestBody ManutencaoPedido pedido) {
        return service.salvarManutencao(id, pedido);
    }

    @DeleteMapping("/manutencoes/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluirManutencao(@PathVariable Long id) {
        service.excluir("DELETE FROM manutencoes WHERE id=:id", id);
    }

    @GetMapping("/viagens")
    public List<Viagem> viagens() {
        return service.viagens();
    }

    @PostMapping("/viagens")
    @ResponseStatus(HttpStatus.CREATED)
    public Viagem criarViagem(@Valid @RequestBody ViagemPedido pedido) {
        return service.salvarViagem(null, pedido);
    }

    @PutMapping("/viagens/{id}")
    public Viagem atualizarViagem(@PathVariable Long id, @Valid @RequestBody ViagemPedido pedido) {
        return service.salvarViagem(id, pedido);
    }

    @DeleteMapping("/viagens/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluirViagem(@PathVariable Long id) {
        service.excluir("DELETE FROM viagens WHERE id=:id", id);
    }

    @GetMapping("/abastecimentos")
    public List<Abastecimento> abastecimentos() {
        return service.abastecimentos();
    }

    @PostMapping("/abastecimentos")
    @ResponseStatus(HttpStatus.CREATED)
    public Abastecimento criarAbastecimento(@Valid @RequestBody AbastecimentoPedido pedido) {
        return service.salvarAbastecimento(null, pedido);
    }

    @PutMapping("/abastecimentos/{id}")
    public Abastecimento atualizarAbastecimento(@PathVariable Long id, @Valid @RequestBody AbastecimentoPedido pedido) {
        return service.salvarAbastecimento(id, pedido);
    }

    @DeleteMapping("/abastecimentos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluirAbastecimento(@PathVariable Long id) {
        service.excluir("DELETE FROM abastecimentos WHERE id=:id", id);
    }

    @GetMapping("/documentos")
    public List<Documento> documentos() {
        return service.documentos();
    }

    @PostMapping("/documentos")
    @ResponseStatus(HttpStatus.CREATED)
    public Documento criarDocumento(@Valid @RequestBody DocumentoPedido pedido) {
        return service.salvarDocumento(null, pedido);
    }

    @PutMapping("/documentos/{id}")
    public Documento atualizarDocumento(@PathVariable Long id, @Valid @RequestBody DocumentoPedido pedido) {
        return service.salvarDocumento(id, pedido);
    }

    @DeleteMapping("/documentos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluirDocumento(@PathVariable Long id) {
        service.excluir("DELETE FROM documentos_frota WHERE id=:id", id);
    }
}
