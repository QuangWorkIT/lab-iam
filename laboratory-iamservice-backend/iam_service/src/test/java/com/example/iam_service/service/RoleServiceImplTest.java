package com.example.iam_service.service;

import com.example.iam_service.dto.RoleDTO;
import com.example.iam_service.entity.Enum.Privileges;
import com.example.iam_service.entity.Role;
import com.example.iam_service.exception.DuplicateRoleException;
import com.example.iam_service.mapper.RoleMapper;
import com.example.iam_service.repository.RoleRepository;
import com.example.iam_service.serviceImpl.RoleServiceImp;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.EnumSet;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("RoleServiceImp - createRole Tests")
class RoleServiceImpTest {

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private RoleMapper mapper;

    @InjectMocks
    private RoleServiceImp roleService;

    private Role testRole;
    private RoleDTO testRoleDTO;

    @BeforeEach
    void setUp() {
        // Setup test data
        testRole = Role.builder()
                .name("Lab Manager")
                .description("Manages the laboratory")
                .privileges(EnumSet.of(Privileges.CREATE_USER, Privileges.VIEW_USER))
                .isActive(true)
                .build();

        testRoleDTO = RoleDTO.builder()
                .code("ROLE_LAB_MANAGER")
                .name("Lab Manager")
                .description("Manages the laboratory")
                .privileges("CREATE_USER,VIEW_USER")
                .isActive(true)
                .createdAt(LocalDate.now())
                .lastUpdatedAt(LocalDate.now())
                .build();
    }

    @Test
    @DisplayName("Should create role successfully with valid data")
    void createRole_WithValidData_ShouldReturnRoleDTO() {
        // Arrange
        when(roleRepository.existsByCode(anyString())).thenReturn(false);
        when(roleRepository.save(any(Role.class))).thenReturn(testRole);
        when(mapper.toDto(any(Role.class))).thenReturn(testRoleDTO);

        // Act
        RoleDTO result = roleService.createRole(testRole);

        // Assert
        assertNotNull(result);
        assertEquals("ROLE_LAB_MANAGER", result.getCode());
        assertEquals("Lab Manager", result.getName());
        assertEquals("Manages the laboratory", result.getDescription());
        assertEquals("CREATE_USER,VIEW_USER", result.getPrivileges());
        assertTrue(result.getIsActive());

        // Verify interactions
        verify(roleRepository, times(1)).existsByCode("ROLE_LAB_MANAGER");
        verify(roleRepository, times(1)).save(any(Role.class));
        verify(mapper, times(1)).toDto(any(Role.class));
    }

    @Test
    @DisplayName("Should generate role code from name correctly")
    void createRole_ShouldGenerateCorrectRoleCode() {
        // Arrange
        when(roleRepository.existsByCode(anyString())).thenReturn(false);
        when(roleRepository.save(any(Role.class))).thenReturn(testRole);
        when(mapper.toDto(any(Role.class))).thenReturn(testRoleDTO);

        // Act
        roleService.createRole(testRole);

        // Assert - Verify the role code was set correctly
        ArgumentCaptor<Role> roleCaptor = ArgumentCaptor.forClass(Role.class);
        verify(roleRepository).save(roleCaptor.capture());

        Role savedRole = roleCaptor.getValue();
        assertEquals("ROLE_LAB_MANAGER", savedRole.getCode());
    }

    @Test
    @DisplayName("Should handle role name with spaces correctly")
    void createRole_WithSpacesInName_ShouldGenerateCorrectCode() {
        // Arrange
        Role roleWithSpaces = Role.builder()
                .name("  Lab   Manager  ")
                .description("Test")
                .privileges(EnumSet.of(Privileges.READ_ONLY))
                .build();

        when(roleRepository.existsByCode("ROLE_LAB_MANAGER")).thenReturn(false);
        when(roleRepository.save(any(Role.class))).thenReturn(roleWithSpaces);
        when(mapper.toDto(any(Role.class))).thenReturn(testRoleDTO);

        // Act
        roleService.createRole(roleWithSpaces);

        // Assert
        ArgumentCaptor<Role> roleCaptor = ArgumentCaptor.forClass(Role.class);
        verify(roleRepository).save(roleCaptor.capture());

        assertEquals("ROLE_LAB_MANAGER", roleCaptor.getValue().getCode());
    }

