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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("RoleMapper Test Suite - 100% Coverage")
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
        testRoleDTO.setPrivileges("READ_USER");
        testRoleDTO.setCreatedAt(LocalDate.now().minusDays(30));
        testRoleDTO.setLastUpdatedAt(LocalDate.now());

        // Initialize update DTO with valid privileges
        updateRequestDto = new RoleUpdateRequestDto();
        updateRequestDto.setName("Updated Admin");
        updateRequestDto.setDescription("Updated Administrator");
        updateRequestDto.setPrivileges("READ_USER,CREATE_USER");
        updateRequestDto.setDeletable(true);
    }

    // ==================== toDto() Tests ====================

    @Test
    @DisplayName("Should convert Role entity to DTO successfully with valid privileges")
    void toDto_Success() {
        when(privilegesConverter.convertToDatabaseColumn(any()))
                .thenReturn("READ_USER");

        RoleDTO result = roleMapper.toDto(testRole);

        assertNotNull(result);
        assertEquals(testRole.getCode(), result.getCode());
        assertEquals(testRole.getName(), result.getName());
        assertEquals(testRole.getDescription(), result.getDescription());
        assertEquals(testRole.isActive(), result.getIsActive());
        assertEquals(testRole.isDeletable(), result.getDeletable());
        assertEquals("READ_USER", result.getPrivileges());
        assertEquals(testRole.getCreatedAt(), result.getCreatedAt());
        assertEquals(testRole.getUpdatedAt(), result.getLastUpdatedAt());
    }

    @Test
    @DisplayName("Should handle null role in toDto")
    void toDto_NullRole() {
        RoleDTO result = roleMapper.toDto(null);
        assertNull(result);
    }

    @Test
    @DisplayName("Should handle role with null privileges in toDto")
    void toDto_NullPrivileges() {
        testRole.setPrivileges(null);
        when(privilegesConverter.convertToDatabaseColumn(null))
                .thenReturn(null);

        RoleDTO result = roleMapper.toDto(testRole);

        assertNotNull(result);
        assertNull(result.getPrivileges());
    }

    @Test
    @DisplayName("Should handle role with empty privileges in toDto")
    void toDto_EmptyPrivileges() {
        testRole.setPrivileges(EnumSet.noneOf(Privileges.class));
        when(privilegesConverter.convertToDatabaseColumn(any()))
                .thenReturn("");

        RoleDTO result = roleMapper.toDto(testRole);

        assertNotNull(result);
        assertEquals("", result.getPrivileges());
    }

    @Test
    @DisplayName("Should handle role with null dates in toDto")
    void toDto_NullDates() {
        testRole.setCreatedAt(null);
        testRole.setUpdatedAt(null);
        when(privilegesConverter.convertToDatabaseColumn(any()))
                .thenReturn("READ_USER");

        RoleDTO result = roleMapper.toDto(testRole);

        assertNotNull(result);
        assertNull(result.getCreatedAt());
        assertNull(result.getLastUpdatedAt());
    }

    @Test
    @DisplayName("Should handle PrivilegesConverter exception in toDto")
    void toDto_ConverterException() {
        when(privilegesConverter.convertToDatabaseColumn(any()))
                .thenThrow(new RuntimeException("Conversion failed"));

        assertThrows(RuntimeException.class, () -> roleMapper.toDto(testRole));
    }

    @Test
    @DisplayName("Should convert multiple privileges in toDto")
    void toDto_MultiplePrivileges() {
        testRole.setPrivileges(EnumSet.of(
                Privileges.VIEW_USER,
                Privileges.CREATE_USER,
                Privileges.DELETE_USER
        ));
        when(privilegesConverter.convertToDatabaseColumn(any()))
                .thenReturn("VIEW_USER,CREATE_USER,DELETE_USER");

        RoleDTO result = roleMapper.toDto(testRole);

        assertNotNull(result);
        assertEquals("VIEW_USER,CREATE_USER,DELETE_USER", result.getPrivileges());
    }

    // ==================== toEntity() Tests ====================

    @Test
    @DisplayName("Should convert RoleDTO to Role entity successfully with valid privileges")
    void toEntity_Success() {
        when(privilegesConverter.convertToEntityAttribute("READ_USER"))
                .thenReturn(EnumSet.of(Privileges.VIEW_USER));

        Role result = roleMapper.toEntity(testRoleDTO);

        assertNotNull(result);
        assertEquals(testRoleDTO.getCode(), result.getCode());
        assertEquals(testRoleDTO.getName(), result.getName());
        assertEquals(testRoleDTO.getDescription(), result.getDescription());
        assertEquals(testRoleDTO.getIsActive(), result.isActive());
        assertEquals(testRoleDTO.getDeletable(), result.isDeletable());
        assertEquals(EnumSet.of(Privileges.VIEW_USER), result.getPrivileges());
        assertEquals(testRoleDTO.getCreatedAt(), result.getCreatedAt());
        assertEquals(testRoleDTO.getLastUpdatedAt(), result.getUpdatedAt());
    }

    @Test
    @DisplayName("Should handle null DTO in toEntity")
    void toEntity_NullDto() {
        Role result = roleMapper.toEntity(null);
        assertNull(result);
    }

    @Test
    @DisplayName("Should handle DTO with null privileges in toEntity")
    void toEntity_NullPrivileges() {
        testRoleDTO.setPrivileges(null);
        when(privilegesConverter.convertToEntityAttribute(null))
                .thenReturn(null);

        Role result = roleMapper.toEntity(testRoleDTO);

        assertNotNull(result);
        assertNull(result.getPrivileges());
    }

    @Test
    @DisplayName("Should handle DTO with empty privileges in toEntity")
    void toEntity_EmptyPrivileges() {
        testRoleDTO.setPrivileges("");
        when(privilegesConverter.convertToEntityAttribute(""))
                .thenReturn(EnumSet.noneOf(Privileges.class));

        Role result = roleMapper.toEntity(testRoleDTO);

        assertNotNull(result);
        assertTrue(result.getPrivileges().isEmpty());
    }

    @Test
    @DisplayName("Should handle DTO with null dates in toEntity")
    void toEntity_NullDates() {
        testRoleDTO.setCreatedAt(null);
        testRoleDTO.setLastUpdatedAt(null);
        when(privilegesConverter.convertToEntityAttribute(any()))
                .thenReturn(EnumSet.of(Privileges.VIEW_USER));

        Role result = roleMapper.toEntity(testRoleDTO);

        assertNotNull(result);
        assertNull(result.getCreatedAt());
        assertNull(result.getUpdatedAt());
    }

    @Test
    @DisplayName("Should handle PrivilegesConverter exception in toEntity")
    void toEntity_ConverterException() {
        when(privilegesConverter.convertToEntityAttribute(any()))
                .thenThrow(new RuntimeException("Conversion failed"));

        assertThrows(RuntimeException.class, () -> roleMapper.toEntity(testRoleDTO));
    }

    @Test
    @DisplayName("Should convert multiple privileges in toEntity")
    void toEntity_MultiplePrivileges() {
        testRoleDTO.setPrivileges("VIEW_USER,CREATE_USER,DELETE_USER");
        when(privilegesConverter.convertToEntityAttribute(any()))
                .thenReturn(EnumSet.of(
                        Privileges.VIEW_USER,
                        Privileges.CREATE_USER,
                        Privileges.DELETE_USER
                ));

        Role result = roleMapper.toEntity(testRoleDTO);

        assertNotNull(result);
        assertEquals(3, result.getPrivileges().size());
    }

    // ==================== updateEntityFromDto() Tests ====================

    @Test
    @DisplayName("Should update entity from DTO successfully with valid privileges")
    void updateEntityFromDto_Success() {
        when(privilegesConverter.convertToEntityAttribute("READ_USER,CREATE_USER"))
                .thenReturn(EnumSet.of(Privileges.VIEW_USER, Privileges.CREATE_USER));

        Role result = roleMapper.updateEntityFromDto(updateRequestDto, testRole);

        assertNotNull(result);
        assertEquals(updateRequestDto.getName(), result.getName());
        assertEquals(updateRequestDto.getDescription(), result.getDescription());
        assertEquals(updateRequestDto.isDeletable(), result.isDeletable());
        assertEquals(LocalDate.now(), result.getUpdatedAt());
    }

    @Test
    @DisplayName("Should handle null DTO in updateEntityFromDto")
    void updateEntityFromDto_NullDto() {
        Role result = roleMapper.updateEntityFromDto(null, testRole);
        assertEquals(testRole, result);
    }

    @Test
    @DisplayName("Should handle null entity in updateEntityFromDto")
    void updateEntityFromDto_NullEntity() {
        Role result = roleMapper.updateEntityFromDto(updateRequestDto, null);
        assertNull(result);
    }

    @Test
    @DisplayName("Should handle null DTO and entity in updateEntityFromDto")
    void updateEntityFromDto_BothNull() {
        Role result = roleMapper.updateEntityFromDto(null, null);
        assertNull(result);
    }

    @Test
    @DisplayName("Should update entity and preserve code in updateEntityFromDto")
    void updateEntityFromDto_PreserveCode() {
        when(privilegesConverter.convertToEntityAttribute(any()))
                .thenReturn(EnumSet.of(Privileges.VIEW_USER));

        String originalCode = testRole.getCode();
        Role result = roleMapper.updateEntityFromDto(updateRequestDto, testRole);

        assertEquals(originalCode, result.getCode());
    }

    @Test
    @DisplayName("Should add READ_ONLY privilege when privileges are empty in updateEntityFromDto")
    void updateEntityFromDto_AddReadOnlyWhenEmpty() {
        when(privilegesConverter.convertToEntityAttribute(any()))
                .thenReturn(null);

        Role result = roleMapper.updateEntityFromDto(updateRequestDto, testRole);

        assertNotNull(result);
        assertTrue(result.getPrivileges().contains(Privileges.READ_ONLY));
    }

    @Test
    @DisplayName("Should handle PrivilegesConverter exception in updateEntityFromDto")
    void updateEntityFromDto_ConverterException() {
        when(privilegesConverter.convertToEntityAttribute(any()))
                .thenThrow(new RuntimeException("Conversion failed"));

        assertThrows(RuntimeException.class,
                () -> roleMapper.updateEntityFromDto(updateRequestDto, testRole));
    }

    @Test
    @DisplayName("Should update all fields in updateEntityFromDto")
    void updateEntityFromDto_UpdateAllFields() {
        when(privilegesConverter.convertToEntityAttribute(any()))
                .thenReturn(EnumSet.of(Privileges.VIEW_USER, Privileges.CREATE_USER));

        updateRequestDto.setDeletable(false);
        Role result = roleMapper.updateEntityFromDto(updateRequestDto, testRole);

        assertEquals(updateRequestDto.getName(), result.getName());
        assertEquals(updateRequestDto.getDescription(), result.getDescription());
        assertEquals(false, result.isDeletable());
        assertNotNull(result.getPrivileges());
    }

    // ==================== toDtoList() Tests ====================

    @Test
    @DisplayName("Should convert list of Role entities to DTOs successfully")
    void toDtoList_Success() {
        List<Role> roles = Arrays.asList(testRole, testRole);
        when(privilegesConverter.convertToDatabaseColumn(any()))
                .thenReturn("READ_USER");

        List<RoleDTO> results = roleMapper.toDtoList(roles);

        assertNotNull(results);
        assertEquals(2, results.size());
        assertEquals(testRole.getCode(), results.get(0).getCode());
        assertEquals(testRole.getName(), results.get(0).getName());
    }

    @Test
    @DisplayName("Should handle null list in toDtoList")
    void toDtoList_NullList() {
        List<RoleDTO> result = roleMapper.toDtoList(null);

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("Should handle empty list in toDtoList")
    void toDtoList_EmptyList() {
        List<RoleDTO> result = roleMapper.toDtoList(Collections.emptyList());

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("Should convert single item list in toDtoList")
    void toDtoList_SingleItem() {
        List<Role> roles = Collections.singletonList(testRole);
        when(privilegesConverter.convertToDatabaseColumn(any()))
                .thenReturn("READ_USER");

        List<RoleDTO> results = roleMapper.toDtoList(roles);

        assertEquals(1, results.size());
    }

    @Test
    @DisplayName("Should handle exception in toDtoList")
    void toDtoList_Exception() {
        List<Role> roles = Arrays.asList(testRole);
        when(privilegesConverter.convertToDatabaseColumn(any()))
                .thenThrow(new RuntimeException("Conversion failed"));

        assertThrows(RuntimeException.class, () -> roleMapper.toDtoList(roles));
    }

    // ==================== toEntityList() Tests ====================

    @Test
    @DisplayName("Should convert list of DTOs to Role entities successfully")
    void toEntityList_Success() {
        List<RoleDTO> roleDTOs = Arrays.asList(testRoleDTO, testRoleDTO);
        when(privilegesConverter.convertToEntityAttribute(any()))
                .thenReturn(EnumSet.of(Privileges.VIEW_USER));

        List<Role> results = roleMapper.toEntityList(roleDTOs);

        assertNotNull(results);
        assertEquals(2, results.size());
        assertEquals(testRoleDTO.getCode(), results.get(0).getCode());
    }

    @Test
    @DisplayName("Should handle null list in toEntityList")
    void toEntityList_NullList() {
        List<Role> result = roleMapper.toEntityList(null);

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("Should handle empty list in toEntityList")
    void toEntityList_EmptyList() {
        List<Role> result = roleMapper.toEntityList(Collections.emptyList());

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("Should convert single item list in toEntityList")
    void toEntityList_SingleItem() {
        List<RoleDTO> roleDTOs = Collections.singletonList(testRoleDTO);
        when(privilegesConverter.convertToEntityAttribute(any()))
                .thenReturn(EnumSet.of(Privileges.VIEW_USER));

        List<Role> results = roleMapper.toEntityList(roleDTOs);

        assertEquals(1, results.size());
    }

    @Test
    @DisplayName("Should handle exception in toEntityList")
    void toEntityList_Exception() {
        List<RoleDTO> roleDTOs = Arrays.asList(testRoleDTO);
        when(privilegesConverter.convertToEntityAttribute(any()))
                .thenThrow(new RuntimeException("Conversion failed"));

        assertThrows(RuntimeException.class, () -> roleMapper.toEntityList(roleDTOs));
    }

    // ==================== Edge Cases & Integration Tests ====================

    @Test
    @DisplayName("Should handle role with all privileges")
    void toDto_AllPrivileges() {
        testRole.setPrivileges(EnumSet.allOf(Privileges.class));
        when(privilegesConverter.convertToDatabaseColumn(any()))
                .thenReturn("ALL_PRIVILEGES");

        RoleDTO result = roleMapper.toDto(testRole);

        assertNotNull(result);
        assertNotNull(result.getPrivileges());
    }

    @Test
    @DisplayName("Should handle role with special characters in description")
    void toDto_SpecialCharactersInDescription() {
        testRole.setDescription("Role with special chars: !@#$%^&*()");
        when(privilegesConverter.convertToDatabaseColumn(any()))
                .thenReturn("READ_USER");

        RoleDTO result = roleMapper.toDto(testRole);

        assertEquals(testRole.getDescription(), result.getDescription());
    }

    @Test
    @DisplayName("Should handle inactive role")
    void toDto_InactiveRole() {
        testRole.setActive(false);
        when(privilegesConverter.convertToDatabaseColumn(any()))
                .thenReturn("READ_USER");

        RoleDTO result = roleMapper.toDto(testRole);

        assertFalse(result.getIsActive());
    }

    @Test
    @DisplayName("Should handle non-deletable role")
    void toDto_NonDeletableRole() {
        testRole.setDeletable(false);
        when(privilegesConverter.convertToDatabaseColumn(any()))
                .thenReturn("READ_USER");

        RoleDTO result = roleMapper.toDto(testRole);

        assertFalse(result.getDeletable());
    }

    @Test
    @DisplayName("Should verify converter is called with correct parameters in toDto")
    void toDto_VerifyConverterCall() {
        when(privilegesConverter.convertToDatabaseColumn(testRole.getPrivileges()))
                .thenReturn("READ_USER");

        roleMapper.toDto(testRole);

        verify(privilegesConverter, times(1)).convertToDatabaseColumn(testRole.getPrivileges());
    }

    @Test
    @DisplayName("Should verify converter is called with correct parameters in toEntity")
    void toEntity_VerifyConverterCall() {
        when(privilegesConverter.convertToEntityAttribute("READ_USER"))
                .thenReturn(EnumSet.of(Privileges.VIEW_USER));

        roleMapper.toEntity(testRoleDTO);

        verify(privilegesConverter, times(1)).convertToEntityAttribute("READ_USER");
    }
}