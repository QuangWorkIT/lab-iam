package com.example.iam_service.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "\"Role\"") // Use quotes as it might be a reserved keyword
@Data                   // includes @Getter, @Setter, @ToString, @EqualsAndHashCode
@NoArgsConstructor      // generates empty constructor
@AllArgsConstructor     // generates full constructor
@Builder                // lets you use Role.builder() to create objects easily
public class Role {

    @Id
    @Column(name = "role_code", updatable = false, nullable = false)
    private String code;

    @NotBlank(message = "Role name is required")
    @Column(name = "role_name", nullable = false, length = 255)
    private String name;

    @NotBlank(message = "Description is required")
    @Column(name = "role_description", nullable = false, length = 255)
    private String description;

    @Column(name = "role_privileges", length = 2000)
    private String privileges;

    @Column(name = "created_at")
    private LocalDate createdAt;

    @Column(name = "updated_at")
    private LocalDate lastUpdatedAt;

    @Column(name = "role_is_active")
    private Boolean isActive;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDate.now();
        this.lastUpdatedAt = LocalDate.now();
        if (this.isActive == null) {
            this.isActive = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.lastUpdatedAt = LocalDate.now();
    }
}
