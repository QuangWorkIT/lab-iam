package com.example.iam_service.controller;

import com.example.iam_service.dto.RoleDTO;
import com.example.iam_service.dto.request.RoleUpdateRequestDto;
import com.example.iam_service.entity.Role;
import com.example.iam_service.exception.DuplicateRoleException;
import com.example.iam_service.exception.RoleIsFixedException;
import com.example.iam_service.exception.RoleNotFoundException;
import com.example.iam_service.exception.RoleDeletionException;
import com.example.iam_service.mapper.RoleMapper;
import com.example.iam_service.service.RoleService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
@DisplayName("Role Controller Test Suite - 100% Coverage")
class RoleControllerTest {

    @Mock
    private RoleService roleService;

    @Mock
    private RoleMapper roleMapper;

    @InjectMocks
    private RoleController roleController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private Role testRole;
    private RoleDTO testRoleDTO;

    // Base path with /api prefix
    private static final String BASE_PATH = "/roles";

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(roleController).build();
        objectMapper = new ObjectMapper();

        testRole = new Role();
        testRole.setCode("ROLE_TEST");
        testRole.setName("Test Role");
        testRole.setDescription("Test Description");
        testRole.setActive(true);
        testRole.setDeletable(true);
        testRole.setCreatedAt(LocalDate.now());

