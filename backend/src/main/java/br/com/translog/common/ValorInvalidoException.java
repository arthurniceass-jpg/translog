package br.com.translog.common;

/**
 * Valor fora do domínio -> HTTP 400.
 * Com {@code campo}, o erro sai também em {@code fieldErrors} para o formulário destacar o campo
 * (ex.: veículo informado no corpo que não existe).
 */
public class ValorInvalidoException extends RuntimeException {

    private final String campo;

    public ValorInvalidoException(String mensagem) {
        this(null, mensagem);
    }

    public ValorInvalidoException(String campo, String mensagem) {
        super(mensagem);
        this.campo = campo;
    }

    public String getCampo() {
        return campo;
    }
}
