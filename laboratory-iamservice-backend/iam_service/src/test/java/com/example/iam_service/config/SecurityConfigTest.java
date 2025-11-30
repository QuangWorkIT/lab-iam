package com.example.iam_service.config;

import com.example.iam_service.security.InternalServiceFilter;
import com.example.iam_service.security.JwtAuthenticationFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.DefaultSecurityFilterChain;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class SecurityConfigTest {
    private SecurityConfig securityConfig;

    @BeforeEach
    void setUp() {
        // Create a real instance of the config class
        securityConfig = new SecurityConfig();
    }

    @Test
    void testSecurityFilterChainBeanCreation() throws Exception {
        /*
         * SecurityFilterChain is built by Spring internally using HttpSecurity.
         * Cannot instantiate HttpSecurity directly without a running Spring context,
         * so the standard unit-testing method is to MOCK HttpSecurity instead.
         */

        HttpSecurity http = Mockito.mock(HttpSecurity.class, RETURNS_DEEP_STUBS);

        // Mock the filters injected into the security config
        JwtAuthenticationFilter jwtFilter = mock(JwtAuthenticationFilter.class);
        InternalServiceFilter internalFilter = mock(InternalServiceFilter.class);

        // Mocking the final return of http.build()
        DefaultSecurityFilterChain fakeChain =
                new DefaultSecurityFilterChain(new AntPathRequestMatcher("/**"));
        when(http.build()).thenReturn( fakeChain);

        /*
         * Call the method under test.
         * If any misconfiguration exists, this line will throw an exception.
         */
        SecurityFilterChain result =
                securityConfig.securityFilterChain(http, jwtFilter, internalFilter);

        // Assert: we MUST get a chain and not null
        assertNotNull(result, "SecurityFilterChain should not be null");

        // Verify that http.build() was actually executed
        verify(http, times(1)).build();
    }

    @Test
    void testAuthenticationManagerBeanCreation() throws Exception {
        /*
         * AuthenticationManager comes from AuthenticationConfiguration.
         * Verify that SecurityConfig simply returns the same instance.
         */

        AuthenticationManager authManager = mock(AuthenticationManager.class);
        AuthenticationConfiguration config = mock(AuthenticationConfiguration.class);

        // Simulate Spring returning an AuthenticationManager
        when(config.getAuthenticationManager()).thenReturn(authManager);

        AuthenticationManager result = securityConfig.authenticationManager(config);

        // Assertions
        assertNotNull(result, "AuthenticationManager should not be null");
        assertEquals(authManager, result, "Returned manager must match the mocked one");

        // Ensure SecurityConfig is calling Spring’s method exactly once
        verify(config, times(1)).getAuthenticationManager();
    }

    @Test
    void testRestTemplateBeanCreation() {
        /*
         * RestTemplate has no special configuration.
         * Ensure that a non-null instance is created.
         */

        RestTemplate template = securityConfig.restTemplate();

        assertNotNull(template, "RestTemplate bean should not be null");
    }
}
