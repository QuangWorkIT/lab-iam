package com.example.iam_service.dto.user;

import lombok.Data;

@Data
public class PatientCreateRequest {
    private String fullName;
    private String dateOfBirth;
    private String gender;
    private String phone;
    private String email;
    private String address;
    private String identityNumber;
}
