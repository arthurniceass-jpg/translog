package br.com.translog.common;

/** Valor fora do domínio (ex.: status inexistente em filtro) -> HTTP 400. */
public class ValorInvalidoException extends RuntimeException {
    public ValorInvalidoException(String mensagem) {
        super(mensagem);
    }
}
