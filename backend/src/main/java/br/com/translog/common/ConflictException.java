package br.com.translog.common;

/** Violação de regra de unicidade/integridade -> HTTP 409. */
public class ConflictException extends RuntimeException {
    public ConflictException(String mensagem) {
        super(mensagem);
    }
}
