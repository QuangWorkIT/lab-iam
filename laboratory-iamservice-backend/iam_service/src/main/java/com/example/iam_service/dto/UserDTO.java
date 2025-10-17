package com.example.iam_service.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class UserDTO {
    private UUID userid;
    private String email;
    private String phoneNumber;
    private String fullName;
    private String gender;
    private Integer age;
    private String address;
    private LocalDate birthdate;
    private Boolean isActive;
    private LocalDate createdAt;
}
