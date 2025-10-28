package com.example.iam_service.dto.user;

import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUpdateUserDTO {
    private String fullName;
    private String email;
    private String phoneNumber;
    private String identityNumber;
    private String gender;
    private LocalDate birthdate;
    private String address;
    private Boolean isActive;
    private String roleCode;
}
