package com.example.iam_service.controller;

import com.example.iam_service.dto.UserDTO;
import com.example.iam_service.entity.User;
import com.example.iam_service.mapper.UserMapper;
import com.example.iam_service.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
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
}
