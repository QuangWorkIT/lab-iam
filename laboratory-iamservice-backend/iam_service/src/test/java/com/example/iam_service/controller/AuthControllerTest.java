package com.example.iam_service.controller;


import com.example.iam_service.dto.request.LoginRequest;
import com.example.iam_service.dto.response.ApiResponse;
import com.example.iam_service.dto.response.auth.TokenResponse;
import com.example.iam_service.serviceImpl.AuthenticationServiceImpl;
import com.example.iam_service.serviceImpl.LoginLimiterServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthControllerTest {

    @Mock
    AuthenticationServiceImpl authService;

    @Mock
    LoginLimiterServiceImpl loginLimiterService;

    @Mock
    private HttpServletRequest servletRequest;

    @InjectMocks
    AuthController authController;

    @Nested
    class LoginControllerTestGroup {

        @Test
        void login_ValidCredentials_ShouldReturnSuccessResponse() {
            LoginRequest loginRq = new LoginRequest();
            loginRq.setEmail("user@example.com");
            loginRq.setPassword("password123");

            String ip = "192.168.1.1";
            when(servletRequest.getRemoteAddr()).thenReturn(ip);
            when(loginLimiterService.isBanned(ip)).thenReturn(false);

            Map<String, String> tokens = new HashMap<>();
            tokens.put("accessToken", "access123");
            tokens.put("refreshToken", "refresh123");
            when(authService.login(loginRq.getEmail(), loginRq.getPassword())).thenReturn(tokens);

            ResponseEntity<ApiResponse<TokenResponse>> response =
                    authController.login(loginRq, null, servletRequest);

            assertEquals(200, response.getStatusCode().value());
            assertNotNull(response.getBody());
            assertEquals("login success", response.getBody().getMessage());
            assertEquals("access123", response.getBody().getData().getAccessToken());
            assertEquals("refresh123", response.getBody().getData().getRefreshToken());

            verify(authService, times(1)).login("user@example.com", "password123");
            verify(loginLimiterService, times(1)).resetAttempt(ip);

        }

        @Test
        void login_ShouldReturn429_WhenIpIsBanned() {
            // Given
            LoginRequest loginRq = new LoginRequest();
            loginRq.setEmail("banned@example.com");
            loginRq.setPassword("password123");

            String ip = "203.0.113.5";
            when(servletRequest.getRemoteAddr()).thenReturn(ip);
            when(loginLimiterService.isBanned(ip)).thenReturn(true);
            when(loginLimiterService.getBanUntil(ip))
                    .thenReturn(LocalDateTime.now().atZone(ZoneId.of("Asia/Ho_Chi_Minh")).plusMinutes(10));

            // When
            ResponseEntity<ApiResponse<TokenResponse>> response =
                    authController.login(loginRq, null, servletRequest);

            // Then
            assertEquals(429, response.getStatusCode().value());
            assertTrue(response.getBody().getMessage().contains("Too many attempts"));
            verify(authService, never()).login(any(), any());
        }


        @Test
        void login_ShouldReturn401_WhenCredentialsAreInvalid() {
            // Given
            LoginRequest loginRq = new LoginRequest();
            loginRq.setEmail("invalid@example.com");
            loginRq.setPassword("wrong");

            String ip = "127.0.0.1";
            when(servletRequest.getRemoteAddr()).thenReturn(ip);
            when(loginLimiterService.isBanned(ip)).thenReturn(false);

            when(authService.login(loginRq.getEmail(), loginRq.getPassword()))
                    .thenThrow(new BadCredentialsException("Invalid credentials"));

            // When
            ResponseEntity<ApiResponse<TokenResponse>> response =
                    authController.login(loginRq, null, servletRequest);

            // Then
            assertEquals(401, response.getStatusCode().value());
            assertEquals("Error", response.getBody().getStatus());
            assertEquals("Invalid credentials", response.getBody().getMessage());

            verify(loginLimiterService, times(1)).recordFailedAttempt(ip);
        }
    }
}
