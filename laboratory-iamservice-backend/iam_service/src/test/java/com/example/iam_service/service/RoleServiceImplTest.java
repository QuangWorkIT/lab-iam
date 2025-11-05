package com.example.iam_service.service;

import com.example.iam_service.dto.RoleDTO;
import com.example.iam_service.dto.request.RoleUpdateRequestDto;
import com.example.iam_service.entity.Enum.Privileges;
import com.example.iam_service.entity.Role;
import com.example.iam_service.exception.DuplicateRoleException;
import com.example.iam_service.exception.RoleNotFoundException;
import com.example.iam_service.exception.RoleDeletionException;
import com.example.iam_service.exception.RoleIsFixedException;
import com.example.iam_service.mapper.RoleMapper;
import com.example.iam_service.repository.RoleRepository;
import com.example.iam_service.repository.UserRepository;
import com.example.iam_service.serviceImpl.RoleServiceImp;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Role Service Implementation Tests")
public class RoleServiceImplTest {

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleMapper mapper;

    @Mock
    private EntityManager entityManager;

    @InjectMocks
    private RoleServiceImp roleService;

    private Role testRole;
    private RoleDTO testRoleDTO;
    private RoleUpdateRequestDto updateRequestDto;

    @BeforeEach
    void setUp() {
        testRole = new Role();
        testRole.setCode("ROLE_ADMIN");
        testRole.setName("Admin");
        testRole.setDescription("Administrator role");
        testRole.setActive(true);
        testRole.setDeletable(true);
        testRole.setPrivileges(EnumSet.of(Privileges.READ_ONLY));

        testRoleDTO = new RoleDTO();
        testRoleDTO.setCode("ROLE_ADMIN");
        testRoleDTO.setName("Admin");
        testRoleDTO.setDescription("Administrator role");
        testRoleDTO.setIsActive(true);
        testRoleDTO.setDeletable(true);
        testRoleDTO.setPrivileges("READ_ONLY");

        updateRequestDto = new RoleUpdateRequestDto();
        updateRequestDto.setName("Updated Admin");
        updateRequestDto.setDescription("Updated role description");
        updateRequestDto.setPrivileges("ADMIN,MANAGER");
    }

    @Test
    @DisplayName("Should get all roles successfully")
    void getAllRoles_Success() {
        // Given
        when(roleRepository.findAll()).thenReturn(List.of(testRole));

        // When
        List<Role> result = roleService.getAllRoles();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(testRole);
        verify(roleRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should get roles with pagination successfully")
    void getRolesPaged_Success() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Role> rolePage = new PageImpl<>(List.of(testRole));
        when(roleRepository.findAll(pageable)).thenReturn(rolePage);

        // When
        Page<Role> result = roleService.getRolesPaged(pageable);

        // Then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0)).isEqualTo(testRole);
        verify(roleRepository, times(1)).findAll(pageable);
    }

    @Test
    @DisplayName("Should get role by code successfully")
    void getRoleByCode_Success() {
        // Given
        when(roleRepository.findById("ROLE_ADMIN")).thenReturn(Optional.of(testRole));

        // When
        Optional<Role> result = roleService.getRoleByCode("ROLE_ADMIN");

        // Then
        assertTrue(result.isPresent());
        assertThat(result.get()).isEqualTo(testRole);
        verify(roleRepository, times(1)).findById("ROLE_ADMIN");
    }

    @Test
    @DisplayName("Should return empty optional when role code not found")
    void getRoleByCode_NotFound() {
        // Given
        when(roleRepository.findById("ROLE_NOT_FOUND")).thenReturn(Optional.empty());

        // When
        Optional<Role> result = roleService.getRoleByCode("ROLE_NOT_FOUND");

        // Then
        assertFalse(result.isPresent());
        verify(roleRepository, times(1)).findById("ROLE_NOT_FOUND");
    }

    @Test
    @DisplayName("Should search roles by name successfully")
    void searchRolesByName_Success() {
        // Given
        String searchName = "Admin";
        when(roleRepository.findByNameContainingIgnoreCase(searchName))
                .thenReturn(List.of(testRole));

        // When
        List<Role> result = roleService.searchRolesByName(searchName);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).contains(searchName);
        verify(roleRepository, times(1)).findByNameContainingIgnoreCase(searchName);
    }