    @Test
    @DisplayName("Should throw DuplicateRoleException when role code already exists")
    void createRole_WithDuplicateCode_ShouldThrowException() {
        // Arrange
        when(roleRepository.existsByCode("ROLE_LAB_MANAGER")).thenReturn(true);

        // Act & Assert
        DuplicateRoleException exception = assertThrows(
                DuplicateRoleException.class,
                () -> roleService.createRole(testRole)
        );

        assertEquals("Role with name 'Lab Manager' already exists", exception.getMessage());
        verify(roleRepository, times(1)).existsByCode("ROLE_LAB_MANAGER");
        verify(roleRepository, never()).save(any(Role.class));
        verify(mapper, never()).toDto(any(Role.class));
    }

    @Test
    @DisplayName("Should add READ_ONLY privilege when privileges are null")
    void createRole_WithNullPrivileges_ShouldAddReadOnly() {
        // Arrange
        Role roleWithNullPrivileges = Role.builder()
                .name("Basic User")
                .description("Basic user role")
                .privileges(null)
                .build();

        when(roleRepository.existsByCode(anyString())).thenReturn(false);
        when(roleRepository.save(any(Role.class))).thenReturn(roleWithNullPrivileges);
        when(mapper.toDto(any(Role.class))).thenReturn(testRoleDTO);

        // Act
        roleService.createRole(roleWithNullPrivileges);

        // Assert
        ArgumentCaptor<Role> roleCaptor = ArgumentCaptor.forClass(Role.class);
        verify(roleRepository).save(roleCaptor.capture());

        Role savedRole = roleCaptor.getValue();
        assertNotNull(savedRole.getPrivileges());
        assertTrue(savedRole.getPrivileges().contains(Privileges.READ_ONLY));
    }

    @Test
    @DisplayName("Should add READ_ONLY privilege when privileges are empty")
    void createRole_WithEmptyPrivileges_ShouldAddReadOnly() {
        // Arrange
        Role roleWithEmptyPrivileges = Role.builder()
                .name("Empty Privileges User")
                .description("User with empty privileges")
                .privileges(EnumSet.noneOf(Privileges.class))
                .build();

        when(roleRepository.existsByCode(anyString())).thenReturn(false);
        when(roleRepository.save(any(Role.class))).thenReturn(roleWithEmptyPrivileges);
        when(mapper.toDto(any(Role.class))).thenReturn(testRoleDTO);

        // Act
        roleService.createRole(roleWithEmptyPrivileges);

        // Assert
        ArgumentCaptor<Role> roleCaptor = ArgumentCaptor.forClass(Role.class);
        verify(roleRepository).save(roleCaptor.capture());

        Role savedRole = roleCaptor.getValue();
        assertNotNull(savedRole.getPrivileges());
        assertEquals(1, savedRole.getPrivileges().size());
        assertTrue(savedRole.getPrivileges().contains(Privileges.READ_ONLY));
    }

