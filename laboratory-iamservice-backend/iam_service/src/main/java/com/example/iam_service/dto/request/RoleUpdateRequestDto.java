package com.example.iam_service.dto.request;

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
public class RoleUpdateRequestDto {

    @Pattern(regexp = "^[a-zA-Z0-9_]*$")
    @NotBlank(message = "Role name is required")
    private String name;

    @Schema(description = "Role's description", example = "This role belongs to admin")
    private String description;

    @Schema(description = "Role's privileges", example = "READ_ONLY,CREATE_ROLE")
    private String privileges;

    @Schema(description = "Role's update date")
    private LocalDate lastUpdatedAt;

}
