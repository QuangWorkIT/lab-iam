package com.example.iam_service.controller;

import com.example.iam_service.dto.user.*;
import com.example.iam_service.entity.User;
import com.example.iam_service.mapper.UserMapper;
import com.example.iam_service.service.UserService;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.util.NestedServletException;
import static org.junit.jupiter.api.Assertions.fail;


import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock private UserService userService;
    @Mock private UserMapper userMapper;
    @InjectMocks private UserController userController;

    private MockMvc mockMvc;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(userController).build();
    }

    // ========== CREATE USER ==========
    @Test
    void createUser_ShouldReturn201_WhenValidRequest() throws Exception {
        User user = new User();
        user.setEmail("user@example.com");
        UserDTO dto = new UserDTO();
        dto.setEmail("user@example.com");

        when(userService.createUser(any(User.class))).thenReturn(user);
        when(userMapper.toDto(any(User.class))).thenReturn(dto);

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "email": "user@example.com",
                                "phoneNumber": "+819012345678",
                                "fullName": "Itsuki May",
                                "identityNumber": "ID20251017",
                                "gender": "FEMALE",
                                "age": 21,
                                "address": "Tokyo, Japan",
                                "birthdate": "2003-05-10",
                                "password": "StrongPass123",
                                "roleCode": "ROLE_LAB_MANAGER",
                                "isActive": true
                            }
                            """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("user@example.com"));
    }

    // ========== GET USER BY EMAIL ==========
    @Test
    void getUserByEmail_ShouldReturn200_WhenFound() throws Exception {
        User user = new User();
        user.setEmail("test@example.com");
        UserDTO dto = new UserDTO();
        dto.setEmail("test@example.com");

        when(userService.getUserByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(userMapper.toDto(user)).thenReturn(dto);

        mockMvc.perform(get("/api/users/email")
                        .param("email", "test@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    void getUserByEmail_ShouldReturn404_WhenNotFound() throws Exception {
        when(userService.getUserByEmail("ghost@example.com")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/users/email")
                        .param("email", "ghost@example.com"))
                .andExpect(status().isNotFound());
    }

    // ========== GET ALL USERS ==========
    @Test
    void getAllUsers_ShouldReturn200_WithList() throws Exception {
        User user = new User();
        UserDTO dto = new UserDTO();
        dto.setEmail("test@list.com");

        when(userService.getAllUsers()).thenReturn(List.of(user));
        when(userMapper.toDto(any(User.class))).thenReturn(dto);

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("test@list.com"));
    }

    // ========== GET INACTIVE USERS ==========
    @Test
    void getInactiveUsers_ShouldReturn200_WithList() throws Exception {
        User user = new User();
        UserDTO dto = new UserDTO();
        dto.setEmail("inactive@user.com");

        when(userService.getInactiveUsers()).thenReturn(List.of(user));
        when(userMapper.toDto(any(User.class))).thenReturn(dto);

        mockMvc.perform(get("/api/users/inactive"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("inactive@user.com"));
    }

    // ========== ACTIVATE USER ==========
    @Test
    void activateUserByEmail_ShouldReturn200_WhenSuccess() throws Exception {
        mockMvc.perform(put("/api/users/activate")
                        .param("email", "activate@example.com"))
                .andExpect(status().isOk())
                .andExpect(content().string("User with email activate@example.com has been activated successfully."));
    }

    // ========== GET USER BY ID ==========
    @Test
    void getUserById_ShouldReturn200_WhenFound() throws Exception {
        UUID id = UUID.randomUUID();
        User user = new User();
        user.setUserId(id);
        DetailUserDTO dto = new DetailUserDTO();
        dto.setEmail("detail@example.com");

        when(userService.getUserById(id)).thenReturn(Optional.of(user));
        when(userMapper.toDetailDto(user)).thenReturn(dto);

        mockMvc.perform(get("/api/users/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("detail@example.com"));
    }

    @Test
    void getUserById_ShouldReturn404_WhenNotFound() throws Exception {
        UUID id = UUID.randomUUID();
        when(userService.getUserById(id)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/users/" + id))
                .andExpect(status().isNotFound());
    }

    // ========== UPDATE OWN PROFILE ==========
    @Test
    void updateOwnProfile_ShouldReturn200_WhenSameUser() throws Exception {
        UUID id = UUID.randomUUID();
        User currentUser = new User();
        currentUser.setUserId(id);

        SecurityContextHolder.getContext().setAuthentication(
                new TestingAuthenticationToken(currentUser, null)
        );

        User updated = new User();
        updated.setEmail("updated@example.com");
        DetailUserDTO dto = new DetailUserDTO();
        dto.setEmail("updated@example.com");

        when(userService.updateOwnProfile(eq(id), any(UpdateUserProfileDTO.class))).thenReturn(updated);
        when(userMapper.toDetailDto(updated)).thenReturn(dto);

        mockMvc.perform(put("/api/users/" + id + "/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "address": "Tokyo",
                                "phoneNumber": "+819011111111"
                            }
                            """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("updated@example.com"));
    }

    @Test
    void updateOwnProfile_ShouldThrowAccessDenied_WhenDifferentUser() throws Exception {
        UUID id = UUID.randomUUID();
        User currentUser = new User();
        currentUser.setUserId(UUID.randomUUID());

        SecurityContextHolder.getContext().setAuthentication(
                new TestingAuthenticationToken(currentUser, null)
        );

        try {
            mockMvc.perform(put("/api/users/" + id + "/profile")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{ \"address\": \"Tokyo\" }"))
                    .andReturn();
            fail("Expected AccessDeniedException to be thrown");
        } catch (ServletException ex) {
            Throwable cause = ex.getCause();
            assertTrue(cause instanceof AccessDeniedException,
                    "Expected AccessDeniedException but got " + (cause == null ? "null" : cause.getClass()));
            assertEquals("You can only update your own profile!", cause.getMessage());
        }
    }


    // ========== ADMIN UPDATE USER ==========
    @Test
    void updateUserByAdmin_ShouldReturn200_WhenUpdated() throws Exception {
        UUID id = UUID.randomUUID();
        User updated = new User();
        updated.setEmail("adminupdate@example.com");
        UserDTO dto = new UserDTO();
        dto.setEmail("adminupdate@example.com");

        when(userService.adminUpdateUser(eq(id), any(AdminUpdateUserDTO.class))).thenReturn(updated);
        when(userMapper.toDto(updated)).thenReturn(dto);

        mockMvc.perform(put("/api/users/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "fullName": "Updated Name"
                            }
                            """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("adminupdate@example.com"));
    }

    // ========== VIEW OWN PROFILE ==========
    @Test
    void viewDetailedInformation_ShouldReturn200_WhenFound() throws Exception {
        UUID id = UUID.randomUUID();
        User user = new User();
        DetailUserDTO dto = new DetailUserDTO();
        dto.setEmail("selfview@example.com");

        when(userService.getUserById(id)).thenReturn(Optional.of(user));
        when(userMapper.toDetailDto(user)).thenReturn(dto);

        mockMvc.perform(get("/api/users/" + id + "/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("selfview@example.com"));
    }

    // ========== REQUEST SELF DELETION ==========
    @Test
    void requestSelfDeletion_ShouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/users/" + id + "/request-deletion"))
                .andExpect(status().isOk())
                .andExpect(content().string("Your deletion request has been submitted. Account will be deleted after 7 days."));
    }

    // ========== DELETE USER BY ADMIN ==========
    @Test
    void deleteUserByAdmin_ShouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/users/" + id))
                .andExpect(status().isOk())
                .andExpect(content().string("User deleted successfully."));
    }

    // ========== GET DELETED USERS ==========
    @Test
    void getDeletedUsers_ShouldReturn200() throws Exception {
        User user = new User();
        UserDTO dto = new UserDTO();
        dto.setEmail("deleted@user.com");

        when(userService.getDeletedUsers()).thenReturn(List.of(user));
        when(userMapper.toDto(any(User.class))).thenReturn(dto);

        mockMvc.perform(get("/api/users/deleted"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("deleted@user.com"));
    }

    // ========== RESTORE USER ==========
    @Test
    void restoreUser_ShouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(put("/api/users/" + id + "/restore"))
                .andExpect(status().isOk())
                .andExpect(content().string("User restored successfully."));
    }
}
