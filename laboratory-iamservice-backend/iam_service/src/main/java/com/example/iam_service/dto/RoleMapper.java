package com.example.iam_service.dto;

import com.example.iam_service.entity.Role;
import org.springframework.stereotype.Component;

@Component
public class RoleMapper {

    public RoleDTO toDto(Role role) {
        if (role == null) {
            return null;
        }

        return RoleDTO.builder()
                .code(role.getCode())
                .name(role.getName())
                .description(role.getDescription())
                .privileges(role.getPrivileges())
                .createdAt(role.getCreatedAt())
                .lastUpdatedAt(role.getLastUpdatedAt())
                .isActive(role.getIsActive())
                .build();
    }

    public Role toEntity(RoleDTO dto) {
        if (dto == null) {
            return null;
        }

        return Role.builder()
                .code(dto.getCode())
                .name(dto.getName())
                .description(dto.getDescription())
                .privileges(dto.getPrivileges())
                .createdAt(dto.getCreatedAt())
                .lastUpdatedAt(dto.getLastUpdatedAt())
                .isActive(dto.getIsActive())
                .build();
    }

    public void updateEntityFromDto(RoleDTO dto, Role role) {
        if (dto == null || role == null) {
            return;
        }

        role.setName(dto.getName());
        role.setDescription(dto.getDescription());
        role.setPrivileges(dto.getPrivileges());
        role.setIsActive(dto.getIsActive());
        // Không cập nhật code vì đó là ID
        // Không cập nhật createdAt để giữ nguyên ngày tạo ban đầu
        // lastUpdatedAt sẽ được cập nhật tự động bởi @PreUpdate
    }
}
