package com.example.iam_service.security;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OtpDetails {
    private String otp;
    private String email;
    private LocalDateTime expiration;
}
