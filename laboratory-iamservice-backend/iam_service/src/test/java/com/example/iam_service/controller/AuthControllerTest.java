package com.example.iam_service.controller;


import com.example.iam_service.dto.UserDTO;
import com.example.iam_service.dto.request.*;
import com.example.iam_service.dto.response.ApiResponse;
import com.example.iam_service.dto.response.auth.TokenResponse;
import com.example.iam_service.entity.Token;
import com.example.iam_service.entity.User;
import com.example.iam_service.mapper.UserMapper;
import com.example.iam_service.service.EmailService;
import com.example.iam_service.serviceImpl.AuthenticationServiceImpl;
import com.example.iam_service.serviceImpl.LoginLimiterServiceImpl;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
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
import java.util.UUID;

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

    @Mock
    private UserMapper userMapper;

    @Mock
    private EmailService emailService;

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

    @Nested
    class GoogleLoginTestGroup {

        @Test
        void googleLogin_ValidCredentials_ShouldReturnSuccessResponse() {
            // Given
            GoogleTokenRequest tokenRequest = new GoogleTokenRequest();
            tokenRequest.setGoogleCredential("valid-google-token");

            GoogleIdToken.Payload payload = mock(GoogleIdToken.Payload.class);
            User user = new User();
            user.setUserId(UUID.randomUUID());
            user.setEmail("user@gmail.com");

            Map<String, String> tokens = new HashMap<>();
            tokens.put("accessToken", "google-access-token");
            tokens.put("refreshToken", "google-refresh-token");

            when(authService.getPayload("valid-google-token")).thenReturn(payload);
            when(authService.loadOrCreateUser(payload)).thenReturn(user);
            when(authService.getTokens(user)).thenReturn(tokens);

            // When
            ResponseEntity<ApiResponse<TokenResponse>> response =
                    authController.googleLogin(tokenRequest);

            // Then
            assertEquals(200, response.getStatusCode().value());
            assertNotNull(response.getBody());
            assertEquals("success", response.getBody().getStatus());
            assertEquals("login success", response.getBody().getMessage());
            assertEquals("google-access-token", response.getBody().getData().getAccessToken());
            assertEquals("google-refresh-token", response.getBody().getData().getRefreshToken());
            assertTrue(response.getHeaders().containsKey("Set-cookie"));

            verify(authService, times(1)).getPayload("valid-google-token");
            verify(authService, times(1)).loadOrCreateUser(payload);
            verify(authService, times(1)).getTokens(user);
        }
    }

    @Nested
    class RefreshTokenTestGroup {

        @Test
        void refresh_ValidToken_ShouldReturnNewTokens() {
            // Given
            String refreshToken = "valid-refresh-token";
            Token validToken = new Token();
            User user = new User();
            user.setUserId(UUID.randomUUID());
            validToken.setUser(user);
            validToken.setTokenId("token123");

            Map<String, String> newTokens = new HashMap<>();
            newTokens.put("accessToken", "new-access-token");
            newTokens.put("refreshToken", "new-refresh-token");

            when(authService.verifyRefreshToken(refreshToken)).thenReturn(validToken);
            when(authService.getTokens(user)).thenReturn(newTokens);

            // When
            ResponseEntity<ApiResponse<TokenResponse>> response =
                    authController.refresh(refreshToken);

            // Then
            assertEquals(200, response.getStatusCode().value());
            assertNotNull(response.getBody());
            assertEquals("success", response.getBody().getStatus());
            assertEquals("refresh success", response.getBody().getMessage());
            assertEquals("new-access-token", response.getBody().getData().getAccessToken());
            assertEquals("new-refresh-token", response.getBody().getData().getRefreshToken());
            assertTrue(response.getHeaders().containsKey("Set-cookie"));

            verify(authService, times(1)).verifyRefreshToken(refreshToken);
            verify(authService, times(1)).deleteToken("token123");
            verify(authService, times(1)).getTokens(user);
        }

        @Test
        void refresh_NullToken_ShouldReturn400() {
            // When
            ResponseEntity<ApiResponse<TokenResponse>> response =
                    authController.refresh(null);

            // Then
            assertEquals(400, response.getStatusCode().value());
            assertNotNull(response.getBody());
            assertEquals("Error", response.getBody().getStatus());
            assertEquals("Invalid refresh token", response.getBody().getMessage());

            verify(authService, never()).verifyRefreshToken(any());
        }

        @Test
        void refresh_InvalidToken_ShouldReturn400() {
            // Given
            String invalidToken = "invalid-refresh-token";
            when(authService.verifyRefreshToken(invalidToken)).thenReturn(null);

            // When
            ResponseEntity<ApiResponse<TokenResponse>> response =
                    authController.refresh(invalidToken);

            // Then
            assertEquals(400, response.getStatusCode().value());
            assertNotNull(response.getBody());
            assertEquals("Error", response.getBody().getStatus());
            assertEquals("Not found or expired refresh token", response.getBody().getMessage());

            verify(authService, times(1)).verifyRefreshToken(invalidToken);
            verify(authService, never()).deleteToken(any());
        }

        @Test
        void refresh_ExpiredToken_ShouldReturn400() {
            // Given
            String expiredToken = "expired-refresh-token";
            when(authService.verifyRefreshToken(expiredToken)).thenReturn(null);

            // When
            ResponseEntity<ApiResponse<TokenResponse>> response =
                    authController.refresh(expiredToken);

            // Then
            assertEquals(400, response.getStatusCode().value());
            assertEquals("Not found or expired refresh token", response.getBody().getMessage());
        }
    }

    @Nested
    class LogoutTestGroup {

        @Test
        void logout_ValidToken_ShouldReturnSuccess() {
            // Given
            String refreshToken = "valid-refresh-token";

            // When
            ResponseEntity<ApiResponse<?>> response =
                    authController.logout(refreshToken);

            // Then
            assertEquals(200, response.getStatusCode().value());
            assertNotNull(response.getBody());
            assertEquals("success", response.getBody().getStatus());
            assertEquals("logout success", response.getBody().getMessage());
            assertTrue(response.getHeaders().containsKey("Set-cookie"));

            verify(authService, times(1)).deleteToken(refreshToken);
        }

        @Test
        void logout_EmptyToken_ShouldStillReturnSuccess() {
            // Given
            String emptyToken = "   ";

            // When
            ResponseEntity<ApiResponse<?>> response =
                    authController.logout(emptyToken);

            // Then
            assertEquals(200, response.getStatusCode().value());
            assertEquals("success", response.getBody().getStatus());
            assertEquals("logout success", response.getBody().getMessage());

            verify(authService, never()).deleteToken(any());
        }


        @Test
        void logout_ExceptionThrown_ShouldReturn400() {
            // Given
            String refreshToken = "error-token";
            doThrow(new RuntimeException("Database error"))
                    .when(authService).deleteToken(refreshToken);

            // When
            ResponseEntity<ApiResponse<?>> response =
                    authController.logout(refreshToken);

            // Then
            assertEquals(400, response.getStatusCode().value());
            assertEquals("Error", response.getBody().getStatus());
            assertTrue(response.getBody().getMessage().contains("Error logout"));
            assertTrue(response.getBody().getMessage().contains("Database error"));
        }
    }

    @Nested
    class UserLookupTestGroup {

        @Test
        void findUserByOptions_UserFoundByEmail_ShouldReturnUser() {
            UUID userid = UUID.randomUUID();
            // Given
            ResetPassOptionRequest request = new ResetPassOptionRequest();
            request.setOption("email");
            request.setData("user@example.com");

            User user = new User();
            user.setUserId(userid);
            user.setEmail("user@example.com");

            UserDTO userDTO = new UserDTO();
            userDTO.setUserId(userid);
            userDTO.setEmail("user@example.com");

            when(authService.findUserByEmailOrPhone("email", "user@example.com")).thenReturn(user);
            when(userMapper.toDto(user)).thenReturn(userDTO);

            // When
            ResponseEntity<ApiResponse<UserDTO>> response =
                    authController.findUserByOptions(request);

            // Then
            assertEquals(200, response.getStatusCode().value());
            assertNotNull(response.getBody());
            assertEquals("success", response.getBody().getStatus());
            assertEquals("User found!", response.getBody().getMessage());
            assertNotNull(response.getBody().getData());
            assertEquals(userid, response.getBody().getData().getUserId());
            assertEquals("user@example.com", response.getBody().getData().getEmail());

            verify(authService, times(1)).findUserByEmailOrPhone("email", "user@example.com");
            verify(userMapper, times(1)).toDto(user);
        }

        @Test
        void findUserByOptions_UserFoundByPhone_ShouldReturnUser() {
            UUID userid = UUID.randomUUID();

            // Given
            ResetPassOptionRequest request = new ResetPassOptionRequest();
            request.setOption("phone");
            request.setData("0123456789");

            User user = new User();
            user.setUserId(userid);
            user.setPhoneNumber("0123456789");

            UserDTO userDTO = new UserDTO();
            userDTO.setUserId(userid);
            userDTO.setPhoneNumber("0123456789");

            when(authService.findUserByEmailOrPhone("phone", "0123456789")).thenReturn(user);
            when(userMapper.toDto(user)).thenReturn(userDTO);

            // When
            ResponseEntity<ApiResponse<UserDTO>> response =
                    authController.findUserByOptions(request);

            // Then
            assertEquals(200, response.getStatusCode().value());
            assertEquals("User found!", response.getBody().getMessage());
            assertEquals(userid, response.getBody().getData().getUserId());

            verify(authService, times(1)).findUserByEmailOrPhone("phone", "0123456789");
        }

        @Test
        void findUserByOptions_UserNotFound_ShouldReturn404() {
            // Given
            ResetPassOptionRequest request = new ResetPassOptionRequest();
            request.setOption("email");
            request.setData("notfound@example.com");

            when(authService.findUserByEmailOrPhone("email", "notfound@example.com")).thenReturn(null);

            // When
            ResponseEntity<ApiResponse<UserDTO>> response =
                    authController.findUserByOptions(request);

            // Then
            assertEquals(404, response.getStatusCode().value());
            assertNotNull(response.getBody());
            assertEquals("Error", response.getBody().getStatus());
            assertEquals("User not found", response.getBody().getMessage());
            assertNull(response.getBody().getData());

            verify(authService, times(1)).findUserByEmailOrPhone("email", "notfound@example.com");
            verify(userMapper, never()).toDto(any());
        }
    }

    @Nested
    class OtpTestGroup {

        @Test
        void sendOtp_ValidEmail_ShouldReturnSuccess() {
            // Given
            Map<String, String> body = new HashMap<>();
            body.put("email", "user@example.com");

            // When
            ResponseEntity<ApiResponse<?>> response =
                    authController.sendOtp(body);

            // Then
            assertEquals(200, response.getStatusCode().value());
            assertNotNull(response.getBody());
            assertEquals("success", response.getBody().getStatus());
            assertEquals("OTP sent!", response.getBody().getMessage());

            verify(emailService, times(1)).sendOtp("user@example.com");
        }

        @Test
        void sendOtp_NullEmail_ShouldReturn404() {
            // Given
            Map<String, String> body = new HashMap<>();

            // When
            ResponseEntity<ApiResponse<?>> response =
                    authController.sendOtp(body);

            // Then
            assertEquals(404, response.getStatusCode().value());
            assertNotNull(response.getBody());
            assertEquals("Error", response.getBody().getStatus());
            assertEquals("Email is required", response.getBody().getMessage());

            verify(emailService, never()).sendOtp(any());
        }

        @Test
        void sendOtp_EmptyEmail_ShouldReturn404() {
            // Given
            Map<String, String> body = new HashMap<>();
            body.put("email", "   ");

            // When
            ResponseEntity<ApiResponse<?>> response =
                    authController.sendOtp(body);

            // Then
            assertEquals(404, response.getStatusCode().value());
            assertEquals("Error", response.getBody().getStatus());
            assertEquals("Email is required", response.getBody().getMessage());

            verify(emailService, never()).sendOtp(any());
        }

        @Test
        void sendOtp_EmptyString_ShouldReturn404() {
            // Given
            Map<String, String> body = new HashMap<>();
            body.put("email", "");

            // When
            ResponseEntity<ApiResponse<?>> response =
                    authController.sendOtp(body);

            // Then
            assertEquals(404, response.getStatusCode().value());
            assertEquals("Email is required", response.getBody().getMessage());
        }

        @Test
        void verifyOtp_ValidOtp_ShouldReturnSuccess() {
            // Given
            OtpVerificationRequest request = new OtpVerificationRequest();
            request.setEmail("user@example.com");
            request.setOtp("123456");

            when(emailService.verifyOtp("user@example.com", "123456"))
                    .thenReturn("user@example.com");

            // When
            ResponseEntity<ApiResponse<String>> response =
                    authController.verifyOtp(request);

            // Then
            assertEquals(200, response.getStatusCode().value());
            assertNotNull(response.getBody());
            assertEquals("success", response.getBody().getStatus());
            assertEquals("OTP is valid!", response.getBody().getMessage());
            assertEquals("user@example.com", response.getBody().getData());

            verify(emailService, times(1)).verifyOtp("user@example.com", "123456");
        }

        @Test
        void verifyOtp_InvalidOtp_ShouldHandleException() {
            // Given
            OtpVerificationRequest request = new OtpVerificationRequest();
            request.setEmail("user@example.com");
            request.setOtp("wrong-otp");

            when(emailService.verifyOtp("user@example.com", "wrong-otp"))
                    .thenThrow(new RuntimeException("Invalid OTP"));

            // When/Then
            assertThrows(RuntimeException.class, () -> {
                authController.verifyOtp(request);
            });

            verify(emailService, times(1)).verifyOtp("user@example.com", "wrong-otp");
        }
    }

    @Nested
    class PasswordResetTestGroup {

        @Test
        void resetPassword_ValidRequest_ShouldReturnSuccess() {
            UUID userid = UUID.randomUUID();

            // Given
            ResetPassWordRequest request = new ResetPassWordRequest();
            request.setUserid("user123");
            request.setPassword("newPassword123");

            User updatedUser = new User();
            updatedUser.setUserId(userid);
            updatedUser.setEmail("user@example.com");

            UserDTO userDTO = new UserDTO();
            userDTO.setUserId(userid);
            userDTO.setEmail("user@example.com");

            when(authService.updateUserPassword("user123", "newPassword123")).thenReturn(updatedUser);
            when(userMapper.toDto(updatedUser)).thenReturn(userDTO);

            // When
            ResponseEntity<ApiResponse<UserDTO>> response =
                    authController.resetPassWord(request);

            // Then
            assertEquals(200, response.getStatusCode().value());
            assertNotNull(response.getBody());
            assertEquals("success", response.getBody().getStatus());
            assertEquals("Update password successfully!", response.getBody().getMessage());
            assertNotNull(response.getBody().getData());
            assertEquals(userid, response.getBody().getData().getUserId());
            assertEquals("user@example.com", response.getBody().getData().getEmail());

            verify(authService, times(1)).updateUserPassword("user123", "newPassword123");
            verify(userMapper, times(1)).toDto(updatedUser);
        }

        @Test
        void resetPassword_NonExistentUser_ShouldHandleException() {
            // Given
            ResetPassWordRequest request = new ResetPassWordRequest();
            request.setUserid("nonexistent");
            request.setPassword("newPassword123");

            when(authService.updateUserPassword("nonexistent", "newPassword123"))
                    .thenThrow(new RuntimeException("User not found"));

            // When/Then
            assertThrows(RuntimeException.class, () -> {
                authController.resetPassWord(request);
            });

            verify(authService, times(1)).updateUserPassword("nonexistent", "newPassword123");
            verify(userMapper, never()).toDto(any());
        }
    }

}