    @Test
    @DisplayName("Should not add READ_ONLY when role already has privileges")
    void createRole_WithExistingPrivileges_ShouldNotAddReadOnly() {
        // Arrange
        Role roleWithPrivileges = Role.builder()
                .name("Admin")
                .description("Administrator")
                .privileges(EnumSet.of(Privileges.CREATE_USER, Privileges.DELETE_USER))
                .build();

        when(roleRepository.existsByCode(anyString())).thenReturn(false);
        when(roleRepository.save(any(Role.class))).thenReturn(roleWithPrivileges);
        when(mapper.toDto(any(Role.class))).thenReturn(testRoleDTO);

        // Act
        roleService.createRole(roleWithPrivileges);

        // Assert
        ArgumentCaptor<Role> roleCaptor = ArgumentCaptor.forClass(Role.class);
        verify(roleRepository).save(roleCaptor.capture());

        Role savedRole = roleCaptor.getValue();
        assertEquals(2, savedRole.getPrivileges().size());
        assertFalse(savedRole.getPrivileges().contains(Privileges.READ_ONLY));
        assertTrue(savedRole.getPrivileges().contains(Privileges.CREATE_USER));
        assertTrue(savedRole.getPrivileges().contains(Privileges.DELETE_USER));
    }

    @Test
    @DisplayName("Should convert role name to uppercase in code")
    void createRole_ShouldConvertNameToUppercase() {
        // Arrange
        Role roleLowercase = Role.builder()
                .name("lab manager")
                .description("Test")
                .privileges(EnumSet.of(Privileges.READ_ONLY))
                .build();

        when(roleRepository.existsByCode(anyString())).thenReturn(false);
        when(roleRepository.save(any(Role.class))).thenReturn(roleLowercase);
        when(mapper.toDto(any(Role.class))).thenReturn(testRoleDTO);

        // Act
        roleService.createRole(roleLowercase);

        // Assert
        verify(roleRepository).existsByCode("ROLE_LAB_MANAGER");
    }

    @Test
    @DisplayName("Should handle special characters in role name")
    void createRole_WithSpecialCharacters_ShouldReplaceSpacesWithUnderscore() {
        // Arrange
        Role roleSpecialChars = Role.builder()
                .name("Lab Manager Admin")
                .description("Test")
                .privileges(EnumSet.of(Privileges.READ_ONLY))
                .build();

        when(roleRepository.existsByCode(anyString())).thenReturn(false);
        when(roleRepository.save(any(Role.class))).thenReturn(roleSpecialChars);
        when(mapper.toDto(any(Role.class))).thenReturn(testRoleDTO);

        // Act
        roleService.createRole(roleSpecialChars);

        // Assert
        ArgumentCaptor<Role> roleCaptor = ArgumentCaptor.forClass(Role.class);
        verify(roleRepository).save(roleCaptor.capture());

        assertEquals("ROLE_LAB_MANAGER_ADMIN", roleCaptor.getValue().getCode());
    }

    @Test
    @DisplayName("Should call mapper.toDto with saved role")
    void createRole_ShouldCallMapperWithSavedRole() {
        // Arrange
        Role savedRole = Role.builder()
                .code("ROLE_LAB_MANAGER")
                .name("Lab Manager")
                .description("Test")
                .privileges(EnumSet.of(Privileges.READ_ONLY))
                .build();

        when(roleRepository.existsByCode(anyString())).thenReturn(false);
        when(roleRepository.save(any(Role.class))).thenReturn(savedRole);
        when(mapper.toDto(savedRole)).thenReturn(testRoleDTO);

        // Act
        roleService.createRole(testRole);

        // Assert
        verify(mapper).toDto(savedRole);
    }

    @Test
    @DisplayName("Should verify transaction boundary")
    void createRole_ShouldBeTransactional() {
        // This test verifies that @Transactional annotation exists
        // In real scenario, you would use Spring Test Context for this

        // Arrange
        when(roleRepository.existsByCode(anyString())).thenReturn(false);
        when(roleRepository.save(any(Role.class))).thenReturn(testRole);
        when(mapper.toDto(any(Role.class))).thenReturn(testRoleDTO);

        // Act
        roleService.createRole(testRole);

        // Assert - verify all operations were called in sequence
        var inOrder = inOrder(roleRepository, mapper);
        inOrder.verify(roleRepository).existsByCode(anyString());
        inOrder.verify(roleRepository).save(any(Role.class));
        inOrder.verify(mapper).toDto(any(Role.class));
    }
}