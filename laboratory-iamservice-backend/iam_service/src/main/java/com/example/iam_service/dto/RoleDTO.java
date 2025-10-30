package com.example.iam_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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
    private String code;

    @Pattern(regexp = "^[a-zA-Z0-9_]*$")
    @NotBlank(message = "Role name is required")
    private String name;

    @NotBlank(message = "Description is required")
    @Schema(description = "Role's description", example = "This role belongs to admin")
    private String description;

    @Schema(description = "Role's privileges", example = "READ_ONLY,CREATE_ROLE")
    private String privileges;


    @Schema(description = "Role's create date")
    private LocalDate createdAt;
    @Schema(description = "Role's update date")
    private LocalDate lastUpdatedAt;

    @Schema(description = "Role's active status", example = "true")
    private Boolean isActive;

    @Schema(description = "Role's active status", example = "true")
    private Boolean deletable;
}
