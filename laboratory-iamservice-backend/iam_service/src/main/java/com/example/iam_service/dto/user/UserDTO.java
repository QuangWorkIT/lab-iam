package com.example.iam_service.dto.user;

import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class UserDTO {
    private UUID userId;
    private String email;
    private String phoneNumber;
    private String fullName;
    private String gender;
    private Integer age;
    private String address;
    private LocalDate birthdate;
    private String roleCode;
    private Boolean isActive;
    private LocalDate createdAt;
}
