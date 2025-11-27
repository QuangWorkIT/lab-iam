package com.example.iam_service.controller;


import com.example.iam_service.dto.user.UserDTO;
import com.example.iam_service.dto.request.*;
import com.example.iam_service.dto.response.ApiResponse;
import com.example.iam_service.dto.response.auth.TokenResponse;
import com.example.iam_service.entity.Token;
import com.example.iam_service.entity.User;
import com.example.iam_service.mapper.UserMapper;
import com.example.iam_service.service.EmailService;
import com.example.iam_service.serviceImpl.AuthenticationServiceImpl;
import com.example.iam_service.serviceImpl.LoginLimiterServiceImpl;
import com.example.iam_service.serviceImpl.ResetPasswordRateLimiterImpl;
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

import java.time.Instant;
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

    @Mock
    private ResetPasswordRateLimiterImpl resetPasswordRateLimiterService;

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

            ResponseEntity<ApiResponse<?>> response =
                    authController.login(loginRq, null, servletRequest);

            assertEquals(200, response.getStatusCode().value());
            assertNotNull(response.getBody());
            assertEquals("login success", response.getBody().getMessage());
            TokenResponse tokenResponse = (TokenResponse) response.getBody().getData();
            assertEquals("access123", tokenResponse.getAccessToken());
            assertEquals("refresh123", tokenResponse.getRefreshToken());
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
            ResponseEntity<ApiResponse<?>> response =
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
            ResponseEntity<ApiResponse<?>> response =
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
            when(authService.loadUserByLoginGoogle(payload)).thenReturn(user);
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
            verify(authService, times(1)).loadUserByLoginGoogle(payload);
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

        // ✅ 1. Missing current password when option is "change"
        @Test
        void resetPassword_ShouldReturn400_WhenCurrentPasswordMissingForChange() {
            ResetPassWordRequest request = new ResetPassWordRequest();
            request.setUserid("abc-123");
            request.setPassword("newPassword123");
            request.setOption("change");
            request.setCurrentPassword(null);

            when(servletRequest.getRemoteAddr()).thenReturn("127.0.0.1");
            when(resetPasswordRateLimiterService.isBannedFromResetPassword("127.0.0.1")).thenReturn(false);

            ResponseEntity<ApiResponse<UserDTO>> response = authController.resetPassWord(request, servletRequest);

            assertEquals(400, response.getStatusCode().value());
            assertEquals("Error", response.getBody().getStatus());
            assertEquals("Current password is missing for change password process", response.getBody().getMessage());

            verify(authService, never()).updateUserPassword(any(), any(), any(), any());
            verify(resetPasswordRateLimiterService, never()).recordResetPassAttempt(any());
        }

        // ✅ 2. Success case (option = "change")
        @Test
        void resetPassword_ShouldReturn200_WhenPasswordUpdatedSuccessfully() {
            ResetPassWordRequest request = new ResetPassWordRequest();
            request.setUserid("abc-123");
            request.setPassword("newPass123");
            request.setCurrentPassword("oldPass123");
            request.setOption("change");

            User user = new User();
            user.setUserId(UUID.randomUUID());
            user.setEmail("user@example.com");

            UserDTO userDTO = new UserDTO();
            userDTO.setEmail("user@example.com");

            when(servletRequest.getRemoteAddr()).thenReturn("127.0.0.1");
            when(resetPasswordRateLimiterService.isBannedFromResetPassword("127.0.0.1")).thenReturn(false);
            when(authService.updateUserPassword(any(), any(), any(), any())).thenReturn(user);
            when(userMapper.toDto(user)).thenReturn(userDTO);

            ResponseEntity<ApiResponse<UserDTO>> response = authController.resetPassWord(request, servletRequest);

            assertEquals(200, response.getStatusCode().value());
            assertEquals("success", response.getBody().getStatus());
            assertEquals("Update password successfully!", response.getBody().getMessage());
            assertEquals("user@example.com", response.getBody().getData().getEmail());

            verify(authService, times(1)).updateUserPassword(
                    request.getUserid(), request.getPassword(), request.getCurrentPassword(), request.getOption());
            verify(resetPasswordRateLimiterService, times(1)).recordResetPassAttempt("127.0.0.1");
        }

        // ✅ 3. Rate limit exceeded (429)
        @Test
        void resetPassword_ShouldReturn429_WhenRateLimitExceeded() {
            ResetPassWordRequest request = new ResetPassWordRequest();
            request.setUserid("abc-123");
            request.setPassword("newPass");
            request.setOption("change");

            when(servletRequest.getRemoteAddr()).thenReturn("192.168.0.1");
            when(resetPasswordRateLimiterService.isBannedFromResetPassword("192.168.0.1")).thenReturn(true);
            when(resetPasswordRateLimiterService.getUserBanUntil("192.168.0.1")).thenReturn(Instant.now().plusSeconds(2 * 60 * 60));
            ResponseEntity<ApiResponse<UserDTO>> response = authController.resetPassWord(request, servletRequest);

            assertEquals(429, response.getStatusCode().value());
            assertEquals("Too many reset password attempts", response.getBody().getMessage());

            verify(authService, never()).updateUserPassword(any(), any(), any(), any());
            verify(resetPasswordRateLimiterService, never()).recordResetPassAttempt(any());
        }

        // ✅ 4. Successful password reset with option = "reset" (no current password required)
        @Test
        void resetPassword_ShouldReturn200_WhenOptionIsReset() {
            ResetPassWordRequest request = new ResetPassWordRequest();
            request.setUserid("abc-123");
            request.setPassword("resetPass123");
            request.setOption("reset");
            request.setCurrentPassword(null);

            User user = new User();
            user.setUserId(UUID.randomUUID());
            user.setEmail("reset@example.com");

            UserDTO userDTO = new UserDTO();
            userDTO.setEmail("reset@example.com");

            when(servletRequest.getRemoteAddr()).thenReturn("127.0.0.2");
            when(resetPasswordRateLimiterService.isBannedFromResetPassword("127.0.0.2")).thenReturn(false);
            when(authService.updateUserPassword(any(), any(), any(), any())).thenReturn(user);
            when(userMapper.toDto(user)).thenReturn(userDTO);

            ResponseEntity<ApiResponse<UserDTO>> response = authController.resetPassWord(request, servletRequest);

            assertEquals(200, response.getStatusCode().value());
            assertEquals("success", response.getBody().getStatus());
            assertEquals("Update password successfully!", response.getBody().getMessage());
            assertEquals("reset@example.com", response.getBody().getData().getEmail());

            verify(authService, times(1)).updateUserPassword(any(), any(), any(), any());
            verify(resetPasswordRateLimiterService, times(1)).recordResetPassAttempt("127.0.0.2");
        }

        // ✅ 5. authService throws RuntimeException (User not found)
        @Test
        void resetPassword_ShouldThrowIllegalArgument_WhenUserNotFound() {
            ResetPassWordRequest request = new ResetPassWordRequest();
            request.setUserid("abc-123");
            request.setPassword("newPass");
            request.setCurrentPassword("oldPass");
            request.setOption("change");

            when(servletRequest.getRemoteAddr()).thenReturn("127.0.0.3");
            when(resetPasswordRateLimiterService.isBannedFromResetPassword("127.0.0.3")).thenReturn(false);
            when(authService.updateUserPassword(any(), any(), any(), any()))
                    .thenThrow(new IllegalArgumentException("User not found"));

            IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () ->
                    authController.resetPassWord(request, servletRequest)
            );

            assertEquals("User not found", thrown.getMessage());
            verify(resetPasswordRateLimiterService, times(1)).recordResetPassAttempt("127.0.0.3");
        }

        // ✅ 6. authService throws IllegalArgumentException (Password same as old one)
        @Test
        void resetPassword_ShouldThrowIllegalArgument_WhenPasswordSameAsOld() {
            ResetPassWordRequest request = new ResetPassWordRequest();
            request.setUserid("abc-123");
            request.setPassword("samePassword");
            request.setCurrentPassword("samePassword");
            request.setOption("change");

            when(servletRequest.getRemoteAddr()).thenReturn("127.0.0.4");
            when(resetPasswordRateLimiterService.isBannedFromResetPassword("127.0.0.4")).thenReturn(false);
            when(authService.updateUserPassword(any(), any(), any(), any()))
                    .thenThrow(new IllegalArgumentException("Password must be different from the old one"));

            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                    authController.resetPassWord(request, servletRequest)
            );

            assertEquals("Password must be different from the old one", ex.getMessage());
            verify(resetPasswordRateLimiterService, times(1)).recordResetPassAttempt("127.0.0.4");
        }

        @Test
        void resetPassword_ShouldThrowIllegalArgument_WhenCurrentPasswordNotMatch() {
            ResetPassWordRequest request = new ResetPassWordRequest();
            request.setUserid("abc-123");
            request.setPassword("samePassword");
            request.setCurrentPassword("samePassword");
            request.setOption("change");

            User mockUser = new User();
            mockUser.setPassword("notSamePassword");

            when(servletRequest.getRemoteAddr()).thenReturn("127.0.0.4");
            when(resetPasswordRateLimiterService.isBannedFromResetPassword("127.0.0.4")).thenReturn(false);
            when(authService.updateUserPassword(any(), any(), any(), any()))
                    .thenThrow(new IllegalArgumentException("Current password does not match"));

            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                    authController.resetPassWord(request, servletRequest)
            );

            assertEquals("Current password does not match", ex.getMessage());
            verify(resetPasswordRateLimiterService, times(1)).recordResetPassAttempt("127.0.0.4");
        }
    }


}
