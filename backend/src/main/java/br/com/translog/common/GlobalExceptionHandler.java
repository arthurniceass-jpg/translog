package br.com.translog.common;

import jakarta.servlet.http.HttpServletRequest;
import org.apache.tomcat.util.http.InvalidParameterException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/** Tratamento centralizado de erros: todo erro sai no formato {@link ApiError}. */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> validacao(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, String> campos = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(f -> campos.putIfAbsent(f.getField(), f.getDefaultMessage()));
        return erro(HttpStatus.BAD_REQUEST, "Dados inválidos. Verifique os campos informados.", req, campos);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> corpoIlegivel(HttpMessageNotReadableException ex, HttpServletRequest req) {
        // Cobre JSON malformado e valores de enum inválidos (ex.: status inexistente)
        String causa = ex.getMostSpecificCause().getMessage();
        String msg = causa != null && causa.startsWith("Valor inválido")
                ? causa : "Corpo da requisição inválido ou malformado.";
        return erro(HttpStatus.BAD_REQUEST, msg, req, null);
    }

    @ExceptionHandler({ValorInvalidoException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ApiError> valorInvalido(Exception ex, HttpServletRequest req) {
        String msg = ex instanceof ValorInvalidoException ? ex.getMessage() : "Parâmetro inválido na requisição.";
        return erro(HttpStatus.BAD_REQUEST, msg, req, null);
    }

    /** Query string com bytes que não são UTF-8 válido (cliente com encoding errado). */
    @ExceptionHandler(InvalidParameterException.class)
    public ResponseEntity<ApiError> parametroMalCodificado(InvalidParameterException ex, HttpServletRequest req) {
        return erro(HttpStatus.BAD_REQUEST, "Parâmetro com codificação inválida. Envie a URL em UTF-8.", req, null);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiError> credenciais(BadCredentialsException ex, HttpServletRequest req) {
        return erro(HttpStatus.UNAUTHORIZED, ex.getMessage(), req, null);
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiError> naoEncontrado(NotFoundException ex, HttpServletRequest req) {
        return erro(HttpStatus.NOT_FOUND, ex.getMessage(), req, null);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiError> conflito(ConflictException ex, HttpServletRequest req) {
        return erro(HttpStatus.CONFLICT, ex.getMessage(), req, null);
    }

    /** Rede de segurança: unicidade/FK violada no banco que escapou das checagens do service. */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> integridade(DataIntegrityViolationException ex, HttpServletRequest req) {
        return erro(HttpStatus.CONFLICT, "Operação não permitida: o registro conflita com dados existentes.", req, null);
    }

    /** Rota inexistente (ex.: módulo ainda não implementado): 404 em vez de 500. */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiError> rotaInexistente(NoResourceFoundException ex, HttpServletRequest req) {
        return erro(HttpStatus.NOT_FOUND, "Recurso não encontrado: " + req.getRequestURI(), req, null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> inesperado(Exception ex, HttpServletRequest req) {
        log.error("Erro não tratado em {}", req.getRequestURI(), ex);
        return erro(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno. Tente novamente mais tarde.", req, null);
    }

    public static ResponseEntity<ApiError> erro(HttpStatus status, String msg, HttpServletRequest req, Map<String, String> campos) {
        ApiError body = new ApiError(Instant.now(), status.value(), status.getReasonPhrase(), msg,
                req.getRequestURI(), campos);
        return ResponseEntity.status(status).body(body);
    }
}
