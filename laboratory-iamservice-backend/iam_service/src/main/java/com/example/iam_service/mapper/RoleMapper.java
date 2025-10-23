package com.example.iam_service.mapper;

import com.example.iam_service.dto.RoleDTO;
import com.example.iam_service.entity.Role;
import com.example.iam_service.util.PrivilegesConverter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
public class RoleMapper {

    @Autowired
    private PrivilegesConverter privilegesConverter;

    public RoleDTO toDto(Role role) {
        log.info("Converting role: {}", role.getCode());

        try {
            if (role == null) {
                log.warn("Role is null!");
                return null;
            }

            log.debug("Role privileges: {}", role.getPrivileges());

            String privilegesString = privilegesConverter.convertToDatabaseColumn(role.getPrivileges());
            log.debug("Converted privileges: {}", privilegesString);

            RoleDTO dto = RoleDTO.builder()
                    .code(role.getCode())
                    .name(role.getName())
                    .description(role.getDescription())
                    .privileges(privilegesString)
                    .createdAt(role.getCreatedAt())
                    .lastUpdatedAt(role.getUpdatedAt())
                    .isActive(role.isActive())
                    .build();

            log.info("Successfully converted role: {}", dto.getCode());
            return dto;

        } catch (Exception e) {
            log.error("ERROR converting role {}: {}", role.getCode(), e.getMessage(), e);
            return null; // or throw exception
        }
    }

    public Role toEntity(RoleDTO dto) {
        if (dto == null) {
            return null;
        }

        return Role.builder()
                .code(dto.getCode())
                .name(dto.getName())
                .description(dto.getDescription())
                .privileges(privilegesConverter.convertToEntityAttribute(dto.getPrivileges()))
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getLastUpdatedAt())
                .isActive(dto.getIsActive())
                .build();
    }

    public void updateEntityFromDto(RoleDTO dto, Role role) {
        if (dto == null || role == null) {
            return;
        }

        role.setName(dto.getName());
        role.setDescription(dto.getDescription());
        role.setPrivileges(privilegesConverter.convertToEntityAttribute(dto.getPrivileges()));
        role.setActive(dto.getIsActive());
        // Không cập nhật code vì đó là ID
        // Không cập nhật createdAt để giữ nguyên ngày tạo ban đầu
        // lastUpdatedAt sẽ được cập nhật tự động bởi @PreUpdate
    }

    public List<RoleDTO> toDtoList(List<Role> roleList)
    {
        log.info("Role list: " + roleList);
        if (roleList == null || roleList.isEmpty()) {
            return Collections.emptyList();
        }
        log.info("Role DTO list: " +  roleList.stream().map(this::toDto).collect(Collectors.toList()));
        return  roleList.stream().map(this::toDto).collect(Collectors.toList());
    }
    public List<Role> toEntityList(List<RoleDTO> dtoList)
    {
        if (dtoList == null || dtoList.isEmpty()) {
            return Collections.emptyList();
        }
        return  dtoList.stream().map(this::toEntity).collect(Collectors.toList());
    }
}
