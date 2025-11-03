package com.example.iam_service.exception;

import lombok.Getter;

@Getter
public class DuplicateRoleException extends RuntimeException {
    public DuplicateRoleException(String message) {
        super(message);
    }
}