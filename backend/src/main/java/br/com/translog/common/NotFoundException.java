package br.com.translog.common;

/** Recurso não encontrado -> HTTP 404. */
public class NotFoundException extends RuntimeException {
    public NotFoundException(String mensagem) {
        super(mensagem);
    }
}
