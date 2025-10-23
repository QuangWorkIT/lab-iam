package com.example.iam_service.service;


import com.example.iam_service.entity.Token;
import com.example.iam_service.entity.User;
import com.example.iam_service.repository.RefreshTokenRepository;
import com.example.iam_service.repository.UserRepository;
import com.example.iam_service.serviceImpl.AuthenticationServiceImpl;
import com.example.iam_service.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Map;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
public class LoginServiceTest {

    @Mock
    private BCryptPasswordEncoder encoder;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshRepo;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthenticationServiceImpl authenticationService; // Test class

    @Test
    void login_Valid_ShouldReturnUser() {
        // Given - Setup test data and mock behavior
        String email = "admin@example.com";
        String password = "admin123ADMIN";

        // Create a mock user
        User mockUser = new User();
        mockUser.setEmail(email);
        mockUser.setPassword("$2a$10$jLVqx5vmeuOtYV7YpKuw9OuSQ085oaEThI42F9pkws/1aEYoixnZi");

        // Create a mock refresh token
        Token mockRefreshToken = new Token();
        mockRefreshToken.setTokenId("mockRefreshTokenId");

        // Define what the mocks should return WHEN called
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));
        when(encoder.matches(password, mockUser.getPassword())).thenReturn(true);
        when(jwtUtil.generateToken(mockUser)).thenReturn("mockAccessToken");
        when(refreshRepo.save(any(Token.class))).thenReturn(mockRefreshToken);

        // When - Execute the method under test
        Map<String, String> tokens = authenticationService.login(email, password);

        // Then - Verify the results and interactions
        assertNotNull(tokens);
        assertEquals("mockAccessToken", tokens.get("accessToken"));
        assertEquals("mockRefreshTokenId", tokens.get("refreshToken"));

        // Verify that the mocks were called as expected
        verify(userRepository, times(1)).findByEmail(email);
        verify(encoder, times(1)).matches(password, mockUser.getPassword());
        verify(jwtUtil, times(1)).generateToken(mockUser);
        verify(refreshRepo, times(1)).save(any(Token.class));
    }


    @Test
    void login_InvalidEmail_ShouldThrowEmailException() {
        String email = "ain@example.com";
        String password = "admin123ADMIN";

        //  configured mock for login usage
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        UsernameNotFoundException exception = assertThrows(UsernameNotFoundException.class, () -> {
            authenticationService.login(email, password);
        });

        assertEquals("Email not found", exception.getMessage());
        verify(userRepository, times(1)).findByEmail(email);
    }

    @Test
    void login_InvalidPassword_ShouldThrowPasswordException() {
        String email = "admin@example.com";
        String password = "admin123STAFF";

        User mockUser = new User();
        mockUser.setEmail(email);
        mockUser.setPassword(password);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));
        when(encoder.matches(password, mockUser.getPassword())).thenReturn(false);

        BadCredentialsException exception = assertThrows(BadCredentialsException.class, () -> {
            authenticationService.login(email, password);
        });

        assertNotNull(mockUser.getEmail());
        assertEquals("Password is invalid", exception.getMessage());
        verify(encoder, times(1)).matches(password, mockUser.getPassword());
    }
}
