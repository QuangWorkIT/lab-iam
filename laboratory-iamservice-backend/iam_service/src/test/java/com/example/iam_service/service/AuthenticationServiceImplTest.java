package com.example.iam_service.service;


import com.example.iam_service.audit.AuditPublisher;
import com.example.iam_service.entity.Token;
import com.example.iam_service.entity.User;
import com.example.iam_service.repository.RefreshTokenRepository;
import com.example.iam_service.repository.UserRepository;
import com.example.iam_service.security.UserGrantAuthority;
import com.example.iam_service.serviceImpl.AuthenticationServiceImpl;
import com.example.iam_service.util.JwtUtil;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@ExtendWith(MockitoExtension.class)
public class AuthenticationServiceImplTest {

    @Mock
    private BCryptPasswordEncoder encoder;

    @Mock
    private GoogleIdTokenVerifier googleIdTokenVerifier;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshRepo;

    @Mock
    private UserGrantAuthority grantAuthority;
    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuditPublisher auditPublisher;
    @InjectMocks
    private AuthenticationServiceImpl authenticationService; // Test class

    @Test
    void testGetTokens_ReturnsAccessAndRefreshTokens() {
        User mockUser = new User();
        mockUser.setEmail("test@example.com");
        mockUser.setFullName("Test User");

        // Arrange
        String expectedAccessToken = "mock-access-token";
        String expectedRefreshTokenId = "mock-refresh-token-id";

        // Mock jwtUtil.generateToken()
        when(jwtUtil.generateToken(mockUser)).thenReturn(expectedAccessToken);

        // Mock refreshRepo.save() inside generateRefreshToken()
        Token mockToken = new Token();
        mockToken.setTokenId(expectedRefreshTokenId);
        mockToken.setUser(mockUser);
        mockToken.setExpiredAt(LocalDateTime.now().plusDays(1));
        when(refreshRepo.save(any(Token.class))).thenReturn(mockToken);

        // Act
        Map<String, String> tokens = authenticationService.getTokens(mockUser);

        // Assert
        assertNotNull(tokens);
        assertEquals(expectedAccessToken, tokens.get("accessToken"));
        assertEquals(expectedRefreshTokenId, tokens.get("refreshToken"));

        // Verify interactions
        verify(jwtUtil, times(1)).generateToken(mockUser);
        verify(refreshRepo, times(1)).save(any(Token.class));
    }

    @Nested
    class LoginTestGroup {
        @Test
        void login_Valid_ShouldReturnUser() {
            // Given - Setup test data and mock behavior
            String email = "admin@example.com";
            String password = "admin123ADMIN";

            // Create a mock user
            User mockUser = new User();
            mockUser.setIsActive(true);
            mockUser.setIsDeleted(false);
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
            mockUser.setIsActive(true);
            mockUser.setIsDeleted(false);
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

        @Test
        void login_InvalidEmailAndPass_ShouldThrowEmailError() {
            String email = "ain@example.com";
            String password = "admin123STAFF";

            User mockerUser = new User();
            mockerUser.setEmail(email);
            mockerUser.setPassword(password);

            when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
            UsernameNotFoundException exception = assertThrows(UsernameNotFoundException.class, () -> {
                authenticationService.login(email, password);
            });

            assertEquals("Email not found", exception.getMessage());
            verify(userRepository, times(1)).findByEmail(email);
            verify(encoder, times(0)).matches(password, mockerUser.getPassword());
        }
    }

    @Nested
    class GoogleServiceTestGroup {
        @Test
        void testGetPayload_ReturnsExpectedPayload() throws Exception {
            GoogleIdToken mockGoogleIdToken = mock(GoogleIdToken.class);

            // Arrange
            String fakeTokenId = "fake-google-token";
            GoogleIdToken.Payload mockPayload = new GoogleIdToken.Payload();

            // mock googleIdTokenVerifier.verify() → returns mock GoogleIdToken
            when(googleIdTokenVerifier.verify(fakeTokenId)).thenReturn(mockGoogleIdToken);
            // mock GoogleIdToken.getPayload() → returns mock payload
            when(mockGoogleIdToken.getPayload()).thenReturn(mockPayload);

            // Act
            GoogleIdToken.Payload result = authenticationService.getPayload(fakeTokenId);

            // Assert
            assertNotNull(result);
            assertEquals(mockPayload, result);

            // Verify method calls
            verify(googleIdTokenVerifier, times(1)).verify(fakeTokenId);
            verify(mockGoogleIdToken, times(1)).getPayload();
        }

