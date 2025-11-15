package com.example.iam_service.service;

import com.example.iam_service.audit.AuditEvent;
import com.example.iam_service.audit.AuditPublisher;
import com.example.iam_service.dto.RoleDTO;
import com.example.iam_service.dto.request.RoleUpdateRequestDto;
import com.example.iam_service.entity.Enum.Privileges;
import com.example.iam_service.entity.Role;
import com.example.iam_service.entity.User;
import com.example.iam_service.exception.DuplicateRoleException;
import com.example.iam_service.exception.RoleNotFoundException;
import com.example.iam_service.exception.RoleDeletionException;
import com.example.iam_service.exception.RoleIsFixedException;
import com.example.iam_service.mapper.RoleMapper;
import com.example.iam_service.repository.RoleRepository;
import com.example.iam_service.repository.UserRepository;
import com.example.iam_service.serviceImpl.RoleServiceImp;
import com.example.iam_service.util.SecurityUtil;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Role Service Implementation Tests - 100% Coverage")
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

    @Mock
    private AuditPublisher auditPublisher;

    @Mock
    private SecurityUtil securityUtil;

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
        testRole.setCreatedAt(LocalDate.now());

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
        updateRequestDto.setDeletable(true);
    }

    // ==================== GET ALL ROLES TESTS ====================

    @Nested
    @DisplayName("Get All Roles Tests")
    class GetAllRolesTests {

        @Test
        @DisplayName("Should get all roles successfully")
        void getAllRoles_Success() {
            when(roleRepository.findAll()).thenReturn(List.of(testRole));

            List<Role> result = roleService.getAllRoles();

            assertThat(result).hasSize(1);
            assertThat(result.get(0)).isEqualTo(testRole);
            verify(roleRepository, times(1)).findAll();
        }

        @Test
        @DisplayName("Should return empty list when no roles exist")
        void getAllRoles_EmptyList() {
            when(roleRepository.findAll()).thenReturn(Collections.emptyList());

            List<Role> result = roleService.getAllRoles();

            assertThat(result).isEmpty();
            verify(roleRepository, times(1)).findAll();
        }

        @Test
        @DisplayName("Should get multiple roles")
        void getAllRoles_MultipleRoles() {
            Role role2 = new Role();
            role2.setCode("ROLE_USER");
            role2.setName("User");

            when(roleRepository.findAll()).thenReturn(List.of(testRole, role2));

            List<Role> result = roleService.getAllRoles();

            assertThat(result).hasSize(2);
            assertThat(result).containsExactly(testRole, role2);
        }
    }

    // ==================== GET PAGED ROLES TESTS ====================

    @Nested
    @DisplayName("Get Paged Roles Tests")
    class GetPagedRolesTests {

        @Test
        @DisplayName("Should get roles with pagination successfully")
        void getRolesPaged_Success() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<Role> rolePage = new PageImpl<>(List.of(testRole));
            when(roleRepository.findAll(pageable)).thenReturn(rolePage);

            Page<Role> result = roleService.getRolesPaged(pageable);

            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getTotalElements()).isEqualTo(1);
            verify(roleRepository, times(1)).findAll(pageable);
        }

        @Test
        @DisplayName("Should return empty page when no roles")
        void getRolesPaged_EmptyPage() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<Role> emptyPage = new PageImpl<>(Collections.emptyList());
            when(roleRepository.findAll(pageable)).thenReturn(emptyPage);

            Page<Role> result = roleService.getRolesPaged(pageable);

            assertThat(result.getContent()).isEmpty();
        }

        @Test
        @DisplayName("Should handle different page numbers")
        void getRolesPaged_MultiplePages() {
            Pageable pageable = PageRequest.of(2, 10);
            Page<Role> page = new PageImpl<>(List.of(testRole), pageable, 100);
            when(roleRepository.findAll(pageable)).thenReturn(page);

            Page<Role> result = roleService.getRolesPaged(pageable);

            assertThat(result.getNumber()).isEqualTo(2);
            assertThat(result.getTotalPages()).isEqualTo(10);
        }
    }

    // ==================== GET ROLE BY CODE TESTS ====================

    @Nested
    @DisplayName("Get Role By Code Tests")
    class GetRoleByCodeTests {

        @Test
        @DisplayName("Should get role by code successfully")
        void getRoleByCode_Success() {
            when(roleRepository.findById("ROLE_ADMIN")).thenReturn(Optional.of(testRole));

            Optional<Role> result = roleService.getRoleByCode("ROLE_ADMIN");

            assertTrue(result.isPresent());
            assertThat(result.get()).isEqualTo(testRole);
            verify(roleRepository, times(1)).findById("ROLE_ADMIN");
        }

        @Test
        @DisplayName("Should return empty optional when role code not found")
        void getRoleByCode_NotFound() {
            when(roleRepository.findById("NON_EXISTENT")).thenReturn(Optional.empty());

            Optional<Role> result = roleService.getRoleByCode("NON_EXISTENT");

            assertFalse(result.isPresent());
            verify(roleRepository, times(1)).findById("NON_EXISTENT");
        }
    }

    // ==================== SEARCH ROLES BY NAME TESTS ====================

    @Nested
    @DisplayName("Search Roles By Name Tests")
    class SearchRolesByNameTests {

        @Test
        @DisplayName("Should search roles by name successfully")
        void searchRolesByName_Success() {
            String searchName = "Admin";
            when(roleRepository.findByNameContainingIgnoreCase(searchName))
                    .thenReturn(List.of(testRole));

            List<Role> result = roleService.searchRolesByName(searchName);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getName()).contains(searchName);
            verify(roleRepository, times(1)).findByNameContainingIgnoreCase(searchName);
        }

        @Test
        @DisplayName("Should return empty list when no matching roles")
        void searchRolesByName_NoMatch() {
            when(roleRepository.findByNameContainingIgnoreCase("NonExistent"))
                    .thenReturn(Collections.emptyList());

            List<Role> result = roleService.searchRolesByName("NonExistent");

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("Should search case insensitive")
        void searchRolesByName_CaseInsensitive() {
            when(roleRepository.findByNameContainingIgnoreCase("admin"))
                    .thenReturn(List.of(testRole));

            List<Role> result = roleService.searchRolesByName("admin");

            assertThat(result).hasSize(1);
        }
    }

    // ==================== SEARCH ROLES WITH CRITERIA TESTS ====================

    @Nested
    @DisplayName("Search Roles With Criteria Tests")
    class SearchRolesWithCriteriaTests {

        @Test
        @DisplayName("Should search roles with all criteria successfully")
        void searchRoles_WithAllCriteria_Success() {
            String keyword = "admin";
            LocalDate fromDate = LocalDate.now().minusMonths(1);
            LocalDate toDate = LocalDate.now();
            String sortBy = "name";
            Sort.Direction direction = Sort.Direction.ASC;

            when(roleRepository.findAll(any(Specification.class), any(Sort.class)))
                    .thenReturn(List.of(testRole));

            List<Role> result = roleService.searchRoles(keyword, fromDate, toDate, sortBy, direction);

            assertThat(result).hasSize(1);
            verify(roleRepository, times(1)).findAll(any(Specification.class), any(Sort.class));
        }

        @Test
        @DisplayName("Should search with null keyword")
        void searchRoles_NullKeyword() {
            when(roleRepository.findAll(any(Specification.class), any(Sort.class)))
                    .thenReturn(List.of(testRole));

            List<Role> result = roleService.searchRoles(null, null, null, "name", Sort.Direction.ASC);

            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("Should search with blank keyword")
        void searchRoles_BlankKeyword() {
            when(roleRepository.findAll(any(Specification.class), any(Sort.class)))
                    .thenReturn(List.of(testRole));

            List<Role> result = roleService.searchRoles("   ", null, null, "name", Sort.Direction.ASC);

            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("Should search with date range only")
        void searchRoles_DateRangeOnly() {
            LocalDate fromDate = LocalDate.now().minusMonths(1);
            LocalDate toDate = LocalDate.now();

            when(roleRepository.findAll(any(Specification.class), any(Sort.class)))
                    .thenReturn(List.of(testRole));

            List<Role> result = roleService.searchRoles(null, fromDate, toDate, "code", Sort.Direction.DESC);

            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("Should default sort parameters when null")
        void searchRoles_DefaultSortParams() {
            when(roleRepository.findAll(any(Specification.class), any(Sort.class)))
                    .thenReturn(List.of(testRole));

            List<Role> result = roleService.searchRoles("test", null, null, null, null);

            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("Should handle blank sort by parameter")
        void searchRoles_BlankSortBy() {
            when(roleRepository.findAll(any(Specification.class), any(Sort.class)))
                    .thenReturn(List.of(testRole));

            List<Role> result = roleService.searchRoles("test", null, null, "   ", Sort.Direction.ASC);

            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("Should search with descending direction")
        void searchRoles_DescendingDirection() {
            when(roleRepository.findAll(any(Specification.class), any(Sort.class)))
                    .thenReturn(List.of(testRole));

            List<Role> result = roleService.searchRoles("test", null, null, "code", Sort.Direction.DESC);

            assertThat(result).hasSize(1);
        }
    }

    // ==================== SEARCH ROLES (3 PARAMS) TESTS ====================

    @Nested
    @DisplayName("Search Roles (3 Parameters) Tests")
    class SearchRoles3ParamsTests {

        @Test
        @DisplayName("Should search with 3 parameters (overloaded method)")
        void searchRoles_3Params_Success() {
            when(roleRepository.findAll(any(Specification.class), any(Sort.class)))
                    .thenReturn(List.of(testRole));

            List<Role> result = roleService.searchRoles("admin", LocalDate.now().minusDays(30), LocalDate.now());

            assertThat(result).hasSize(1);
            verify(roleRepository, times(1)).findAll(any(Specification.class), any(Sort.class));
        }
    }

    // ==================== GET ACTIVE ROLES TESTS ====================

    @Nested
    @DisplayName("Get Active Roles Tests")
    class GetActiveRolesTests {

        @Test
        @DisplayName("Should get active roles successfully")
        void getActiveRoles_Success() {
            when(roleRepository.findByIsActiveTrue()).thenReturn(List.of(testRole));

            List<Role> result = roleService.getActiveRoles();

            assertThat(result).hasSize(1);
            assertTrue(result.get(0).isActive());
            verify(roleRepository, times(1)).findByIsActiveTrue();
        }

        @Test
        @DisplayName("Should return empty list when no active roles")
        void getActiveRoles_NoActiveRoles() {
            when(roleRepository.findByIsActiveTrue()).thenReturn(Collections.emptyList());

            List<Role> result = roleService.getActiveRoles();

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("Should exclude inactive roles")
        void getActiveRoles_ExcludeInactive() {
            Role inactiveRole = new Role();
            inactiveRole.setActive(false);

            when(roleRepository.findByIsActiveTrue()).thenReturn(List.of(testRole));

            List<Role> result = roleService.getActiveRoles();

            assertThat(result).doesNotContain(inactiveRole);
        }
    }

    // ==================== CHECK ROLE CODE EXISTS TESTS ====================

    @Nested
    @DisplayName("Check Role Code Exists Tests")
    class CheckRoleCodeExistsTests {

        @Test
        @DisplayName("Should return true when role code exists")
        void isRoleCodeExists_True() {
            when(roleRepository.existsByCode("ROLE_ADMIN")).thenReturn(true);

            boolean result = roleService.isRoleCodeExists("ROLE_ADMIN");

            assertTrue(result);
            verify(roleRepository, times(1)).existsByCode("ROLE_ADMIN");
        }

        @Test
        @DisplayName("Should return false when role code does not exist")
        void isRoleCodeExists_False() {
            when(roleRepository.existsByCode("NON_EXISTENT")).thenReturn(false);

            boolean result = roleService.isRoleCodeExists("NON_EXISTENT");

            assertFalse(result);
        }
    }

    // ==================== CREATE ROLE TESTS ====================

    @Nested
    @DisplayName("Create Role Tests")
    class CreateRoleTests {

        @Test
        @DisplayName("Should create role successfully")
        void createRole_Success() {
            Role roleToCreate = new Role();
            roleToCreate.setName("New Role");
            roleToCreate.setDescription("New role description");
            roleToCreate.setPrivileges(EnumSet.of(Privileges.VIEW_ROLE));
            User mockUser = new User();
            mockUser.setUserId(UUID.fromString("123e4567-e89b-12d3-a456-426614174000"));
            mockUser.setRoleCode("ROLE_ADMIN");

            when(securityUtil.getCurrentUser()).thenReturn(mockUser);

            when(roleRepository.existsByCode(anyString())).thenReturn(false);
            when(roleRepository.save(any(Role.class))).thenReturn(testRole);
            when(mapper.toDto(any(Role.class))).thenReturn(testRoleDTO);

            RoleDTO result = roleService.createRole(roleToCreate);

            assertNotNull(result);
            verify(roleRepository, times(1)).existsByCode(anyString());
            verify(roleRepository, times(1)).save(any(Role.class));
            verify(mapper, times(1)).toDto(any(Role.class));
        }

        @Test
        @DisplayName("Should throw DuplicateRoleException when creating duplicate role")
        void createRole_DuplicateRole_ThrowsException() {
            Role roleToCreate = new Role();
            roleToCreate.setName("Existing Role");

            when(roleRepository.existsByCode(anyString())).thenReturn(true);

            assertThrows(DuplicateRoleException.class, () ->
                    roleService.createRole(roleToCreate)
            );
            verify(roleRepository, times(1)).existsByCode(anyString());
            verify(roleRepository, never()).save(any(Role.class));
        }

        @Test
        @DisplayName("Should generate correct role code from name")
        void createRole_GenerateRoleCode() {
            Role roleToCreate = new Role();
            roleToCreate.setName("My Test Role");
            roleToCreate.setPrivileges(EnumSet.of(Privileges.VIEW_ROLE));

            User mockUser = new User();
            mockUser.setUserId(UUID.fromString("123e4567-e89b-12d3-a456-426614174000"));
            mockUser.setRoleCode("ROLE_ADMIN");

            when(securityUtil.getCurrentUser()).thenReturn(mockUser);

            when(roleRepository.existsByCode(anyString())).thenReturn(false);
            when(roleRepository.save(any(Role.class))).thenReturn(testRole);
            when(mapper.toDto(any(Role.class))).thenReturn(testRoleDTO);

            roleService.createRole(roleToCreate);

            ArgumentCaptor<Role> captor = ArgumentCaptor.forClass(Role.class);
            verify(roleRepository).save(captor.capture());
            assertThat(captor.getValue().getCode()).contains("ROLE_MY_TEST_ROLE");
        }

        @Test
        @DisplayName("Should add READ_ONLY privilege when null")
        void createRole_AddReadOnlyWhenNull() {
            Role roleToCreate = new Role();
            roleToCreate.setName("Test Role");
            roleToCreate.setPrivileges(null);
            User mockUser = new User();
            mockUser.setUserId(UUID.fromString("123e4567-e89b-12d3-a456-426614174000"));
            mockUser.setRoleCode("ROLE_ADMIN");

            when(securityUtil.getCurrentUser()).thenReturn(mockUser);

            when(roleRepository.existsByCode(anyString())).thenReturn(false);
            when(roleRepository.save(any(Role.class))).thenReturn(testRole);
            when(mapper.toDto(any(Role.class))).thenReturn(testRoleDTO);

            roleService.createRole(roleToCreate);

            verify(roleRepository, times(1)).save(any(Role.class));
        }

        @Test
        @DisplayName("Should add READ_ONLY privilege when empty")
        void createRole_AddReadOnlyWhenEmpty() {
            Role roleToCreate = new Role();
            roleToCreate.setName("Test Role");
            roleToCreate.setPrivileges(EnumSet.noneOf(Privileges.class));
            User mockUser = new User();
            mockUser.setUserId(UUID.fromString("123e4567-e89b-12d3-a456-426614174000"));
            mockUser.setRoleCode("ROLE_ADMIN");

            when(securityUtil.getCurrentUser()).thenReturn(mockUser);

            when(roleRepository.existsByCode(anyString())).thenReturn(false);
            when(roleRepository.save(any(Role.class))).thenReturn(testRole);
            when(mapper.toDto(any(Role.class))).thenReturn(testRoleDTO);

            roleService.createRole(roleToCreate);

            verify(roleRepository, times(1)).save(any(Role.class));
        }
    }

    // ==================== UPDATE ROLE TESTS ====================

    @Nested
    @DisplayName("Update Role Tests")
    class UpdateRoleTests {

        @Test
        @DisplayName("Should update role successfully")
        void updateRole_Success() {
            String roleCode = "ROLE_ADMIN";
            User mockUser = new User();
            mockUser.setUserId(UUID.fromString("123e4567-e89b-12d3-a456-426614174000"));
            mockUser.setRoleCode("ROLE_ADMIN");

            when(securityUtil.getCurrentUser()).thenReturn(mockUser);
            when(roleRepository.existsByCode(roleCode)).thenReturn(true);
            when(roleRepository.findById(roleCode)).thenReturn(Optional.of(testRole));
            when(roleRepository.save(any(Role.class))).thenReturn(testRole);
            when(mapper.updateEntityFromDto(updateRequestDto, testRole)).thenReturn(testRole);
            when(mapper.toDto(testRole)).thenReturn(testRoleDTO);

            RoleDTO result = roleService.updateRole(updateRequestDto, roleCode);

            assertNotNull(result);
            verify(roleRepository, times(1)).existsByCode(roleCode);
            verify(roleRepository, times(1)).findById(roleCode);
            verify(roleRepository, times(1)).save(testRole);
        }

        @Test
        @DisplayName("Should throw RoleNotFoundException when updating non-existent role")
        void updateRole_NonExistentRole_ThrowsException() {
            String roleCode = "NON_EXISTENT";
            when(roleRepository.existsByCode(roleCode)).thenReturn(false);

            assertThrows(RoleNotFoundException.class, () ->
                    roleService.updateRole(updateRequestDto, roleCode)
            );
            verify(roleRepository, times(1)).existsByCode(roleCode);
            verify(roleRepository, never()).save(any(Role.class));
        }

        @Test
        @DisplayName("Should use mapper for update mapping")
        void updateRole_UseMapper() {
            String roleCode = "ROLE_ADMIN";
            User mockUser = new User();
            mockUser.setUserId(UUID.fromString("123e4567-e89b-12d3-a456-426614174000"));
            mockUser.setRoleCode("ROLE_ADMIN");

            when(securityUtil.getCurrentUser()).thenReturn(mockUser);
            when(roleRepository.existsByCode(roleCode)).thenReturn(true);
            when(roleRepository.findById(roleCode)).thenReturn(Optional.of(testRole));
            when(roleRepository.save(any(Role.class))).thenReturn(testRole);
            when(mapper.updateEntityFromDto(updateRequestDto, testRole)).thenReturn(testRole);
            when(mapper.toDto(testRole)).thenReturn(testRoleDTO);

            roleService.updateRole(updateRequestDto, roleCode);

            verify(mapper, times(1)).updateEntityFromDto(updateRequestDto, testRole);
        }
    }

    // ==================== DELETE ROLE TESTS ====================

    @Nested
    @DisplayName("Delete Role Tests")
    class DeleteRoleTests {

        @Test
        @DisplayName("Should delete role successfully")
        void deleteRole_Success() {
            String roleCode = "ROLE_ADMIN";
            testRole.setDeletable(true);

            User mockUser = new User();
            mockUser.setUserId(UUID.fromString("123e4567-e89b-12d3-a456-426614174000"));
            mockUser.setRoleCode("ROLE_ADMIN");

            when(securityUtil.getCurrentUser()).thenReturn(mockUser);

            when(roleRepository.existsByCode(roleCode)).thenReturn(true);
            when(roleRepository.findById(roleCode)).thenReturn(Optional.of(testRole));
            when(userRepository.batchUpdateUser(anyString(), anyString())).thenReturn(10);
            doNothing().when(entityManager).flush();
            doNothing().when(entityManager).clear();
            doNothing().when(roleRepository).delete(testRole);

            roleService.DeleteRole(roleCode);

            verify(roleRepository, times(1)).existsByCode(roleCode);
            verify(userRepository, times(1)).batchUpdateUser("ROLE_DEFAULT", roleCode);
            verify(roleRepository, times(1)).delete(testRole);
            verify(entityManager, times(1)).flush();
            verify(entityManager, times(1)).clear();
        }

        @Test
        @DisplayName("Should throw RoleNotFoundException when deleting non-existent role")
        void deleteRole_NonExistentRole_ThrowsException() {
            String roleCode = "NON_EXISTENT";
            when(roleRepository.existsByCode(roleCode)).thenReturn(false);

            assertThrows(RoleNotFoundException.class, () ->
                    roleService.DeleteRole(roleCode)
            );
            verify(roleRepository, times(1)).existsByCode(roleCode);
            verify(roleRepository, never()).delete(any(Role.class));
        }

        @Test
        @DisplayName("Should throw RoleIsFixedException when deleting non-deletable role")
        void deleteRole_NonDeletableRole_ThrowsException() {
            String roleCode = "ROLE_ADMIN";
            testRole.setDeletable(false);

            when(roleRepository.existsByCode(roleCode)).thenReturn(true);
            when(roleRepository.findById(roleCode)).thenReturn(Optional.of(testRole));

            assertThrows(RoleIsFixedException.class, () ->
                    roleService.DeleteRole(roleCode)
            );
            verify(roleRepository, times(1)).existsByCode(roleCode);
            verify(roleRepository, never()).delete(any(Role.class));
            verify(userRepository, never()).batchUpdateUser(anyString(), anyString());
        }

        @Test
        @DisplayName("Should batch update users with ROLE_DEFAULT")
        void deleteRole_BatchUpdateUsers() {
            String roleCode = "ROLE_ADMIN";

            User mockUser = new User();
            mockUser.setUserId(UUID.fromString("123e4567-e89b-12d3-a456-426614174000"));
            mockUser.setRoleCode("ROLE_ADMIN");

            when(securityUtil.getCurrentUser()).thenReturn(mockUser);
            testRole.setDeletable(true);

            when(roleRepository.existsByCode(roleCode)).thenReturn(true);
            when(roleRepository.findById(roleCode)).thenReturn(Optional.of(testRole));
            when(userRepository.batchUpdateUser("ROLE_DEFAULT", roleCode)).thenReturn(5);
            doNothing().when(entityManager).flush();
            doNothing().when(entityManager).clear();
            doNothing().when(roleRepository).delete(testRole);

            roleService.DeleteRole(roleCode);

            verify(userRepository, times(1)).batchUpdateUser("ROLE_DEFAULT", roleCode);
        }

        @Test
        @DisplayName("Should handle zero users updated")
        void deleteRole_NoUsersUpdated() {
            String roleCode = "ROLE_ADMIN";
            User mockUser = new User();
            mockUser.setUserId(UUID.fromString("123e4567-e89b-12d3-a456-426614174000"));
            mockUser.setRoleCode("ROLE_ADMIN");

            when(securityUtil.getCurrentUser()).thenReturn(mockUser);
            testRole.setDeletable(true);

            when(roleRepository.existsByCode(roleCode)).thenReturn(true);
            when(roleRepository.findById(roleCode)).thenReturn(Optional.of(testRole));
            when(userRepository.batchUpdateUser(anyString(), anyString())).thenReturn(0);
            doNothing().when(entityManager).flush();
            doNothing().when(entityManager).clear();
            doNothing().when(roleRepository).delete(testRole);

            roleService.DeleteRole(roleCode);

            verify(roleRepository, times(1)).delete(testRole);
        }
    }
    @Test
    @DisplayName("Should publish ROLE_CREATED audit event when a new role is created")
    void createRole_ShouldPublishAuditEvent() {
        // Arrange
        Role role = new Role();
        role.setName("Test Role");
        role.setPrivileges(EnumSet.of(Privileges.READ_ONLY));

        User mockUser = new User();
        mockUser.setUserId(UUID.fromString("123e4567-e89b-12d3-a456-426614174000"));
        mockUser.setRoleCode("ROLE_ADMIN");

        when(securityUtil.getCurrentUser()).thenReturn(mockUser);
        when(roleRepository.existsByCode(anyString())).thenReturn(false);
        when(roleRepository.save(any(Role.class))).thenReturn(role);
        when(mapper.toDto(any(Role.class))).thenReturn(new RoleDTO());

        // Act
        roleService.createRole(role);

        // Assert
        ArgumentCaptor<AuditEvent> captor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditPublisher, times(1)).publish(captor.capture());

        AuditEvent event = captor.getValue();
        assertEquals("ROLE_CREATED", event.getType());
        assertEquals("123e4567-e89b-12d3-a456-426614174000 (ROLE_ADMIN)", event.getUserId());
        assertEquals("none", event.getTargetRole());
        assertTrue(event.getDetails().contains("created"));
    }

    @Test
    @DisplayName("Should publish ROLE_UPDATED audit event when role is updated")
    void updateRole_ShouldPublishAuditEvent() {
        // Arrange
        String roleCode = "ROLE_TEST";
        RoleUpdateRequestDto dto = new RoleUpdateRequestDto();
        dto.setName("Updated Role");

        User mockUser = new User();
        mockUser.setUserId(UUID.fromString("123e4567-e89b-12d3-a456-426614174000"));
        mockUser.setRoleCode("ROLE_ADMIN");

        Role existingRole = new Role();
        existingRole.setCode(roleCode);
        existingRole.setPrivileges(EnumSet.of(Privileges.READ_ONLY));
        existingRole.setDeletable(true);

        Role updatedRole = new Role();
        updatedRole.setCode(roleCode);
        updatedRole.setPrivileges(EnumSet.of(Privileges.UPDATE_ROLE));

        when(securityUtil.getCurrentUser()).thenReturn(mockUser);
        when(roleRepository.existsByCode(roleCode)).thenReturn(true);
        when(roleRepository.findById(roleCode)).thenReturn(Optional.of(existingRole));
        when(mapper.updateEntityFromDto(dto, existingRole)).thenReturn(updatedRole);
        when(roleRepository.save(any(Role.class))).thenReturn(updatedRole);
        when(mapper.toDto(any(Role.class))).thenReturn(new RoleDTO());

        // Act
        roleService.updateRole(dto, roleCode);

        // Assert
        ArgumentCaptor<AuditEvent> captor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditPublisher, times(1)).publish(captor.capture());

        AuditEvent event = captor.getValue();
        assertEquals("ROLE_UPDATED", event.getType());
        assertEquals("123e4567-e89b-12d3-a456-426614174000 (ROLE_ADMIN)", event.getUserId());
        assertEquals(roleCode, event.getTarget());
        assertTrue(event.getDetails().contains("updated"));
    }

    @Test
    @DisplayName("Should publish ROLE_DELETED audit event when role is deleted")
    void deleteRole_ShouldPublishAuditEvent() {
        // Arrange
        String roleCode = "ROLE_DELETE";
        User mockUser = new User();
        mockUser.setUserId(UUID.fromString("123e4567-e89b-12d3-a456-426614174000"));
        mockUser.setRoleCode("ROLE_ADMIN");

        Role deletableRole = new Role();
        deletableRole.setCode(roleCode);
        deletableRole.setDeletable(true);

        when(securityUtil.getCurrentUser()).thenReturn(mockUser);
        when(roleRepository.existsByCode(roleCode)).thenReturn(true);
        when(roleRepository.findById(roleCode)).thenReturn(Optional.of(deletableRole));
        when(userRepository.batchUpdateUser("ROLE_DEFAULT", roleCode)).thenReturn(5);

        // Act
        roleService.DeleteRole(roleCode);

        // Assert
        ArgumentCaptor<AuditEvent> captor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditPublisher, times(1)).publish(captor.capture());

        AuditEvent event = captor.getValue();
        assertEquals("ROLE_DELETED", event.getType());
        assertEquals("123e4567-e89b-12d3-a456-426614174000 (ROLE_ADMIN)", event.getUserId());
        assertEquals(roleCode, event.getTarget());
        assertTrue(event.getDetails().contains("deleted"));
        assertTrue(event.getDetails().contains("5 users reassigned"));
    }



}