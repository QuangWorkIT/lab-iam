package com.example.iam_service.dto.user;

import java.time.LocalDate;

import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUpdateUserDTO {
    private String fullName;
    @Pattern(regexp = "^\\+?[0-9]*$", message = "Phone number must contain only digits")
    private String phoneNumber;
    @Pattern(regexp = "^\\+?[0-9]*$", message = "identityNumber must contain only digits")
    private String identityNumber;
    @Pattern(regexp = "^(MALE|FEMALE)$", message = "Invalid gender value")
    private String gender;
    @Past(message = "Birthdate must be in the past")
    private LocalDate birthdate;
    private String address;
    private Boolean isActive;
    private String roleCode;
}
