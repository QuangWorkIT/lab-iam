package com.example.iam_service.exception;

public class NotAllowIpException extends RuntimeException {
    public NotAllowIpException(String message) {
        super(message);
    }
}