        testRoleDTO = new RoleDTO();
        testRoleDTO.setCode("ROLE_TEST");
        testRoleDTO.setName("Test Role");
        testRoleDTO.setDescription("Test Description");
        testRoleDTO.setIsActive(true);
        testRoleDTO.setDeletable(true);
    }

    // ==================== GET ALL ROLES TESTS ====================

    @Nested
    @DisplayName("GET /roles Tests")
    class GetAllRolesTests {

        @Test
        @DisplayName("Should get all roles successfully")
        void getAllRoles_Success() throws Exception {
            when(roleService.getAllRoles()).thenReturn(Arrays.asList(testRole));
            when(roleMapper.toDto(any(Role.class))).thenReturn(testRoleDTO);

            mockMvc.perform(get(BASE_PATH))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].code").value(testRole.getCode()))
                    .andExpect(jsonPath("$[0].name").value(testRole.getName()))
                    .andExpect(jsonPath("$", hasSize(1)));

            verify(roleService, times(1)).getAllRoles();
        }

        @Test
        @DisplayName("Should return empty list when no roles exist")
        void getAllRoles_EmptyList() throws Exception {
            when(roleService.getAllRoles()).thenReturn(Collections.emptyList());

            mockMvc.perform(get(BASE_PATH))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        @DisplayName("Should return multiple roles")
        void getAllRoles_MultipleRoles() throws Exception {
            Role role2 = new Role();
            role2.setCode("ROLE_TEST2");
            role2.setName("Test Role 2");

            when(roleService.getAllRoles()).thenReturn(Arrays.asList(testRole, role2));
            when(roleMapper.toDto(any(Role.class))).thenReturn(testRoleDTO);

            mockMvc.perform(get(BASE_PATH))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(2)));
        }
    }

    // ==================== GET PAGED ROLES TESTS ====================

    @Nested
    @DisplayName("GET /roles/paged Tests")
    class GetPagedRolesTests {

        @Test
        @DisplayName("Should get roles with pagination successfully")
        void getRolesPaged_Success() throws Exception {
            Page<Role> rolePage = new PageImpl<>(Arrays.asList(testRole));
            when(roleService.getRolesPaged(any(Pageable.class))).thenReturn(rolePage);
            when(roleMapper.toDto(any(Role.class))).thenReturn(testRoleDTO);

            mockMvc.perform(get(BASE_PATH + "/paged")
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.roles[0].code").value(testRole.getCode()))
                    .andExpect(jsonPath("$.currentPage").value(0));
        }

        @Test
        @DisplayName("Should handle descending sort direction")
        void getRolesPaged_DescendingSort() throws Exception {
            Page<Role> rolePage = new PageImpl<>(Arrays.asList(testRole));
            when(roleService.getRolesPaged(any(Pageable.class))).thenReturn(rolePage);
            when(roleMapper.toDto(any(Role.class))).thenReturn(testRoleDTO);

            mockMvc.perform(get(BASE_PATH + "/paged")
                            .param("direction", "desc"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.roles", hasSize(1)));
        }

        @Test
        @DisplayName("Should handle default pagination parameters")
        void getRolesPaged_DefaultParams() throws Exception {
            Page<Role> rolePage = new PageImpl<>(Arrays.asList(testRole));
            when(roleService.getRolesPaged(any(Pageable.class))).thenReturn(rolePage);
            when(roleMapper.toDto(any(Role.class))).thenReturn(testRoleDTO);

            mockMvc.perform(get(BASE_PATH + "/paged"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.currentPage").exists());
        }

        @Test
        @DisplayName("Should return empty page when no roles")
        void getRolesPaged_EmptyPage() throws Exception {
            Page<Role> emptyPage = new PageImpl<>(Collections.emptyList());
            when(roleService.getRolesPaged(any(Pageable.class))).thenReturn(emptyPage);

            mockMvc.perform(get(BASE_PATH + "/paged"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.roles", hasSize(0)));
        }
    }

    // ==================== GET ROLE BY CODE TESTS ====================

    @Nested
    @DisplayName("GET /roles/{code} Tests")
    class GetRoleByCodeTests {

        @Test
        @DisplayName("Should get role by code successfully")
        void getRoleByCode_Success() throws Exception {
            when(roleService.getRoleByCode("ROLE_TEST")).thenReturn(Optional.of(testRole));
            when(roleMapper.toDto(any(Role.class))).thenReturn(testRoleDTO);

            mockMvc.perform(get(BASE_PATH + "/{code}", "ROLE_TEST"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(testRole.getCode()));
        }

        @Test
        @DisplayName("Should return 404 when role code not found")
        void getRoleByCode_NotFound() throws Exception {
            when(roleService.getRoleByCode("NON_EXISTENT")).thenReturn(Optional.empty());

            mockMvc.perform(get(BASE_PATH + "/{code}", "NON_EXISTENT"))
                    .andExpect(status().isNotFound());
        }
    }

    // ==================== GET ACTIVE ROLES TESTS ====================

    @Nested
    @DisplayName("GET /roles/active Tests")
    class GetActiveRolesTests {

        @Test
        @DisplayName("Should get active roles successfully")
        void getActiveRoles_Success() throws Exception {
            when(roleService.getActiveRoles()).thenReturn(Arrays.asList(testRole));
            when(roleMapper.toDto(any(Role.class))).thenReturn(testRoleDTO);

            mockMvc.perform(get(BASE_PATH + "/active"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].code").value(testRole.getCode()));
        }

        @Test
        @DisplayName("Should return empty list when no active roles")
        void getActiveRoles_EmptyList() throws Exception {
            when(roleService.getActiveRoles()).thenReturn(Collections.emptyList());

            mockMvc.perform(get(BASE_PATH + "/active"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }
    }

    // ==================== SEARCH ROLES TESTS ====================

    @Nested
    @DisplayName("GET /roles/search Tests")
    class SearchRolesTests {

        @Test
        @DisplayName("Should search roles by keyword successfully")
        void searchRoles_WithKeyword() throws Exception {
            // The controller passes: keyword="test", fromDate=null, toDate=null, sortBy=null, direction=ASC (default)
            when(roleService.searchRoles(
                    eq("test"),
                    eq(null),
                    eq(null),
                    eq(null),
                    eq(Sort.Direction.ASC)))
                    .thenReturn(Arrays.asList(testRole));
            when(roleMapper.toDto(any(Role.class))).thenReturn(testRoleDTO);

            mockMvc.perform(get(BASE_PATH + "/search")
                            .param("q", "test"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].code").value(testRole.getCode()));
        }

        @Test
        @DisplayName("Should search roles with date range")
        void searchRoles_WithDateRange() throws Exception {
            LocalDate fromDate = LocalDate.of(2024, 1, 1);
            LocalDate toDate = LocalDate.of(2024, 12, 31);

            // keyword=null, fromDate and toDate set, sortBy=null, direction=ASC
            when(roleService.searchRoles(
                    eq(null),
                    eq(fromDate),
                    eq(toDate),
                    eq(null),
                    eq(Sort.Direction.ASC)))
                    .thenReturn(Arrays.asList(testRole));
            when(roleMapper.toDto(any(Role.class))).thenReturn(testRoleDTO);

            mockMvc.perform(get(BASE_PATH + "/search")
                            .param("fromDate", "2024-01-01")
                            .param("toDate", "2024-12-31"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)));
        }

        @Test
        @DisplayName("Should support legacy name parameter")
        void searchRoles_WithNameParameter() throws Exception {
            // When 'name' param is provided (not 'q'), it becomes the keyword
            when(roleService.searchRoles(
                    eq("test"),
                    eq(null),
                    eq(null),
                    eq(null),
                    eq(Sort.Direction.ASC)))
                    .thenReturn(Arrays.asList(testRole));
            when(roleMapper.toDto(any(Role.class))).thenReturn(testRoleDTO);

            mockMvc.perform(get(BASE_PATH + "/search")
                            .param("name", "test"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)));
        }

        @Test
        @DisplayName("Should search with sorting parameters")
        void searchRoles_WithSorting() throws Exception {
            // sortBy="name", direction="desc"
            when(roleService.searchRoles(
                    eq(null),
                    eq(null),
                    eq(null),
                    eq("name"),
                    eq(Sort.Direction.DESC)))
                    .thenReturn(Arrays.asList(testRole));
            when(roleMapper.toDto(any(Role.class))).thenReturn(testRoleDTO);

            mockMvc.perform(get(BASE_PATH + "/search")
                            .param("sortBy", "name")
                            .param("direction", "desc"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)));
        }

        @Test
        @DisplayName("Should search with all parameters")
        void searchRoles_WithAllParameters() throws Exception {
            LocalDate fromDate = LocalDate.of(2024, 1, 1);
            LocalDate toDate = LocalDate.of(2024, 12, 31);

            when(roleService.searchRoles(
                    eq("admin"),
                    eq(fromDate),
                    eq(toDate),
                    eq("code"),
                    eq(Sort.Direction.DESC)))
                    .thenReturn(Arrays.asList(testRole));
            when(roleMapper.toDto(any(Role.class))).thenReturn(testRoleDTO);

            mockMvc.perform(get(BASE_PATH + "/search")
                            .param("q", "admin")
                            .param("fromDate", "2024-01-01")
                            .param("toDate", "2024-12-31")
                            .param("sortBy", "code")
                            .param("direction", "desc"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].code").value(testRole.getCode()));
        }

        @Test
        @DisplayName("Should return empty list when no roles match search criteria")
        void searchRoles_NoResults() throws Exception {
            when(roleService.searchRoles(
                    eq("nonexistent"),
                    eq(null),
                    eq(null),
                    eq(null),
                    eq(Sort.Direction.ASC)))
                    .thenReturn(Collections.emptyList());

            mockMvc.perform(get(BASE_PATH + "/search")
                            .param("q", "nonexistent"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        @DisplayName("Should handle ascending sort direction explicitly")
        void searchRoles_AscendingSort() throws Exception {
            when(roleService.searchRoles(
                    eq(null),
                    eq(null),
                    eq(null),
                    eq("name"),
                    eq(Sort.Direction.ASC)))
                    .thenReturn(Arrays.asList(testRole));
            when(roleMapper.toDto(any(Role.class))).thenReturn(testRoleDTO);

            mockMvc.perform(get(BASE_PATH + "/search")
                            .param("sortBy", "name")
                            .param("direction", "asc"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)));
        }

        @Test
        @DisplayName("Should prioritize 'q' parameter over 'name' parameter")
        void searchRoles_PrioritizeQParameter() throws Exception {
            // When both 'q' and 'name' are provided, 'q' takes precedence
            when(roleService.searchRoles(
                    eq("priority"),
                    eq(null),
                    eq(null),
                    eq(null),
                    eq(Sort.Direction.ASC)))
                    .thenReturn(Arrays.asList(testRole));
            when(roleMapper.toDto(any(Role.class))).thenReturn(testRoleDTO);

            mockMvc.perform(get(BASE_PATH + "/search")
                            .param("q", "priority")
                            .param("name", "ignored"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)));
        }
    }

    // ==================== POST ROLE TESTS ====================

    @Nested
    @DisplayName("POST /roles Tests")
    class CreateRoleTests {

        @Test
        @DisplayName("Should create role successfully")
        void createRole_Success() throws Exception {
            when(roleMapper.toEntity(any(RoleDTO.class))).thenReturn(testRole);
            when(roleService.createRole(any(Role.class))).thenReturn(testRoleDTO);

            mockMvc.perform(post(BASE_PATH)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(testRoleDTO)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.code").value(testRole.getCode()));

            verify(roleService, times(1)).createRole(any(Role.class));
        }

        @Test
        @DisplayName("Should return 409 conflict when creating duplicate role")
        void createRole_DuplicateRole() throws Exception {
            when(roleMapper.toEntity(any(RoleDTO.class))).thenReturn(testRole);
            when(roleService.createRole(any(Role.class)))
                    .thenThrow(new DuplicateRoleException("Role already exists"));

            mockMvc.perform(post(BASE_PATH)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(testRoleDTO)))
                    .andExpect(status().isConflict());
        }
    }

    // ==================== PUT ROLE TESTS ====================

    @Nested
    @DisplayName("PUT /roles/update/{roleCode} Tests")
    class UpdateRoleTests {

        @Test
        @DisplayName("Should update role successfully")
        void updateRole_Success() throws Exception {
            RoleUpdateRequestDto updateDto = new RoleUpdateRequestDto();
            updateDto.setName("Updated Role");

            when(roleService.updateRole(any(RoleUpdateRequestDto.class), anyString()))
                    .thenReturn(testRoleDTO);

            mockMvc.perform(put(BASE_PATH + "/update/{roleCode}", "ROLE_TEST")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updateDto)))
                    .andExpect(status().isAccepted())
                    .andExpect(jsonPath("$.code").value(testRole.getCode()));

            verify(roleService, times(1)).updateRole(any(RoleUpdateRequestDto.class), anyString());
        }

        @Test
        @DisplayName("Should return 404 when updating non-existent role")
        void updateRole_NotFound() throws Exception {
            RoleUpdateRequestDto updateDto = new RoleUpdateRequestDto();
            updateDto.setName("ValidName");

            when(roleService.updateRole(any(RoleUpdateRequestDto.class), anyString()))
                    .thenThrow(new RoleNotFoundException("Role not found"));

            mockMvc.perform(put(BASE_PATH + "/update/{roleCode}", "NON_EXISTENT")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updateDto)))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should return 400 for empty role code")
        void updateRole_EmptyRoleCode() throws Exception {
            RoleUpdateRequestDto updateDto = new RoleUpdateRequestDto();

            mockMvc.perform(put(BASE_PATH + "/update/{roleCode}", "   ")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updateDto)))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== DELETE ROLE TESTS ====================

    @Nested
    @DisplayName("DELETE /roles/delete/{roleCode} Tests")
    class DeleteRoleTests {

        @Test
        @DisplayName("Should delete role successfully")
        void deleteRole_Success() throws Exception {
            doNothing().when(roleService).DeleteRole(anyString());

            mockMvc.perform(delete(BASE_PATH + "/delete/{roleCode}", "ROLE_TEST"))
                    .andExpect(status().isAccepted());

            verify(roleService, times(1)).DeleteRole("ROLE_TEST");
        }

        @Test
        @DisplayName("Should return 404 when deleting non-existent role")
        void deleteRole_NotFound() throws Exception {
            doThrow(new RoleNotFoundException("Role not found"))
                    .when(roleService).DeleteRole(anyString());

            mockMvc.perform(delete(BASE_PATH + "/delete/{roleCode}", "NON_EXISTENT"))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should return 400 when deleting protected/non-deletable role")
        void deleteRole_Protected() throws Exception {
            doThrow(new RoleIsFixedException("Role is protected"))
                    .when(roleService).DeleteRole(anyString());

            mockMvc.perform(delete(BASE_PATH + "/delete/{roleCode}", "ROLE_ADMIN"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 500 on role deletion error")
        void deleteRole_Error() throws Exception {
            doThrow(new RoleDeletionException("Failed to delete role"))
                    .when(roleService).DeleteRole(anyString());

            mockMvc.perform(delete(BASE_PATH + "/delete/{roleCode}", "ROLE_TEST"))
                    .andExpect(status().isInternalServerError());
        }

        @Test
        @DisplayName("Should return 400 for empty role code in delete")
        void deleteRole_EmptyRoleCode() throws Exception {
            mockMvc.perform(delete(BASE_PATH + "/delete/{roleCode}", "   "))
                    .andExpect(status().isBadRequest());
        }
    }
}