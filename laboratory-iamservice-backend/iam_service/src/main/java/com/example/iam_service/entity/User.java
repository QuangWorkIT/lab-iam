package com.example.iam_service.entity;

import com.example.iam_service.util.EncryptDecryptConverter;
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

    // null
    @Convert(converter = EncryptDecryptConverter.class)
    @Pattern(regexp = "^\\+?[0-9]*$", message = "Phone number must contain only digits")
    @Column(nullable = true, length = 255)
    private String phoneNumber;

    @NotBlank(message = "Full name is required")
    @Column(nullable = false, length = 255)
    private String fullName;

    //null
    @Convert(converter = EncryptDecryptConverter.class)
    @Column(nullable = true, length = 255)
    private String identityNumber;

    @Pattern(
            regexp = "^(MALE|FEMALE)$",
            message = "Gender must be either MALE or FEMALE"
    )
    @Column(nullable = true, length = 10)
    private String gender;

    //null
    @Column(nullable = true)
    private Integer age;

    //null
    @Convert(converter = EncryptDecryptConverter.class)
    @Column(nullable = true, length = 255)
    private String address;

    //null
    @Column(nullable = true)
    private LocalDate birthdate;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(length = 255)
    private String roleCode;

    private Boolean isActive;

    private LocalDate createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDate.now();
    }

}
