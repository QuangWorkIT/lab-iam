package com.example.iam_service.controller;


import com.example.iam_service.dto.user.UserDTO;
import com.example.iam_service.entity.User;
import com.example.iam_service.mapper.UserMapper;
import com.example.iam_service.serviceImpl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class InternalUserControllerTest {
    private UserServiceImpl userService;
    private UserMapper userMapper;
    private InternalUserController controller;

    @BeforeEach
    void setUp() {
        userService = mock(UserServiceImpl.class);
        userMapper = mock(UserMapper.class);
        controller = new InternalUserController(userService, userMapper);
    }

    @Test
    void testFindUserByEmail_UserExists() {
        String email = "test@example.com";
        User user = User.builder()
                .userId(UUID.randomUUID())
                .email(email)
                .fullName("John Doe")
                .build();
        UserDTO dto = new UserDTO();
        dto.setEmail(email);

        when(userService.getUserByEmail(email)).thenReturn(Optional.of(user));
        when(userMapper.toDto(user)).thenReturn(dto);

        ResponseEntity<UserDTO> response = controller.findUserByEmail(email);

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(dto, response.getBody());

        verify(userService, times(1)).getUserByEmail(email);
        verify(userMapper, times(1)).toDto(user);
    }

    @Test
    void testFindUserByEmail_UserDoesNotExist() {
        String email = "notfound@example.com";

        when(userService.getUserByEmail(email)).thenReturn(Optional.empty());

        ResponseEntity<UserDTO> response = controller.findUserByEmail(email);

        assertNotNull(response);
        assertEquals(404, response.getStatusCodeValue());
        assertNull(response.getBody());

        verify(userService, times(1)).getUserByEmail(email);
        verifyNoInteractions(userMapper);
    }
}
