package com.example.iam_service.exception;

import lombok.Getter;

@Getter
public class RoleIsFixedException extends RuntimeException {
    public RoleIsFixedException(String message) {
        super(message);
    }
}
