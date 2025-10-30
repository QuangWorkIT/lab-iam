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
        log.info("Converting role: {}", role.getCode());

        try {
            if (role == null) {
                log.warn("Role is null!");
                return null;
            }

            log.debug("Role privileges: {}", role.getPrivileges());
            RoleDTO dto = RoleDTO.builder()
                    .code(role.getCode())
                    .name(role.getName())
                    .description(role.getDescription())
                    .privileges(privilegesConverter.convertToDatabaseColumn(role.getPrivileges()))
                    .createdAt(role.getCreatedAt())
                    .lastUpdatedAt(role.getUpdatedAt())
                    .deletable(role.isDeletable())
                    .isActive(role.isActive())
                    .build();
            log.debug("Converted privileges: {}", privilegesConverter.convertToDatabaseColumn(role.getPrivileges()));

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
                .deletable(dto.getDeletable())
                .isActive(dto.getIsActive())
                .build();
    }

    //This method will take RoleUpdateRequest which only permits user to update any other fields but name or roleCode
    public Role updateEntityFromDto(RoleUpdateRequestDto dto, Role role) {
        log.info("Begin role update mapping with role: {}", role.getName());
        role.setName(dto.getName());
        role.setDescription(dto.getDescription());
        role.setPrivileges(privilegesConverter.convertToEntityAttribute(dto.getPrivileges()));
        if(role.getPrivileges().isEmpty())
        {
            log.warn("Role privileges set empty adding READ_ONLY.");
            role.addPrivilege(Privileges.READ_ONLY);
        }
        role.setUpdatedAt(LocalDate.now());
        log.info("Finish role mapping with role: {}", role.getName());
        return role;
    }

    public List<RoleDTO> toDtoList(List<Role> roleList)
    {
        log.info("Role list: {}", roleList);
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
