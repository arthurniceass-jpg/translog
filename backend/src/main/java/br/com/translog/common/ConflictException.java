package br.com.translog.common;

/**
 * Violação de regra de unicidade/integridade -> HTTP 409.
 * Com {@code campo}, o erro sai também em {@code fieldErrors} para o formulário destacar o campo.
 */
public class ConflictException extends RuntimeException {

    private final String campo;

    public ConflictException(String mensagem) {
        this(null, mensagem);
    }

    public ConflictException(String campo, String mensagem) {
        super(mensagem);
        this.campo = campo;
    }

    public String getCampo() {
        return campo;
    }
}
