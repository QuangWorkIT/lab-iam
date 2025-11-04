package com.example.iam_service.controller;

import com.example.iam_service.dto.RoleDTO;
import com.example.iam_service.dto.request.RoleUpdateRequestDto;
import com.example.iam_service.entity.Role;
import com.example.iam_service.exception.DuplicateRoleException;
import com.example.iam_service.exception.RoleIsFixedException;
import com.example.iam_service.exception.RoleNotFoundException;
import com.example.iam_service.mapper.RoleMapper;
import com.example.iam_service.repository.RoleRepository;
import com.example.iam_service.service.RoleService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class RoleControllerTest {

    @Mock
    private RoleService roleService;

    @Mock
    private RoleMapper roleMapper;

    @Mock
    private RoleRepository roleRepository;

    @InjectMocks
    private RoleController roleController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private Role testRole;
    private RoleDTO testRoleDTO;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(roleController).build();
        objectMapper = new ObjectMapper();

        // Initialize test data
        testRole = new Role();
        testRole.setCode("ROLE_TEST");
        testRole.setName("Test Role");
        testRole.setDescription("Test Description");
        testRole.setActive(true);
        testRole.setDeletable(true);

        testRoleDTO = new RoleDTO();
        testRoleDTO.setCode("ROLE_TEST");
        testRoleDTO.setName("Test Role");
        testRoleDTO.setDescription("Test Description");
        testRoleDTO.setIsActive(true);
        testRoleDTO.setDeletable(true);
    }

    @Test
    @DisplayName("Should get all roles successfully")
    void getAllRoles_Success() throws Exception {
        // Given
        when(roleService.getAllRoles()).thenReturn(Arrays.asList(testRole));
        when(roleMapper.toDto(any(Role.class))).thenReturn(testRoleDTO);

        // When & Then
        mockMvc.perform(get("/api/roles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value(testRole.getCode()))
                .andExpect(jsonPath("$[0].name").value(testRole.getName()));
    }

    @Test
    @DisplayName("Should return roles with pagination successfully")
    void getRolesPaged_Success() throws Exception {
        // Given
        int page = 0;
        int size = 10;
        String sortBy = "code";
        String direction = "asc";

        // Mock the necessary objects
        Page<Role> rolePage = new PageImpl<>(Arrays.asList(testRole));
        when(roleService.getRolesPaged(any(Pageable.class))).thenReturn(rolePage);
        when(roleMapper.toDto(any(Role.class))).thenReturn(testRoleDTO);

        // When & Then
        mockMvc.perform(get("/api/roles/paged")
                        .param("page", String.valueOf(page))
                        .param("size", String.valueOf(size))
                        .param("sortBy", sortBy)
                        .param("direction", direction))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roles[0].code").value(testRole.getCode()));
    }

    @Test
    @DisplayName("Should create role successfully")
    void createRole_Success() throws Exception {
        // Given
        when(roleMapper.toEntity(any(RoleDTO.class))).thenReturn(testRole);
        when(roleService.createRole(any(Role.class))).thenReturn(testRoleDTO);

        // When & Then
        mockMvc.perform(post("/api/roles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testRoleDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(testRole.getCode()));
    }

    @Test
    @DisplayName("Should return conflict when creating duplicate role")
    void createRole_DuplicateRole() throws Exception {
        // Given
        when(roleMapper.toEntity(any(RoleDTO.class))).thenReturn(testRole);
        when(roleService.createRole(any(Role.class)))
                .thenThrow(new DuplicateRoleException("Role already exists"));

        // When & Then
        mockMvc.perform(post("/api/roles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testRoleDTO)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Should update role successfully")
    void updateRole_Success() throws Exception {
        // Given
        RoleUpdateRequestDto updateRequestDto = new RoleUpdateRequestDto();
        updateRequestDto.setName("Updated Role");

        when(roleService.updateRole(any(RoleUpdateRequestDto.class), anyString()))
                .thenReturn(testRoleDTO);

        // When & Then
        mockMvc.perform(put("/api/roles/update/{roleCode}", "ROLE_TEST")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequestDto)))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.code").value(testRole.getCode()));
    }

    @Test
    @DisplayName("Should return not found when updating non-existent role")
    void updateRole_NotFound() throws Exception {
        // Given
        RoleUpdateRequestDto updateRequestDto = new RoleUpdateRequestDto();
        when(roleService.updateRole(any(RoleUpdateRequestDto.class), anyString()))
                .thenThrow(new RoleNotFoundException("Role not found"));

        // When & Then
        mockMvc.perform(put("/api/roles/update/{roleCode}", "NON_EXISTENT")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequestDto)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should delete role successfully")
    void deleteRole_Success() throws Exception {
        // Given
        doNothing().when(roleService).DeleteRole(anyString());

        // When & Then
        mockMvc.perform(delete("/api/roles/delete/{roleCode}", "ROLE_TEST"))
                .andExpect(status().isAccepted());
    }

    @Test
    @DisplayName("Should return not found when deleting non-existent role")
    void deleteRole_NotFound() throws Exception {
        // Given
        doThrow(new RoleNotFoundException("Role not found"))
                .when(roleService).DeleteRole(anyString());

        // When & Then
        mockMvc.perform(delete("/api/roles/delete/{roleCode}", "NON_EXISTENT"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should return bad request when deleting protected role")
    void deleteRole_Protected() throws Exception {
        // Given
        doThrow(new RoleIsFixedException("Role is protected"))
                .when(roleService).DeleteRole(anyString());

        // When & Then
        mockMvc.perform(delete("/api/roles/delete/{roleCode}", "ROLE_ADMIN"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should search roles successfully")
    void searchRoles_Success() throws Exception {
        // Given
        String searchTerm = "test";
        LocalDate fromDate = LocalDate.now().minusDays(30);
        LocalDate toDate = LocalDate.now();

        when(roleService.searchRoles(anyString(), any(), any(), any(), any()))
                .thenReturn(Arrays.asList(testRole));
        when(roleMapper.toDto(any(Role.class))).thenReturn(testRoleDTO);

        // When & Then
        mockMvc.perform(get("/api/roles/search")
                        .param("q", searchTerm)
                        .param("fromDate", fromDate.toString())
                        .param("toDate", toDate.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value(testRole.getCode()));
    }

    @Test
    @DisplayName("Should search roles with empty search parameters")
    void searchRoles_WithEmptyParams() throws Exception {
        // Given
        when(roleService.searchRoles(anyString(), any(), any(), any(), any()))
                .thenReturn(Arrays.asList(testRole));
        when(roleMapper.toDto(any(Role.class))).thenReturn(testRoleDTO);

        // When & Then
        mockMvc.perform(get("/api/roles/search"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value(testRole.getCode()));
    }
}