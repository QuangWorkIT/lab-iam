package com.example.iam_service.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "\"User\"") // 👈 because "User" is a reserved word in Postgres
@Data                   // includes @Getter, @Setter, @ToString, @EqualsAndHashCode
@NoArgsConstructor      // generates empty constructor
@AllArgsConstructor     // generates full constructor
@Builder                // lets you use User.builder() to create objects easily
public class User {

    @Id
    @GeneratedValue
    @Column(name = "userid", updatable = false, nullable = false)
    private UUID userId;

    @NotNull(message = "Email cannot be null")
    @Email(message = "Invalid email format")
    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Pattern(regexp = "^\\+?[0-9]*$", message = "Phone number must contain only digits")
    @Column(length = 255)
    private String phoneNumber;

    @NotBlank(message = "Full name is required")
    @Column(nullable = false, length = 255)
    private String fullName;

    @NotBlank(message = "Identity number is required")
    @Column(nullable = false, length = 255)
    private String indentityNumber;

    @Pattern(
            regexp = "^(MALE|FEMALE)$",
            message = "Gender must be either MALE or FEMALE"
    )
    @Column(nullable = false, length = 10)
    private String gender;

    private Integer age;

    @Column(length = 255)
    private String address;

    private LocalDate birthdate;

    @NotBlank(message = "Password cannot be blank")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z]).{8,}$",
            message = "Password must be at least 8 characters long and include at least one uppercase and one lowercase letter"
    )
    @Column(nullable = false, length = 255)
    private String password;

    @Column(length = 255)
    private String roleCode;

    private Boolean isCctive;

    private LocalDate createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDate.now();
    }

}
