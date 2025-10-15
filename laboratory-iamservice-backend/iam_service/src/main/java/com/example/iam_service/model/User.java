package com.example.iam_service.model;

import jakarta.persistence.*;
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
    private UUID userid;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(length = 255)
    private String phonenumber;

    @Column(nullable = false, length = 255)
    private String fullName;

    @Column(nullable = false, length = 255)
    private String indentitynumber;

    @Column(nullable = false, length = 10)
    private String gender;

    private Integer age;

    @Column(length = 255)
    private String address;

    private LocalDate birthdate;

    @Column(nullable = false, length = 255)
    private String password;

    private String rolecode;

    private Boolean isactive;

    private LocalDate createdat;
}
