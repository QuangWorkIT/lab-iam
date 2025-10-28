package com.example.iam_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ResetPassWordRequest {
    @NotBlank(message = "user id is required")
    private String userid;

    @NotBlank(message = "password is required")
    private String password;
}
