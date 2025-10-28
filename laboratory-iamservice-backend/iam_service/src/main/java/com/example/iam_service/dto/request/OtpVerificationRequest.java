package com.example.iam_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class OtpVerificationRequest {
    @NotBlank(message = "otp is required")
    private String otp;

    @NotBlank(message = "email is required")
    private String email;
}
