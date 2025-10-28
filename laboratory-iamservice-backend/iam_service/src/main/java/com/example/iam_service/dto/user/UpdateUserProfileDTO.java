package com.example.iam_service.dto.user;

import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserProfileDTO {
    private String phoneNumber;
    private String fullName;
    private String gender;
    private LocalDate birthdate;
    private String address;
}
