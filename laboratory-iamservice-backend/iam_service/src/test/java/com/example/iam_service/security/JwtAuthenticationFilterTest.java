package com.example.iam_service.security;


import com.example.iam_service.entity.User;
import com.example.iam_service.repository.UserRepository;
import com.example.iam_service.util.JwtUtil;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class JwtAuthenticationFilterTest {


    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private UserRepository userRepository;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private User testUser;
    private String validToken;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        testUser = new User();
        testUser.setUserId(testUserId);
        testUser.setEmail("test@example.com");
        testUser.setFullName("Test User");
        testUser.setRoleCode("ROLE_ADMIN");
        testUser.setIsActive(true);
        testUser.setIsDeleted(false);

        validToken = "valid.jwt.token";

        // Clear security context before each test
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        // Clear security context after each test
        SecurityContextHolder.clearContext();
    }

    // ==================== PUBLIC ENDPOINTS TESTS ====================

    @Test
    @DisplayName("Should allow access to /auth endpoint without token")
    void doFilterInternal_authEndpoint_shouldBypassAuthentication() throws ServletException, IOException {
        // Arrange
        when(request.getRequestURI()).thenReturn("/auth/login");

        // Act
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(filterChain).doFilter(request, response);
        verify(jwtUtil, never()).validate(anyString());
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    @DisplayName("Should allow access to /api/auth endpoint without token")
    void doFilterInternal_apiAuthEndpoint_shouldBypassAuthentication() throws ServletException, IOException {
        // Arrange
        when(request.getRequestURI()).thenReturn("/api/auth/register");

        // Act
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(filterChain).doFilter(request, response);
        verify(jwtUtil, never()).validate(anyString());
    }

    @Test
    @DisplayName("Should allow access to /iam/api/auth endpoint without token")
    void doFilterInternal_iamApiAuthEndpoint_shouldBypassAuthentication() throws ServletException, IOException {
        // Arrange
        when(request.getRequestURI()).thenReturn("/iam/api/auth/forgot-password");

        // Act
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(filterChain).doFilter(request, response);
        verify(jwtUtil, never()).validate(anyString());
    }

    @Test
    @DisplayName("Should allow access to /v3/api-docs endpoint without token")
    void doFilterInternal_swaggerApiDocsEndpoint_shouldBypassAuthentication() throws ServletException, IOException {
        // Arrange
        when(request.getRequestURI()).thenReturn("/v3/api-docs");

        // Act
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(filterChain).doFilter(request, response);
        verify(jwtUtil, never()).validate(anyString());
    }

    @Test
    @DisplayName("Should allow access to /swagger-ui endpoint without token")
    void doFilterInternal_swaggerUiEndpoint_shouldBypassAuthentication() throws ServletException, IOException {
        // Arrange
        when(request.getRequestURI()).thenReturn("/swagger-ui/index.html");

        // Act
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(filterChain).doFilter(request, response);
        verify(jwtUtil, never()).validate(anyString());
    }

    @Test
    @DisplayName("Should allow access to /swagger-ui.html endpoint without token")
    void doFilterInternal_swaggerUiHtmlEndpoint_shouldBypassAuthentication() throws ServletException, IOException {
        // Arrange
        when(request.getRequestURI()).thenReturn("/swagger-ui.html");

        // Act
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(filterChain).doFilter(request, response);
        verify(jwtUtil, never()).validate(anyString());
    }

    @Test
    @DisplayName("Should allow access to /actuator/ endpoint without token")
    void doFilterInternal_actuatorEndpoint_shouldBypassAuthentication() throws ServletException, IOException {
        // Arrange
        when(request.getRequestURI()).thenReturn("/actuator/health");

        // Act
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(filterChain).doFilter(request, response);
        verify(jwtUtil, never()).validate(anyString());
    }

    @Test
    @DisplayName("Should allow access to /internal/ endpoint without token")
    void doFilterInternal_internalEndpoint_shouldBypassAuthentication() throws ServletException, IOException {
        // Arrange
        when(request.getRequestURI()).thenReturn("/internal/metrics");

        // Act
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(filterChain).doFilter(request, response);
        verify(jwtUtil, never()).validate(anyString());
    }

    // ==================== NO AUTH HEADER TESTS ====================

    @Test
    @DisplayName("Should bypass authentication when no auth header present")
    void doFilterInternal_noAuthHeader_shouldBypassAuthentication() throws ServletException, IOException {
        // Arrange
        when(request.getRequestURI()).thenReturn("/api/users");
        when(request.getHeader("X-Auth-Token")).thenReturn(null);
        when(request.getHeader("Authorization")).thenReturn(null);

        // Act
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(filterChain).doFilter(request, response);
        verify(jwtUtil, never()).validate(anyString());
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    // ==================== VALID TOKEN TESTS ====================

    @Test
    @DisplayName("Should authenticate with valid Bearer token from Authorization header")
    void doFilterInternal_validBearerToken_shouldAuthenticate() throws ServletException, IOException {
        // Arrange
        when(request.getRequestURI()).thenReturn("/api/users");
        when(request.getHeader("X-Auth-Token")).thenReturn(null);
        when(request.getHeader("Authorization")).thenReturn("Bearer " + validToken);
        when(jwtUtil.validate(validToken)).thenReturn(testUserId.toString());
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));

        List<GrantedAuthority> authorities = Arrays.asList(
                new SimpleGrantedAuthority("ROLE_ADMIN"),
                new SimpleGrantedAuthority("VIEW_USER")
        );
        when(jwtUtil.getUserAuthorities(validToken)).thenReturn(authorities);

        // Act
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(jwtUtil).validate(validToken);
        verify(userRepository).findById(testUserId);
        verify(filterChain).doFilter(request, response);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth);
        assertEquals(testUser, auth.getPrincipal());
        assertEquals(2, auth.getAuthorities().size());
    }

    @Test
    @DisplayName("Should authenticate with valid token from X-Auth-Token header")
    void doFilterInternal_validXAuthToken_shouldAuthenticate() throws ServletException, IOException {
        // Arrange
        when(request.getRequestURI()).thenReturn("/api/users");
        when(request.getHeader("X-Auth-Token")).thenReturn(validToken);
        when(jwtUtil.validate(validToken)).thenReturn(testUserId.toString());
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));

        List<GrantedAuthority> authorities = Arrays.asList(
                new SimpleGrantedAuthority("ROLE_USER")
        );
        when(jwtUtil.getUserAuthorities(validToken)).thenReturn(authorities);

        // Act
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(jwtUtil).validate(validToken);
        verify(userRepository).findById(testUserId);
        verify(filterChain).doFilter(request, response);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth);
        assertEquals(testUser, auth.getPrincipal());
    }

    @Test
    @DisplayName("Should authenticate with token without Bearer prefix")
    void doFilterInternal_tokenWithoutBearerPrefix_shouldAuthenticate() throws ServletException, IOException {
        // Arrange
        when(request.getRequestURI()).thenReturn("/api/users");
        when(request.getHeader("X-Auth-Token")).thenReturn(null);
        when(request.getHeader("Authorization")).thenReturn(validToken);
        when(jwtUtil.validate(validToken)).thenReturn(testUserId.toString());
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));

        List<GrantedAuthority> authorities = Arrays.asList(
                new SimpleGrantedAuthority("ROLE_PATIENT")
        );
        when(jwtUtil.getUserAuthorities(validToken)).thenReturn(authorities);

        // Act
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(jwtUtil).validate(validToken);
        verify(filterChain).doFilter(request, response);
        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    @DisplayName("Should trim whitespace from Bearer token")
    void doFilterInternal_bearerTokenWithWhitespace_shouldTrimAndAuthenticate() throws ServletException, IOException {
        // Arrange
        String tokenWithSpaces = "  " + validToken + "  ";
        when(request.getRequestURI()).thenReturn("/api/users");
        when(request.getHeader("X-Auth-Token")).thenReturn(null);
        when(request.getHeader("Authorization")).thenReturn("Bearer " + tokenWithSpaces);
        when(jwtUtil.validate(validToken)).thenReturn(testUserId.toString());
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(jwtUtil.getUserAuthorities(validToken)).thenReturn(Arrays.asList(
                new SimpleGrantedAuthority("ROLE_ADMIN")
        ));

        // Act
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(jwtUtil).validate(validToken);
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Should prioritize X-Auth-Token over Authorization header")
    void doFilterInternal_bothHeaders_shouldPrioritizeXAuthToken() throws ServletException, IOException {
        // Arrange
        String xAuthToken = "x-auth-token-value";
        when(request.getRequestURI()).thenReturn("/api/users");
        when(request.getHeader("X-Auth-Token")).thenReturn(xAuthToken);
        when(jwtUtil.validate(xAuthToken)).thenReturn(testUserId.toString());
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(jwtUtil.getUserAuthorities(xAuthToken)).thenReturn(Arrays.asList(
                new SimpleGrantedAuthority("ROLE_ADMIN")
        ));

        // Act
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(jwtUtil).validate(xAuthToken);
        verify(jwtUtil, never()).validate("different-token");
    }

    // ==================== INVALID TOKEN TESTS ====================

    @Test
    @DisplayName("Should return 401 when JWT validation fails")
    void doFilterInternal_invalidToken_shouldReturn401() throws ServletException, IOException {
        // Arrange
        StringWriter stringWriter = new StringWriter();
        PrintWriter writer = new PrintWriter(stringWriter);

        when(request.getRequestURI()).thenReturn("/api/users");
        when(request.getHeader("X-Auth-Token")).thenReturn(null);
        when(request.getHeader("Authorization")).thenReturn("Bearer invalid-token");
        when(jwtUtil.validate("invalid-token")).thenThrow(new JwtException("Token expired"));
        when(response.getWriter()).thenReturn(writer);

        // Act
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        verify(response).setContentType("application/json");
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain, never()).doFilter(any(), any());

        String responseBody = stringWriter.toString();
        assertTrue(responseBody.contains("Unauthorized request IAM Service"));
        assertTrue(responseBody.contains("JWT invalid or expired"));
    }

    @Test
    @DisplayName("Should return 401 when JWT throws JwtException")
    void doFilterInternal_jwtException_shouldReturn401() throws ServletException, IOException {
        // Arrange
        StringWriter stringWriter = new StringWriter();
        PrintWriter writer = new PrintWriter(stringWriter);

        when(request.getRequestURI()).thenReturn("/api/users");
        when(request.getHeader("X-Auth-Token")).thenReturn(null);
        when(request.getHeader("Authorization")).thenReturn("Bearer " + validToken);
        when(jwtUtil.validate(validToken)).thenThrow(new JwtException("Malformed JWT"));
        when(response.getWriter()).thenReturn(writer);

        // Act
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    @DisplayName("Should return 401 when user not found in database")
    void doFilterInternal_userNotFound_shouldReturn401() throws ServletException, IOException {
        // Arrange
        StringWriter stringWriter = new StringWriter();
        PrintWriter writer = new PrintWriter(stringWriter);

        when(request.getRequestURI()).thenReturn("/api/users");
        when(request.getHeader("X-Auth-Token")).thenReturn(null);
        when(request.getHeader("Authorization")).thenReturn("Bearer " + validToken);
        when(jwtUtil.validate(validToken)).thenReturn(testUserId.toString());
        when(userRepository.findById(testUserId)).thenReturn(Optional.empty());
        when(response.getWriter()).thenReturn(writer);

        // Act
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        verify(response).setContentType("application/json");
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain, never()).doFilter(any(), any());
    }

    @Test
    @DisplayName("Should return 401 when UsernameNotFoundException is thrown")
    void doFilterInternal_usernameNotFoundException_shouldReturn401() throws ServletException, IOException {
        // Arrange
        StringWriter stringWriter = new StringWriter();
        PrintWriter writer = new PrintWriter(stringWriter);

        when(request.getRequestURI()).thenReturn("/api/users");
        when(request.getHeader("X-Auth-Token")).thenReturn(null);
        when(request.getHeader("Authorization")).thenReturn("Bearer " + validToken);
        when(jwtUtil.validate(validToken)).thenThrow(new UsernameNotFoundException("User not found"));
        when(response.getWriter()).thenReturn(writer);

        // Act
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    @DisplayName("Should clear security context on authentication failure")
    void doFilterInternal_authenticationFailure_shouldClearSecurityContext() throws ServletException, IOException {
        // Arrange
        StringWriter stringWriter = new StringWriter();
        PrintWriter writer = new PrintWriter(stringWriter);

        // Set up an existing authentication
        SecurityContextHolder.getContext().setAuthentication(
                mock(Authentication.class)
        );

        when(request.getRequestURI()).thenReturn("/api/users");
        when(request.getHeader("X-Auth-Token")).thenReturn(null);
        when(request.getHeader("Authorization")).thenReturn("Bearer invalid-token");
        when(jwtUtil.validate("invalid-token")).thenThrow(new JwtException("Invalid token"));
        when(response.getWriter()).thenReturn(writer);

        // Act
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Assert
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    }

    // ==================== EDGE CASES ====================

    @Test
    @DisplayName("Should handle token with extra whitespace")
    void doFilterInternal_tokenWithExtraWhitespace_shouldAuthenticate() throws ServletException, IOException {
        // Arrange
        String tokenWithSpaces = "   " + validToken + "   ";
        when(request.getRequestURI()).thenReturn("/api/users");
        when(request.getHeader("X-Auth-Token")).thenReturn(tokenWithSpaces);
        when(jwtUtil.validate(validToken)).thenReturn(testUserId.toString());
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(jwtUtil.getUserAuthorities(validToken)).thenReturn(Arrays.asList(
                new SimpleGrantedAuthority("ROLE_ADMIN")
        ));

        // Act
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(jwtUtil).validate(validToken);
        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    @DisplayName("Should handle empty authorities list")
    void doFilterInternal_emptyAuthorities_shouldStillAuthenticate() throws ServletException, IOException {
        // Arrange
        when(request.getRequestURI()).thenReturn("/api/users");
        when(request.getHeader("X-Auth-Token")).thenReturn(null);
        when(request.getHeader("Authorization")).thenReturn("Bearer " + validToken);
        when(jwtUtil.validate(validToken)).thenReturn(testUserId.toString());
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(jwtUtil.getUserAuthorities(validToken)).thenReturn(Arrays.asList()); // Empty list

        // Act
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(filterChain).doFilter(request, response);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth);
        assertEquals(0, auth.getAuthorities().size());
    }

    @Test
    @DisplayName("Should handle multiple authorities")
    void doFilterInternal_multipleAuthorities_shouldAuthenticate() throws ServletException, IOException {
        // Arrange
        when(request.getRequestURI()).thenReturn("/api/users");
        when(request.getHeader("X-Auth-Token")).thenReturn(null);
        when(request.getHeader("Authorization")).thenReturn("Bearer " + validToken);
        when(jwtUtil.validate(validToken)).thenReturn(testUserId.toString());
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));

        List<GrantedAuthority> authorities = Arrays.asList(
                new SimpleGrantedAuthority("ROLE_ADMIN"),
                new SimpleGrantedAuthority("CREATE_USER"),
                new SimpleGrantedAuthority("DELETE_USER"),
                new SimpleGrantedAuthority("VIEW_USER"),
                new SimpleGrantedAuthority("MODIFY_USER")
        );
        when(jwtUtil.getUserAuthorities(validToken)).thenReturn(authorities);

        // Act
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(filterChain).doFilter(request, response);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth);
        assertEquals(5, auth.getAuthorities().size());
    }

}