        @Test
        void google_ValidToken_ShouldReturnIdToken() throws GeneralSecurityException, IOException {
            String validCredential = "valiGoogleToken";
            GoogleIdToken mockToken = mock(GoogleIdToken.class);

            when(googleIdTokenVerifier.verify(validCredential)).thenReturn(mockToken);

            // actual test
            GoogleIdToken result = authenticationService.verifyGoogleCredential(validCredential);

            assertEquals(result, mockToken);
            verify(googleIdTokenVerifier, times(1)).verify(validCredential);
        }

        @Test
        void google_InvalidToken_ShouldThrowTokenException() throws GeneralSecurityException, IOException {
            String invalidCredential = "invalidGoogleToken";

            when(googleIdTokenVerifier.verify(invalidCredential))
                    .thenThrow(new RuntimeException("Error verify google id"));

            Exception exception = assertThrows(RuntimeException.class, () -> {
                authenticationService.verifyGoogleCredential(invalidCredential);
            });

            assertTrue(exception.getMessage().contains("Error verify google id"));
            verify(googleIdTokenVerifier, times(1)).verify(invalidCredential);
        }

        @Test
        void google_LoadExistUser_ShouldReturnUser() {
            User existedUser = new User();
            existedUser.setEmail("admin@example.com");

            GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
            payload.put("given_name", "user first name");
            payload.put("family_name", "user family name");
            payload.setEmail("admin@example.com");

            when(userRepository.findByEmail(payload.getEmail()))
                    .thenReturn(Optional.of(existedUser));

            // act
            User loadUser = authenticationService.loadUserByLoginGoogle(payload);

            assertNotNull(loadUser);
            assertEquals("admin@example.com", loadUser.getEmail());
            verify(userRepository, times(1)).findByEmail(payload.getEmail());
            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        void google_LoginNonExistUser_ShouldThrowException() {
            GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
            payload.setEmail("missing@gmail.com");

            when(userRepository.findByEmail(payload.getEmail()))
                    .thenReturn(Optional.empty());

            assertThrows(
                    UsernameNotFoundException.class,
                    () -> authenticationService.loadUserByLoginGoogle(payload)
            );

            verify(userRepository, times(1)).findByEmail(payload.getEmail());
            verify(userRepository, never()).save(any());
        }
    }

    @Nested
    class RefreshTokenServiceTestGroup {

        @Test
        void refreshToken_VerifyToken_ShouldReturnTokenObject() {
            String tokenId = "validTokenId";
            Token refreshToken = new Token();
            refreshToken.setTokenId(tokenId);
            refreshToken.setExpiredAt(LocalDateTime.now().plusMinutes(10));

            when(refreshRepo.findByTokenId(tokenId)).thenReturn(Optional.of(refreshToken));

            Token tokenFound = authenticationService.verifyRefreshToken(tokenId);

            assertNotNull(tokenFound);
            assertEquals("validTokenId", tokenFound.getTokenId());
            verify(refreshRepo, times(1)).findByTokenId(tokenId);
        }

        @Test
        void refreshToken_TokenExpired_ShouldReturnNull() {
            String tokenId = "expireTokenId";
            Token refreshToken = new Token();
            refreshToken.setTokenId(tokenId);
            refreshToken.setExpiredAt(LocalDateTime.now().minusMinutes(10));

            when(refreshRepo.findByTokenId(tokenId)).thenReturn(Optional.of(refreshToken));

            Token tokenFound = authenticationService.verifyRefreshToken(tokenId);

            assertNull(tokenFound);
            assertTrue(LocalDateTime.now().isAfter(refreshToken.getExpiredAt()));
            verify(refreshRepo, times(1)).findByTokenId(tokenId);
        }

        @Test
        void refreshToken_TokenNotFound_ShouldReturnNull() {
            // Arrange
            String tokenId = "missingTokenId";

            // The repository returns an empty Optional → findByToken() returns null
            when(refreshRepo.findByTokenId(tokenId)).thenReturn(Optional.empty());

            // Act
            Token tokenFound = authenticationService.verifyRefreshToken(tokenId);

            // Assert
            assertNull(tokenFound); // expected null when token is not found
            verify(refreshRepo, times(1)).findByTokenId(tokenId);
        }

        @Test
        void deleteToken_ShouldCallRepository() {
            // Arrange
            String tokenId = "sampleTokenId";

            // Act
            authenticationService.deleteToken(tokenId);

            // Assert
            verify(refreshRepo, times(1)).deleteByTokenId(tokenId);
        }

        @Test
        void deleteToken_WhenRepositoryThrowsException_ShouldThrowRuntimeException() {
            // Arrange
            String tokenId = "sampleTokenId";
            doThrow(new RuntimeException("DB error")).when(refreshRepo).deleteByTokenId(tokenId);

            // Act & Assert
            RuntimeException ex = assertThrows(RuntimeException.class, () ->
                    authenticationService.deleteToken(tokenId));

            assertTrue(ex.getMessage().contains("Error delete refresh token"));
            verify(refreshRepo, times(1)).deleteByTokenId(tokenId);
        }
    }

