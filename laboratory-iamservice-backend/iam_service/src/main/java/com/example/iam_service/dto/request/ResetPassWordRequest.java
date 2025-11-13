package com.example.iam_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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

    @NotBlank(message = "option is required")
    @Pattern(
            regexp = "^(change|reset)$",
            message = "option must be either 'change' or 'reset'"
    )
    private String option;

    private String currentPassword;
}
