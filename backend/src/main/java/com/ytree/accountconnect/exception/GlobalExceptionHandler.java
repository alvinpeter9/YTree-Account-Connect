package com.ytree.accountconnect.exception;

import com.ytree.accountconnect.dto.ApiErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ApiException.class)
    ResponseEntity<ApiErrorResponse> handleApiException(ApiException exception) {
        var response = new ApiErrorResponse(
                exception.code(),
                exception.getMessage(),
                exception.details()
        );
        return ResponseEntity.status(exception.status()).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException exception) {
        List<String> details = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .toList();

        var response = new ApiErrorResponse(
                "INVALID_REQUEST",
                "Check the information and try again.",
                details
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
}
