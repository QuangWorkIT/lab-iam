package com.example.iam_service.exception;

import lombok.Getter;

@Getter
public class RoleMapperException extends RuntimeException {
    public RoleMapperException(String message) {
        super(message);
    }
    public RoleMapperException(String message, Throwable cause) {
        super(message, cause);
    }
}
