package com.example.iam_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ResetPassOptionRequest {
    @NotBlank(message = "option is required")
    private String option;

    @NotBlank(message = "data is required")
    private String data;
}
