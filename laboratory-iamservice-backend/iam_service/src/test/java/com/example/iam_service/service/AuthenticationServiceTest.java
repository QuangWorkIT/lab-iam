package com.example.iam_service.service;


import com.example.iam_service.entity.Token;
import com.example.iam_service.entity.User;
import com.example.iam_service.repository.RefreshTokenRepository;
import com.example.iam_service.repository.UserRepository;
import com.example.iam_service.security.UserGrantAuthority;
import com.example.iam_service.serviceImpl.AuthenticationServiceImpl;
import com.example.iam_service.util.JwtUtil;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@ExtendWith(MockitoExtension.class)
public class AuthenticationServiceTest {

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
            User loadUser = authenticationService.loadOrCreateUser(payload);

            assertNotNull(loadUser);
            assertEquals("admin@example.com", loadUser.getEmail());
            verify(userRepository, times(1)).findByEmail(payload.getEmail());
            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        void google_CreateNonExistUser_ShouldReturnCreatedUser() {
            GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
            payload.put("given_name", "user first name");
            payload.put("family_name", "user family name");
            payload.setEmail("admin@STAFFgmail.com");

            when(userRepository.findByEmail(payload.getEmail()))
                    .thenReturn(Optional.empty());
            when(userRepository.save(any(User.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            User createdUser = authenticationService.loadOrCreateUser(payload);

            assertNotNull(createdUser);
            assertEquals("admin@STAFFgmail.com", createdUser.getEmail());
            verify(userRepository, times(1)).findByEmail(payload.getEmail());
            verify(userRepository, times(1)).save(any(User.class));
        }

        @Test
        void google_DbException_ShouldThrowException() {
            GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
            payload.put("given_name", "user first name");
            payload.put("family_name", "user family name");
            payload.setEmail("admin@STAFFgmail.com");

            when(userRepository.findByEmail(payload.getEmail()))
                    .thenThrow(new RuntimeException("DB connection failed"));

            User loadedUser = authenticationService.loadOrCreateUser(payload);

            assertNull(loadedUser);
            verify(userRepository, times(1)).findByEmail(payload.getEmail());
            verify(userRepository, never()).save(any(User.class));
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
            // provide a secret key for tests
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

            // Mock the authorities
            List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_USER"));
            when(grantAuthority.getAuthorityByUser(user)).thenReturn(authorities);

            // Act
            String token = jwtUtil.generateToken(user);

            // Assert
            assertNotNull(token);
            assertFalse(token.isEmpty());

            // Decode token to verify payload
            String subject = jwtUtil.getSubject(token);
            assertEquals(user.getUserId().toString(), subject);

            List<GrantedAuthority> userAuthorities = jwtUtil.getUserAuthorities(token);
            assertEquals(1, userAuthorities.size());
            assertEquals("ROLE_USER", userAuthorities.getFirst().getAuthority());

            verify(grantAuthority, times(1)).getAuthorityByUser(user);
        }

        @Test
        void validateToken_ShouldThrowError() {
            String token = "invalidToken";

            JwtException exception = assertThrows(JwtException.class, () -> {
                jwtUtil.validate(token);
            });

            assertTrue(exception.getMessage().contains("JWT validation failed"));
        }
    }

//    @Nested
//    class ForgetPasswordTestGroup {
//        @Test
//        void findUserByEmail_ShouldReturnUser() {
//            String option = "email";
//            String data = "admin@example.com";
//
//            User mockUser = new User();
//            mockUser.setEmail(data);
//            when(userRepository.findByEmail(data)).thenReturn(Optional.of(mockUser));
//
//            User userFound = authenticationService.findUserByEmailOrPhone(option, data);
//
//            assertNotNull(userFound);
//            assertEquals(mockUser.getEmail(), userFound.getEmail());
//            verify(userRepository, times(1)).findByEmail(data);
//            verify(userRepository, times(0)).findByPhoneNumber(data);
//        }
//
//        @Test
//        void findUserByPhone_ShouldReturnUser() {
//            String option = "phone";
//            String data = "0123456789";
//
//            User mockUser = new User();
//            mockUser.setPhoneNumber(data);
//            when(userRepository.findByPhoneNumber(data)).thenReturn(Optional.of(mockUser));
//
//            User userFound = authenticationService.findUserByEmailOrPhone(option, data);
//
//            assertNotNull(userFound);
//            assertEquals(mockUser.getPhoneNumber(), userFound.getPhoneNumber());
//            verify(userRepository, times(0)).findByEmail(data);
//            verify(userRepository, times(1)).findByPhoneNumber(data);
//        }
//
//        @Test
//        void findUserByInvalidOption_ShouldThrowException() {
//            String option = "phoneOrEmail";
//            String data = "invalidData";
//
//            RuntimeException ex = assertThrows(RuntimeException.class, () ->
//                    authenticationService.findUserByEmailOrPhone(option, data));
//
//            assertEquals("Find user by option not found", ex.getMessage());
//        }
//
//        @Test
//        void updatePassword_ValidUser_ShouldSaveNewPassword() {
//            String userid = UUID.randomUUID().toString();
//            String password = "newPassWord";
//
//            User mockUser = new User();
//            mockUser.setUserId(UUID.fromString(userid));
//            mockUser.setPassword("oldPasswordm");
//
//            when(userRepository.findById(UUID.fromString(userid))).thenReturn(Optional.of(mockUser));
//            when(encoder.encode(password)).thenReturn(password);
//            when(userRepository.save(mockUser)).thenReturn(mockUser);
//
//            User userUpdated = authenticationService.updateUserPassword(userid, password);
//
//            assertNotNull(userUpdated);
//            assertEquals(password, userUpdated.getPassword());
//            assertEquals(userid, userUpdated.getUserId().toString());
//            verify(userRepository, times(1)).findById(UUID.fromString(userid));
//            verify(userRepository, times(1)).save(mockUser);
//        }
//
//        @Test
//        void updatePassword_UserNotFound_ShouldThrowException() {
//            String userid = UUID.randomUUID().toString();
//            String password = "newPassword";
//
//            when(userRepository.findById(UUID.fromString(userid))).thenReturn(Optional.empty());
//
//            RuntimeException ex = assertThrows(RuntimeException.class, () ->
//                    authenticationService.updateUserPassword(userid, password)
//            );
//
//            assertEquals("User not found", ex.getMessage());
//            verify(userRepository, times(1)).findById(UUID.fromString(userid));
//            verify(userRepository, never()).save(any(User.class));
//        }
//
//        @Test
//        void updatePassword_SaveFails_ShouldThrowException() {
//            String userid = UUID.randomUUID().toString();
//            String password = "newPassword";
//
//            User mockUser = new User();
//            mockUser.setUserId(UUID.fromString(userid));
//            mockUser.setPassword("oldPassword");
//
//            when(userRepository.findById(UUID.fromString(userid))).thenReturn(Optional.of(mockUser));
//            when(encoder.encode(password)).thenReturn(password);
//            when(userRepository.save(any(User.class)))
//                    .thenThrow(new RuntimeException("Database connection failed"));
//
//            RuntimeException ex = assertThrows(RuntimeException.class, () ->
//                    authenticationService.updateUserPassword(userid, password)
//            );
//
//            assertTrue(ex.getMessage().contains("Database connection failed"));
//            verify(userRepository, times(1)).findById(UUID.fromString(userid));
//            verify(userRepository, times(1)).save(any(User.class));
//        }
//    }
}