    @Test
    @DisplayName("Should search roles with criteria successfully")
    void searchRoles_WithCriteria_Success() {
        // Given
        String keyword = "admin";
        LocalDate fromDate = LocalDate.now().minusMonths(1);
        LocalDate toDate = LocalDate.now();
        String sortBy = "name";
        Sort.Direction direction = Sort.Direction.ASC;

        when(roleRepository.findAll(any(Specification.class), any(Sort.class)))
                .thenReturn(List.of(testRole));

        // When
        List<Role> result = roleService.searchRoles(keyword, fromDate, toDate, sortBy, direction);

        // Then
        assertThat(result).hasSize(1);
        verify(roleRepository, times(1)).findAll(any(Specification.class), any(Sort.class));
    }

    @Test
    @DisplayName("Should get active roles successfully")
    void getActiveRoles_Success() {
        // Given
        when(roleRepository.findByIsActiveTrue()).thenReturn(List.of(testRole));

        // When
        List<Role> result = roleService.getActiveRoles();

        // Then
        assertThat(result).hasSize(1);
        assertTrue(result.get(0).isActive());
        verify(roleRepository, times(1)).findByIsActiveTrue();
    }

    @Test
    @DisplayName("Should check if role code exists successfully")
    void isRoleCodeExists_Success() {
        // Given
        String roleCode = "ROLE_ADMIN";
        when(roleRepository.existsByCode(roleCode)).thenReturn(true);

        // When
        boolean result = roleService.isRoleCodeExists(roleCode);

        // Then
        assertTrue(result);
        verify(roleRepository, times(1)).existsByCode(roleCode);
    }

    @Test
    @DisplayName("Should create role successfully")
    void createRole_Success() {
        // Given
        Role roleToCreate = new Role();
        roleToCreate.setName("New Role");
        roleToCreate.setDescription("New role description");

        when(roleRepository.existsByCode(anyString())).thenReturn(false);
        when(roleRepository.save(any(Role.class))).thenReturn(testRole);
        when(mapper.toDto(any(Role.class))).thenReturn(testRoleDTO);

        // When
        RoleDTO result = roleService.createRole(roleToCreate);

        // Then
        assertNotNull(result);
        verify(roleRepository, times(1)).existsByCode(anyString());
        verify(roleRepository, times(1)).save(any(Role.class));
        verify(mapper, times(1)).toDto(any(Role.class));
    }

    @Test
    @DisplayName("Should throw DuplicateRoleException when creating duplicate role")
    void createRole_DuplicateRole_ThrowsException() {
        // Given
        Role roleToCreate = new Role();
        roleToCreate.setName("Existing Role");

        when(roleRepository.existsByCode(anyString())).thenReturn(true);

        // When & Then
        assertThrows(DuplicateRoleException.class, () ->
                roleService.createRole(roleToCreate)
        );
        verify(roleRepository, times(1)).existsByCode(anyString());
        verify(roleRepository, never()).save(any(Role.class));
        verify(mapper, never()).toDto(any(Role.class));
    }

    @Test
    @DisplayName("Should update role successfully")
    void updateRole_Success() {
        // Given
        String roleCode = "ROLE_ADMIN";
        when(roleRepository.existsByCode(roleCode)).thenReturn(true);
        when(roleRepository.findById(roleCode)).thenReturn(Optional.of(testRole));
        when(roleRepository.save(any(Role.class))).thenReturn(testRole);
        when(mapper.updateEntityFromDto(updateRequestDto, testRole)).thenReturn(testRole);
        when(mapper.toDto(testRole)).thenReturn(testRoleDTO);

        // When
        RoleDTO result = roleService.updateRole(updateRequestDto, roleCode);

        // Then
        assertNotNull(result);
        verify(roleRepository, times(1)).existsByCode(roleCode);
        verify(roleRepository, times(1)).findById(roleCode);
        verify(roleRepository, times(1)).save(testRole);
        verify(mapper, times(1)).updateEntityFromDto(updateRequestDto, testRole);
        verify(mapper, times(1)).toDto(testRole);
    }

    @Test
    @DisplayName("Should throw RoleNotFoundException when updating non-existent role")
    void updateRole_NonExistentRole_ThrowsException() {
        // Given
        String roleCode = "NON_EXISTENT";
        when(roleRepository.existsByCode(roleCode)).thenReturn(false);

        // When & Then
        assertThrows(RoleNotFoundException.class, () ->
                roleService.updateRole(updateRequestDto, roleCode)
        );
        verify(roleRepository, times(1)).existsByCode(roleCode);
        verify(roleRepository, never()).save(any(Role.class));
        verify(mapper, never()).updateEntityFromDto(any(), any());
        verify(mapper, never()).toDto(any());
    }

