package com.example.iam_service.mapper;

import com.example.iam_service.dto.RoleDTO;
import com.example.iam_service.dto.request.RoleUpdateRequestDto;
import com.example.iam_service.entity.Enum.Privileges;
import com.example.iam_service.entity.Role;
import com.example.iam_service.util.PrivilegesConverter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
public class RoleMapper {

    @Autowired
    private PrivilegesConverter privilegesConverter;

    public RoleDTO toDto(Role role) {
        if (role == null) {
            log.warn("Attempting to convert null role to DTO");
            return null;
        }

        try {
            log.info("Converting role entity to DTO: {}", role.getCode());

            String privilegesString = privilegesConverter.convertToDatabaseColumn(role.getPrivileges());
            log.debug("Role {} privileges converted to: {}", role.getCode(), privilegesString);

            RoleDTO dto = RoleDTO.builder()
                    .code(role.getCode())
                    .name(role.getName())
                    .description(role.getDescription())
                    .privileges(privilegesString)
                    .createdAt(role.getCreatedAt())
                    .lastUpdatedAt(role.getUpdatedAt())
                    .deletable(role.isDeletable())
                    .isActive(role.isActive())
                    .build();

            log.info("Successfully converted role to DTO: {}", dto.getCode());
            return dto;

        } catch (Exception e) {
            log.error("Error converting role {} to DTO: {}", role.getCode(), e.getMessage(), e);
            throw new RuntimeException("Failed to convert role to DTO", e);
        }
    }

    public Role toEntity(RoleDTO dto) {
        if (dto == null) {
            log.warn("Attempting to convert null DTO to role entity");
            return null;
        }

        try {
            log.info("Converting role DTO to entity: {}", dto.getCode());

            Role role = Role.builder()
                    .code(dto.getCode())
                    .name(dto.getName())
                    .description(dto.getDescription())
                    .privileges(privilegesConverter.convertToEntityAttribute(dto.getPrivileges()))
                    .createdAt(dto.getCreatedAt())
                    .updatedAt(dto.getLastUpdatedAt())
                    .deletable(dto.getDeletable())
                    .isActive(dto.getIsActive())
                    .build();

            log.info("Successfully converted DTO to role entity: {}", role.getCode());
            return role;

        } catch (Exception e) {
            log.error("Error converting DTO {} to role entity: {}", dto.getCode(), e.getMessage(), e);
            throw new RuntimeException("Failed to convert DTO to role entity", e);
        }
    }


    public Role updateEntityFromDto(RoleUpdateRequestDto dto, Role role) {
        if (dto == null || role == null) {
            log.warn("Attempting to update role with null DTO or entity");
            return role;
        }

        try {
            log.info("Starting role update mapping for role: {}", role.getCode());

            role.setName(dto.getName());
            role.setDescription(dto.getDescription());
            role.setPrivileges(privilegesConverter.convertToEntityAttribute(dto.getPrivileges()));

            if (role.getPrivileges() == null || role.getPrivileges().isEmpty()) {
                log.warn("Role {} privileges are empty, adding READ_ONLY privilege", role.getCode());
                role.addPrivilege(Privileges.READ_ONLY);
            }

            role.setUpdatedAt(LocalDate.now());
            log.info("Successfully updated role: {}", role.getCode());

            return role;

        } catch (Exception e) {
            log.error("Error updating role {}: {}", role.getCode(), e.getMessage(), e);
            throw new RuntimeException("Failed to update role from DTO", e);
        }
    }

    public List<RoleDTO> toDtoList(List<Role> roleList) {
        if (roleList == null || roleList.isEmpty()) {
            log.debug("Role list is null or empty, returning empty list");
            return Collections.emptyList();
        }

        try {
            log.info("Converting {} roles to DTOs", roleList.size());
            List<RoleDTO> dtoList = roleList.stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());

            log.info("Successfully converted {} roles to DTOs", dtoList.size());
            return dtoList;

        } catch (Exception e) {
            log.error("Error converting role list to DTOs: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to convert role list to DTOs", e);
        }
    }

    public List<Role> toEntityList(List<RoleDTO> dtoList) {
        if (dtoList == null || dtoList.isEmpty()) {
            log.debug("DTO list is null or empty, returning empty list");
            return Collections.emptyList();
        }

        try {
            log.info("Converting {} DTOs to role entities", dtoList.size());
            List<Role> roleList = dtoList.stream()
                    .map(this::toEntity)
                    .collect(Collectors.toList());

            log.info("Successfully converted {} DTOs to role entities", roleList.size());
            return roleList;

        } catch (Exception e) {
            log.error("Error converting DTO list to roles: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to convert DTO list to roles", e);
        }
    }
}