package com.example.iam_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleDTO {
    @NotBlank(message = "Role code is required")
    private String code;

    @NotBlank(message = "Role name is required")
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    private String privileges;

    private LocalDate createdAt;

    private LocalDate lastUpdatedAt;

    private Boolean isActive;
}
