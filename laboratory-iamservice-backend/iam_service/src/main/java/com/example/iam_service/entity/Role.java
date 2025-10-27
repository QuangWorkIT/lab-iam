package com.example.iam_service.entity;

import com.example.iam_service.entity.Enum.Privileges;
import com.example.iam_service.util.PrivilegesConverter;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.EnumSet;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "\"Role\"")
@Entity
@Schema(description = "Role entity representing system roles and their privileges")
public class Role {

    @Id
    @Column(name = "role_code", unique = true)
    @Schema(description = "Unique role code identifier", example = "ROLE_ADMIN", required = true)
    private String code;

    @Pattern(regexp = "^[a-zA-Z0-9_]*$")
    @NotBlank(message = "Role name is required")
    @Column(name = "role_name", nullable = false,  unique = true)
    @Schema(description = "Human-readable role name", example = "Administrator", required = true)
    private String name;

    @Column(name = "role_privileges", length = 2000, nullable = false)
    @Convert(converter = PrivilegesConverter.class)
    @Schema(description = "Set of privileges assigned to this role",
            example = "[READ_USER, WRITE_USER, DELETE_USER]",
            required = true)
    private EnumSet<Privileges> privileges;

    @NotBlank(message = "Description is required")
    @Column(name = "role_description", nullable = false, unique = true)
    @Schema(description = "Detailed description of the role's purpose",
            example = "Full system administrator with all privileges",
            required = true)
    private String description;

    @Builder.Default
    @Column(name = "role_is_active", nullable = false, columnDefinition = "boolean default true")
    @Schema(description = "Indicates whether the role is currently active",
            example = "true",
            defaultValue = "true")
    private boolean isActive = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    @Schema(description = "Date when the role was created",
            example = "2024-01-15",
            accessMode = Schema.AccessMode.READ_ONLY)
    private LocalDate createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    @Schema(description = "Date when the role was last updated",
            example = "2024-10-21",
            accessMode = Schema.AccessMode.READ_ONLY)
    private LocalDate updatedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDate.now();
        this.updatedAt = LocalDate.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDate.now();
    }

    // Privilege management methods
    @Transient
    @Schema(hidden = true)
    public boolean hasPrivilege(Privileges privilege) {
        return privileges != null && privileges.contains(privilege);
    }

    @Transient
    @Schema(hidden = true)
    public boolean hasAllPrivileges(Privileges... privilegeEnum) {
        return this.privileges != null && !this.privileges.isEmpty()
                && this.privileges.containsAll(Arrays.asList(privilegeEnum));
    }

    @Transient
    @Schema(hidden = true)
    public boolean hasAnyPrivilege(Privileges...privilegeEnum) {
        return this.privileges != null && !this.privileges.isEmpty()
                && Arrays.stream(privilegeEnum).anyMatch(this.privileges::contains);
    }

    @Schema(hidden = true)
    public void addPrivilege(Privileges privilege) {
        if (this.privileges == null) {
            this.privileges = EnumSet.of(privilege);
        } else {
            this.privileges.add(privilege);
        }
    }

    @Schema(hidden = true)
    public void addPrivileges(Privileges... privilegeEnum) {
        if (this.privileges == null) {
            this.privileges = EnumSet.copyOf(Arrays.asList(privilegeEnum));
        } else {
            this.privileges.addAll(Arrays.asList(privilegeEnum));
        }
    }

    @Schema(hidden = true)
    public void removePrivileges(Privileges... privileges) {
        if (this.privileges != null) {
            this.privileges.removeAll(Arrays.asList(privileges));
        }
    }

    @Schema(hidden = true)
    public void clearPrivileges() {
        if (this.privileges != null) {
            this.privileges.clear();
        }
    }
}