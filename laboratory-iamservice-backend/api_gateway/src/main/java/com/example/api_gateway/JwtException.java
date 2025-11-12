package com.example.api_gateway;

public class JwtException extends RuntimeException{
    public JwtException(String message) {
        super(message);
    }
}