    @Nested
    class JwtTokenServiceTestGroup {

        private JwtUtil jwtUtil;

        @Mock
        private UserGrantAuthority grantAuthority;

        @BeforeEach
        void setUp() {
            MockitoAnnotations.openMocks(this);

            String secret = "my-very-secret-key-which-is-long-enough-12345";
            jwtUtil = new JwtUtil(secret, grantAuthority);
        }

        @Test
        void generateToken_ShouldReturnValidJwt() {
            // Arrange
            User user = new User();
            user.setUserId(UUID.randomUUID());
            user.setEmail("test@example.com");
            user.setFullName("John Doe");
            user.setRoleCode("ROLE_USER");
            user.setIsActive(true);
            user.setIsDeleted(false);

            // IMPORTANT: generateToken() does not add "privileges" claim
            when(grantAuthority.getAuthorityByUser(user))
                    .thenReturn(List.of(new SimpleGrantedAuthority("ROLE_USER")));

            // Act
            String token = jwtUtil.generateToken(user);

            // Assert
            assertNotNull(token);
            assertFalse(token.isEmpty());

            // JWT should contain USER ID as subject
            assertEquals(user.getUserId().toString(), jwtUtil.getSubject(token));

            // JWT should contain core claims
            Claims claims = Jwts.parser()
                    .verifyWith((SecretKey) new SecretKeySpec(
                            "my-very-secret-key-which-is-long-enough-12345".getBytes(StandardCharsets.UTF_8),
                            "HmacSHA256"))
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            assertEquals("John Doe", claims.get("userName"));
            assertEquals("ROLE_USER", claims.get("role"));
            assertEquals("test@example.com", claims.get("email"));
            assertEquals("true", claims.get("isActive"));
            assertEquals("false", claims.get("isDeleted"));

            verify(grantAuthority, times(1)).getAuthorityByUser(user);
        }

        @Test
        void validateToken_ShouldThrowError_WhenInvalid() {
            String token = "invalidToken";

            JwtException exception = assertThrows(JwtException.class, () -> {
                jwtUtil.validate(token);
            });

            assertTrue(exception.getMessage().contains("JWT validation failed"));
        }

        @Test
        void getUserAuthoritiesV2_ShouldReturnAuthoritiesFromGrantAuthority() {
            // Arrange
            User user = new User();
            user.setUserId(UUID.randomUUID());
            user.setRoleCode("ROLE_USER");

            List<GrantedAuthority> authorities = List.of(
                    new SimpleGrantedAuthority("ROLE_USER"),
                    new SimpleGrantedAuthority("READ_PRIVILEGE")
            );

            when(grantAuthority.getAuthorityByUser(user)).thenReturn(authorities);

            // Act
            List<GrantedAuthority> result = jwtUtil.getUserAuthoritiesV2(user);

            // Assert
            assertNotNull(result);
            assertEquals(2, result.size());
            assertTrue(result.contains(new SimpleGrantedAuthority("ROLE_USER")));
            assertTrue(result.contains(new SimpleGrantedAuthority("READ_PRIVILEGE")));

            verify(grantAuthority, times(1)).getAuthorityByUser(user);
        }
    }


    @Nested
    class ForgetPasswordTestGroup {
        private String userid;
        private String password;
        private String currentPassword;
        private String option;
        private User mockUser;

        @BeforeEach
        void setup() {
            userid = UUID.randomUUID().toString();
            password = "validPassword123";
            currentPassword = "currentPass123";
            option = "reset";

            mockUser = new User();
            mockUser.setUserId(UUID.fromString(userid));
            mockUser.setIsActive(true);
            mockUser.setIsDeleted(false);
            mockUser.setPassword("OldPassword123");
        }
        @Test
        @DisplayName("Should throw exception if user is inactive")
        void updateUserPassword_ShouldThrow_WhenUserInactive() {
            mockUser.setIsActive(false);
            when(userRepository.findById(UUID.fromString(userid))).thenReturn(Optional.of(mockUser));

            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
                authenticationService.updateUserPassword(userid, "NewPassword123", "OldPassword123", "change");
            });

            assertEquals("User is deleted", ex.getMessage());
            verify(userRepository, times(1)).findById(UUID.fromString(userid));
            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw exception if user is marked deleted")
        void updateUserPassword_ShouldThrow_WhenUserDeleted() {
            mockUser.setIsDeleted(true);
            when(userRepository.findById(UUID.fromString(userid))).thenReturn(Optional.of(mockUser));

            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
                authenticationService.updateUserPassword(userid, "NewPassword123", "OldPassword123", "change");
            });

