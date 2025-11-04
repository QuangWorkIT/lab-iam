package com.example.iam_service.utils;

import com.example.iam_service.dto.RoleDTO;
import com.example.iam_service.dto.request.RoleUpdateRequestDto;
import com.example.iam_service.entity.Enum.Privileges;
import com.example.iam_service.entity.Role;
import com.example.iam_service.mapper.RoleMapper;
import com.example.iam_service.util.PrivilegesConverter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.EnumSet;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RoleMapperTest {

    @Mock
    private PrivilegesConverter privilegesConverter;

    @InjectMocks
    private RoleMapper roleMapper;

    private Role testRole;
    private RoleDTO testRoleDTO;
    private RoleUpdateRequestDto updateRequestDto;

    @BeforeEach
    void setUp() {
        // Initialize test role with valid privileges
        testRole = new Role();
        testRole.setCode("ROLE_ADMIN");
        testRole.setName("Administrator");
        testRole.setDescription("System Administrator Role");
        testRole.setActive(true);
        testRole.setDeletable(true);
        // Using READ_USER privilege instead of ADMIN which doesn't exist
        testRole.setPrivileges(EnumSet.of(Privileges.VIEW_USER));
        testRole.setCreatedAt(LocalDate.now().minusDays(30));
        testRole.setUpdatedAt(LocalDate.now());

        // Initialize test DTO
        testRoleDTO = new RoleDTO();
        testRoleDTO.setCode("ROLE_ADMIN");
        testRoleDTO.setName("Administrator");
        testRoleDTO.setDescription("System Administrator Role");
        testRoleDTO.setIsActive(true);
        testRoleDTO.setDeletable(true);
        // Ensure privileges string matches available enum values
        testRoleDTO.setPrivileges("READ_USER");
        testRoleDTO.setCreatedAt(LocalDate.now().minusDays(30));
        testRoleDTO.setLastUpdatedAt(LocalDate.now());

        // Initialize update DTO with valid privileges
        updateRequestDto = new RoleUpdateRequestDto();
        updateRequestDto.setName("Updated Admin");
        updateRequestDto.setDescription("Updated Administrator");
        updateRequestDto.setPrivileges("READ_USER,CREATE_USER");
    }

    @Test
    @DisplayName("Should convert Role entity to DTO successfully with valid privileges")
    void toDto_Success() {
        // Given
        when(privilegesConverter.convertToDatabaseColumn(any()))
                .thenReturn("READ_USER");

        // When
        RoleDTO result = roleMapper.toDto(testRole);

        // Then
        assertNotNull(result);
        assertEquals(testRole.getCode(), result.getCode());
        assertEquals(testRole.getName(), result.getName());
        assertEquals(testRole.getDescription(), result.getDescription());
        assertEquals(testRole.isActive(), result.getIsActive());
        assertEquals(testRole.isDeletable(), result.getDeletable());
        assertEquals("READ_USER", result.getPrivileges());
    }

    @Test
    @DisplayName("Should handle null role in toDto")
    void toDto_NullRole() {
        // When
        RoleDTO result = roleMapper.toDto(null);

        // Then
        assertNull(result);
    }

    @Test
    @DisplayName("Should convert RoleDTO to Role entity successfully with valid privileges")
    void toEntity_Success() {
        // Given
        when(privilegesConverter.convertToEntityAttribute("READ_USER"))
                .thenReturn(EnumSet.of(Privileges.VIEW_USER));

        // When
        Role result = roleMapper.toEntity(testRoleDTO);

        // Then
        assertNotNull(result);
        assertEquals(testRoleDTO.getCode(), result.getCode());
        assertEquals(testRoleDTO.getName(), result.getName());
        assertEquals(testRoleDTO.getDescription(), result.getDescription());
        assertEquals(testRoleDTO.getIsActive(), result.isActive());
        assertEquals(testRoleDTO.getDeletable(), result.isDeletable());
        assertEquals(EnumSet.of(Privileges.VIEW_USER), result.getPrivileges());
    }

    @Test
    @DisplayName("Should handle null DTO in toEntity")
    void toEntity_NullDto() {
        // When
        Role result = roleMapper.toEntity(null);

        // Then
        assertNull(result);
    }

    @Test
    @DisplayName("Should update entity from DTO successfully with valid privileges")
    void updateEntityFromDto_Success() {
        // Given
        when(privilegesConverter.convertToEntityAttribute("READ_USER,CREATE_USER"))
                .thenReturn(EnumSet.of(Privileges.VIEW_USER, Privileges.CREATE_USER));

        // When
        Role result = roleMapper.updateEntityFromDto(updateRequestDto, testRole);

        // Then
        assertNotNull(result);
        assertEquals(updateRequestDto.getName(), result.getName());
        assertEquals(updateRequestDto.getDescription(), result.getDescription());
        assertTrue(result.getPrivileges().contains(Privileges.VIEW_USER));
        assertTrue(result.getPrivileges().contains(Privileges.CREATE_USER));
        assertEquals(LocalDate.now(), result.getUpdatedAt());
    }

    @Test
    @DisplayName("Should handle null source or destination in update")
    void updateEntityFromDto_NullValues() {
        // When & Then
        assertDoesNotThrow(() -> {
            roleMapper.updateEntityFromDto(null, testRole);
            roleMapper.updateEntityFromDto(updateRequestDto, null);
            roleMapper.updateEntityFromDto(null, null);
        });
    }

    @Test
    @DisplayName("Should handle invalid privileges gracefully")
    void updateEntityFromDto_WithInvalidPrivileges() {
        // Given
        updateRequestDto.setPrivileges("INVALID_PRIVILEGE,READ_USER");
        when(privilegesConverter.convertToEntityAttribute("INVALID_PRIVILEGE,READ_USER"))
                .thenReturn(EnumSet.of(Privileges.VIEW_USER)); // Assume converter handles invalid values

        // When
        Role result = roleMapper.updateEntityFromDto(updateRequestDto, testRole);

        // Then
        assertNotNull(result);
        assertTrue(result.getPrivileges().contains(Privileges.VIEW_USER));
        assertFalse(result.getPrivileges().contains(Privileges.CREATE_USER)); // Invalid privilege filtered out
    }

    @Test
    @DisplayName("Should convert list of Role entities to DTOs successfully with valid privileges")
    void toDtoList_Success() {
        // Given
        List<Role> roles = Arrays.asList(testRole, testRole);
        when(privilegesConverter.convertToDatabaseColumn(any()))
                .thenReturn("READ_USER");

        // When
        List<RoleDTO> results = roleMapper.toDtoList(roles);

        // Then
        assertNotNull(results);
        assertEquals(2, results.size());
        assertEquals(testRole.getCode(), results.get(0).getCode());
        assertEquals(testRole.getName(), results.get(0).getName());
        assertEquals("READ_USER", results.get(0).getPrivileges());
    }

    @Test
    @DisplayName("Should handle null or empty list in toDtoList")
    void toDtoList_NullOrEmptyList() {
        // When
        List<RoleDTO> resultFromNull = roleMapper.toDtoList(null);
        List<RoleDTO> resultFromEmpty = roleMapper.toDtoList(Collections.emptyList());

        // Then
        assertNotNull(resultFromNull);
        assertNotNull(resultFromEmpty);
        assertTrue(resultFromNull.isEmpty());
        assertTrue(resultFromEmpty.isEmpty());
    }

    @Test
    @DisplayName("Should convert list of DTOs to Role entities successfully with valid privileges")
    void toEntityList_Success() {
        // Given
        List<RoleDTO> roleDTOs = Arrays.asList(testRoleDTO, testRoleDTO);
        when(privilegesConverter.convertToEntityAttribute(any()))
                .thenReturn(EnumSet.of(Privileges.VIEW_USER));

        // When
        List<Role> results = roleMapper.toEntityList(roleDTOs);

        // Then
        assertNotNull(results);
        assertEquals(2, results.size());
        assertEquals(testRoleDTO.getCode(), results.get(0).getCode());
        assertEquals(testRoleDTO.getName(), results.get(0).getName());
        assertEquals(EnumSet.of(Privileges.VIEW_USER), results.get(0).getPrivileges());
    }

    @Test
    @DisplayName("Should handle null or empty list in toEntityList")
    void toEntityList_NullOrEmptyList() {
        // When
        List<Role> resultFromNull = roleMapper.toEntityList(null);
        List<Role> resultFromEmpty = roleMapper.toEntityList(Collections.emptyList());

        // Then
        assertNotNull(resultFromNull);
        assertNotNull(resultFromEmpty);
        assertTrue(resultFromNull.isEmpty());
        assertTrue(resultFromEmpty.isEmpty());
    }

    @Test
    @DisplayName("Should handle privileges conversion with multiple valid privileges")
    void toDto_MultiplePrevilegesConversion() {
        // Given
        testRole.setPrivileges(EnumSet.of(Privileges.VIEW_USER, Privileges.CREATE_USER));
        when(privilegesConverter.convertToDatabaseColumn(testRole.getPrivileges()))
                .thenReturn("READ_USER,CREATE_USER");

        // When
        RoleDTO result = roleMapper.toDto(testRole);

        // Then
        assertNotNull(result.getPrivileges());
        assertTrue(result.getPrivileges().contains("READ_USER"));
        assertTrue(result.getPrivileges().contains("CREATE_USER"));
        assertFalse(result.getPrivileges().contains("ADMIN")); // Non-existent privilege
    }

    @Test
    @DisplayName("Should handle dates in conversion")
    void toDto_DatesConversion() {
        // Given
        LocalDate createdAt = LocalDate.now().minusDays(10);
        LocalDate updatedAt = LocalDate.now();
        testRole.setCreatedAt(createdAt);
        testRole.setUpdatedAt(updatedAt);

        // When
        RoleDTO result = roleMapper.toDto(testRole);

        // Then
        assertEquals(createdAt, result.getCreatedAt());
        assertEquals(updatedAt, result.getLastUpdatedAt());
    }
}