    @Test
    @DisplayName("Should delete role successfully")
    void deleteRole_Success() {
        // Given
        String roleCode = "ROLE_ADMIN";

        // Set role as deletable
        testRole.setDeletable(true);

        when(roleRepository.existsByCode(roleCode)).thenReturn(true);
        when(roleRepository.findById(roleCode)).thenReturn(Optional.of(testRole));
        when(userRepository.batchUpdateUser(anyString(), anyString())).thenReturn(10);
        doNothing().when(entityManager).flush();
        doNothing().when(entityManager).clear();
        doNothing().when(roleRepository).delete(testRole);

        // When
        roleService.DeleteRole(roleCode);

        // Then
        verify(roleRepository, times(2)).existsByCode(roleCode);
        verify(roleRepository, times(1)).findById(roleCode);
        verify(userRepository, times(1)).batchUpdateUser(anyString(), anyString());
        verify(roleRepository, times(1)).delete(testRole);
        verify(entityManager, times(1)).flush();
        verify(entityManager, times(1)).clear();
    }

    @Test
    @DisplayName("Should throw RoleNotFoundException when deleting non-existent role")
    void deleteRole_NonExistentRole_ThrowsException() {
        // Given
        String roleCode = "NON_EXISTENT";
        when(roleRepository.existsByCode(roleCode)).thenReturn(false);

        // When & Then
        assertThrows(RoleNotFoundException.class, () ->
                roleService.DeleteRole(roleCode)
        );
        verify(roleRepository, times(1)).existsByCode(roleCode);
        verify(roleRepository, never()).delete(any(Role.class));
    }

    @Test
    @DisplayName("Should throw RoleIsFixedException when deleting non-deletable role")
    void deleteRole_NonDeletableRole_ThrowsException() {
        // Given
        String roleCode = "ROLE_ADMIN";

        // Set role as non-deletable
        testRole.setDeletable(false);

        when(roleRepository.existsByCode(roleCode)).thenReturn(true);
        when(roleRepository.findById(roleCode)).thenReturn(Optional.of(testRole));

        // When & Then
        assertThrows(RoleIsFixedException.class, () ->
                roleService.DeleteRole(roleCode)
        );
        verify(roleRepository, times(1)).existsByCode(roleCode);
        verify(roleRepository, times(1)).findById(roleCode);
        verify(roleRepository, never()).delete(any(Role.class));
        verify(userRepository, never()).batchUpdateUser(anyString(), anyString());
    }

    @Test
    @DisplayName("Should throw RoleDeletionException when batch update fails")
    void deleteRole_BatchUpdateFails_ThrowsException() {
        // Given
        String roleCode = "ROLE_ADMIN";

        // Set role as deletable
        testRole.setDeletable(true);

        when(roleRepository.existsByCode(roleCode)).thenReturn(true);
        when(roleRepository.findById(roleCode)).thenReturn(Optional.of(testRole));
        when(userRepository.batchUpdateUser(anyString(), anyString()))
                .thenThrow(new RuntimeException("Database error"));
        doNothing().when(entityManager).flush();
        doNothing().when(entityManager).clear();

        // When & Then
        assertThrows(RoleDeletionException.class, () ->
                roleService.DeleteRole(roleCode)
        );
        verify(roleRepository, times(1)).existsByCode(roleCode);
        verify(roleRepository, times(1)).findById(roleCode);
        verify(userRepository, times(1)).batchUpdateUser(anyString(), anyString());
        verify(entityManager, times(1)).flush();
        verify(entityManager, times(1)).clear();
        verify(roleRepository, never()).delete(testRole);
    }

    @Test
    @DisplayName("Should throw RoleDeletionException when role deletion fails")
    void deleteRole_DeletionFails_ThrowsException() {
        // Given
        String roleCode = "ROLE_ADMIN";

        // Set role as deletable
        testRole.setDeletable(true);

        when(roleRepository.existsByCode(roleCode))
                .thenReturn(true)  // First call for existence check
                .thenReturn(true); // Second call after deletion should fail
        when(roleRepository.findById(roleCode)).thenReturn(Optional.of(testRole));
        when(userRepository.batchUpdateUser(anyString(), anyString())).thenReturn(10);
        doNothing().when(entityManager).flush();
        doNothing().when(entityManager).clear();
        doNothing().when(roleRepository).delete(testRole);

        // When & Then
        assertThrows(RoleDeletionException.class, () ->
                roleService.DeleteRole(roleCode)
        );
        verify(roleRepository, times(2)).existsByCode(roleCode);
        verify(roleRepository, times(1)).findById(roleCode);
        verify(roleRepository, times(1)).delete(testRole);
        verify(userRepository, times(1)).batchUpdateUser(anyString(), anyString());
        verify(entityManager, times(1)).flush();
        verify(entityManager, times(1)).clear();
    }


}