            assertEquals("User is deleted", ex.getMessage());
            verify(userRepository, times(1)).findById(UUID.fromString(userid));
            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw exception if new password does not match regex")
        void updateUserPassword_ShouldThrow_WhenPasswordInvalidFormat() {
            when(userRepository.findById(UUID.fromString(userid))).thenReturn(Optional.of(mockUser));

            String invalidPassword = "short"; // does not meet regex criteria

            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
                authenticationService.updateUserPassword(userid, invalidPassword, "OldPassword123", "reset");
            });
            assertTrue(ex.getMessage().contains("Password must be at least 8 characters long"));
            verify(userRepository, times(1)).findById(UUID.fromString(userid));
            verify(userRepository, never()).save(any());
        }

        @Test
        void updatePassword_UserNotFound_ShouldThroughNotFoundException() {

            User mockUser = new User();

            when(userRepository.findById(UUID.fromString(userid))).thenReturn(Optional.empty());

            RuntimeException ex = assertThrows(RuntimeException.class, () -> {
                authenticationService.updateUserPassword(userid, password, currentPassword, option);
            });

            assertTrue(ex.getMessage().contains("User not found"));
            verify(userRepository, times(1)).findById(UUID.fromString(userid));
            verify(userRepository, never()).save(mockUser);
        }

        @Test
        void updatePassword_InvalidCurrentPassword_ShouldThroughPasswordInvalidEx() {
            option = "change";
            User mockUser = new User();
            mockUser.setIsActive(true);
            mockUser.setIsDeleted(false);
            mockUser.setPassword(currentPassword);


            when(userRepository.findById(UUID.fromString(userid))).thenReturn(Optional.of(mockUser));
            when(encoder.matches(currentPassword, mockUser.getPassword())).thenReturn(false);
            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,() ->{
               authenticationService.updateUserPassword(userid, password, currentPassword, option);
            });

            assertTrue(ex.getMessage().contains("Current password does not match"));
            verify(userRepository, times(1)).findById(UUID.fromString(userid));
            verify(userRepository, never()).save(mockUser);
        }

        @Test
        void updatePassword_ChangeWithOldPassword_ShouldThrowInvalidEx() {
            currentPassword = password;
            User mockUser = new User();
            mockUser.setIsActive(true);
            mockUser.setIsDeleted(false);
            mockUser.setPassword(currentPassword);

            when(userRepository.findById(UUID.fromString(userid))).thenReturn(Optional.of(mockUser));
            when(encoder.matches(currentPassword, mockUser.getPassword())).thenReturn(true);

            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
                authenticationService.updateUserPassword(userid, password, currentPassword, "change");
            });

            assertTrue(ex.getMessage().contains("Password must be different from the old one"));
            verify(userRepository, times(1)).findById(UUID.fromString(userid));
            verify(userRepository, never()).save(mockUser);
        }

        @Test
        void updatePassword_ValidChangePasswordOption_ShouldSaveNewPassword() {
            UUID uid = UUID.fromString(userid);

            User mockUser = new User();
            mockUser.setUserId(uid);
            mockUser.setIsActive(true);
            mockUser.setIsDeleted(false);
            mockUser.setPassword(currentPassword);

            when(userRepository.findById(uid)).thenReturn(Optional.of(mockUser));
            when(encoder.matches(currentPassword, mockUser.getPassword())).thenReturn(true);
            when(encoder.matches(password, mockUser.getPassword())).thenReturn(false);
            when(encoder.encode(password)).thenReturn("encodedPassword123");
            when(userRepository.save(mockUser)).thenReturn(mockUser);

            User userUpdated = authenticationService.updateUserPassword(
                    userid, password, currentPassword, "change"
            );

            assertEquals("encodedPassword123", userUpdated.getPassword());
            verify(userRepository, times(1)).findById(uid);
            verify(userRepository, times(1)).save(mockUser);
        }
    }


    @Nested
    @DisplayName("searchUserByEmail Tests")
    class SearchUserByEmailTests {

        @Test
        @DisplayName("Should return user when email exists")
        void searchUserByEmail_ShouldReturnUser_WhenEmailExists() {
            String email = "existing@example.com";
            User mockUser = new User();
            mockUser.setUserId(UUID.randomUUID());
            mockUser.setEmail(email);

            when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));

            User result = authenticationService.searchUserByEmail(email);

            assertNotNull(result);
            assertEquals(email, result.getEmail());
            verify(userRepository, times(1)).findByEmail(email);
        }

        @Test
        @DisplayName("Should return null when email does not exist")
        void searchUserByEmail_ShouldReturnNull_WhenEmailDoesNotExist() {
            String email = "missing@example.com";

            when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

            User result = authenticationService.searchUserByEmail(email);

            assertNull(result);
            verify(userRepository, times(1)).findByEmail(email);
        }
    }


}
