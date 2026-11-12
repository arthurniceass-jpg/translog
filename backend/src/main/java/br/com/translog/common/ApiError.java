package br.com.translog.common;

import java.time.Instant;
import java.util.Map;

/** Formato padrão de erro da API. */
public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> fieldErrors) {
}
