package com.example.iam_service.dto.user;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class PatientDTO {
    private Integer patientId;
    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
    private String phone;
    private String email;
    private String address;
    private String identityNumber;
    private String createdBy;
    private String updatedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isActive;
}
